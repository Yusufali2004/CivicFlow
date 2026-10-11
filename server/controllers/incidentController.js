import mongoose from 'mongoose';
import { Incident } from '../models/Incident.js';
import { ResponseUnit } from '../models/ResponseUnit.js';
import { ResponseEvent } from '../models/ResponseEvent.js';

// GET all incidents (with filters for status, severity, area, type)
export const getIncidents = async (req, res) => {
  try {
    const { status, severity, area, type, search } = req.query;
    const filter = {};

    if (status && status !== 'ALL') filter.status = status;
    if (severity && severity !== 'ALL') filter.severity = severity;
    if (area && area !== 'ALL') filter.area = area;
    if (type && type !== 'ALL') filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { incidentNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { locationDetails: { $regex: search, $options: 'i' } },
      ];
    }

    const incidents = await Incident.find(filter)
      .populate('assignedUnit')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single incident by ID
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('assignedUnit');
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    // Also fetch associated events for timeline
    const events = await ResponseEvent.find({ incidentId: incident._id })
      .populate('unitId')
      .sort({ timestamp: 1 });

    res.json({ success: true, data: incident, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create incident
export const createIncident = async (req, res) => {
  try {
    const { title, type, severity, area, locationDetails, description } = req.body;

    if (!title || !type || !area) {
      return res.status(400).json({
        success: false,
        error: 'Title, Type, and Area are required fields',
      });
    }

    const newIncident = await Incident.create({
      title,
      type,
      severity: severity || 'MEDIUM',
      area,
      locationDetails: locationDetails || '',
      description: description || '',
      status: 'REPORTED',
      reportedAt: new Date(),
    });

    // Create initial REPORTED event
    await ResponseEvent.create({
      incidentId: newIncident._id,
      eventType: 'REPORTED',
      timestamp: new Date(),
      notes: `Incident reported: ${title} in ${area}`,
      actor: 'Public Citizen / Smart Sensor',
    });

    res.status(201).json({ success: true, data: newIncident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CORE FEATURE: MULTI-DOCUMENT MONGODB TRANSACTION
 * Assign an available Response Unit to an Incident
 * Operations:
 * 1. Start MongoDB session & startTransaction()
 * 2. Find and validate Incident
 * 3. Find and validate Response Unit (must be AVAILABLE)
 * 4. Update Incident status -> ASSIGNED, assign unit
 * 5. Update ResponseUnit status -> DISPATCHED, assign current incident
 * 6. Create responseEvents document with DISPATCHED
 * 7. Commit transaction
 * On failure: abortTransaction() and rollback
 */
export const assignUnitWithTransaction = async (req, res) => {
  const { id: incidentId } = req.params;
  const { unitId, simulateFailure, notes, actor } = req.body;

  if (!unitId) {
    return res.status(400).json({ success: false, error: 'Unit ID is required' });
  }

  const steps = [];
  const startTime = Date.now();
  const session = await mongoose.startSession();

  try {
    // 1. Start MongoDB session & transaction
    session.startTransaction();
    steps.push({
      step: 1,
      title: 'Session Started',
      status: 'SUCCESS',
      detail: `MongoDB Client Session started. Transaction in progress.`,
      timestamp: new Date(),
    });

    // 2. Find and validate the incident
    const incident = await Incident.findById(incidentId).session(session);
    if (!incident) {
      throw new Error(`Incident with ID ${incidentId} does not exist`);
    }
    if (incident.status === 'RESOLVED') {
      throw new Error(`Incident #${incident.incidentNumber} is already RESOLVED. Cannot assign unit.`);
    }
    if (incident.status === 'ASSIGNED' && incident.assignedUnit) {
      throw new Error(`Incident #${incident.incidentNumber} already has an assigned unit.`);
    }
    steps.push({
      step: 2,
      title: 'Incident Verified',
      status: 'SUCCESS',
      detail: `Incident ${incident.incidentNumber} verified (${incident.type} in ${incident.area}). Current status: ${incident.status}`,
      timestamp: new Date(),
    });

    // 3. Find and validate the response unit
    const unit = await ResponseUnit.findById(unitId).session(session);
    if (!unit) {
      throw new Error(`Response unit with ID ${unitId} does not exist`);
    }
    if (unit.status !== 'AVAILABLE') {
      throw new Error(
        `Unit ${unit.unitCode} (${unit.type}) is currently ${unit.status}. Only AVAILABLE units can be dispatched!`
      );
    }
    steps.push({
      step: 3,
      title: 'Response Unit Verified',
      status: 'SUCCESS',
      detail: `Unit ${unit.unitCode} verified. Status: AVAILABLE (Station: ${unit.stationArea})`,
      timestamp: new Date(),
    });

    // Viva demo: allow explicit simulation of transaction failure to test rollback
    if (simulateFailure) {
      throw new Error(
        'SIMULATED ERROR: Simulated hardware dispatch failure to demonstrate abortTransaction() rollback!'
      );
    }

    // 4. Update incident status to ASSIGNED
    incident.status = 'ASSIGNED';
    incident.assignedUnit = unit._id;
    incident.responseNotes = notes || `Unit ${unit.unitCode} dispatched to ${incident.locationDetails || incident.area}`;
    await incident.save({ session });
    steps.push({
      step: 4,
      title: 'Incident Updated',
      status: 'SUCCESS',
      detail: `Incident ${incident.incidentNumber} status changed to ASSIGNED. Assigned unit set to ${unit.unitCode}.`,
      timestamp: new Date(),
    });

    // 5. Update response unit status to DISPATCHED
    unit.status = 'DISPATCHED';
    unit.currentIncident = incident._id;
    await unit.save({ session });
    steps.push({
      step: 5,
      title: 'Response Unit Updated',
      status: 'SUCCESS',
      detail: `Unit ${unit.unitCode} status changed to DISPATCHED. Linked to incident ${incident.incidentNumber}.`,
      timestamp: new Date(),
    });

    // 6. Create a responseEvents document
    const [createdEvent] = await ResponseEvent.create(
      [
        {
          incidentId: incident._id,
          unitId: unit._id,
          eventType: 'DISPATCHED',
          timestamp: new Date(),
          notes: notes || `Dispatched ${unit.type} (${unit.unitCode}) from ${unit.stationArea} station to ${incident.area}`,
          actor: actor || 'Smart City Dispatcher Hub',
        },
      ],
      { session }
    );
    steps.push({
      step: 6,
      title: 'Response Event Created',
      status: 'SUCCESS',
      detail: `Audit event #${createdEvent._id.toString().slice(-6)} created with status DISPATCHED.`,
      timestamp: new Date(),
    });

    // 7. Commit transaction
    await session.commitTransaction();
    steps.push({
      step: 7,
      title: 'Transaction Committed',
      status: 'SUCCESS',
      detail: `All 3 collection writes committed atomically to MongoDB replica set in ${Date.now() - startTime}ms.`,
      timestamp: new Date(),
    });

    session.endSession();

    // Populate incident assignedUnit for response
    await incident.populate('assignedUnit');

    return res.json({
      success: true,
      transactionStatus: 'COMMITTED',
      executionTimeMs: Date.now() - startTime,
      steps,
      incident,
      unit,
      event: createdEvent,
    });
  } catch (error) {
    // ABORT TRANSACTION AND ROLLBACK ALL CHANGES
    await session.abortTransaction();
    session.endSession();

    steps.push({
      step: 8,
      title: 'Transaction Aborted',
      status: 'FAILED',
      detail: `Transaction aborted: ${error.message}`,
      timestamp: new Date(),
    });
    steps.push({
      step: 9,
      title: 'Changes Rolled Back',
      status: 'ROLLED_BACK',
      detail: 'Atomic rollback completed. All documents reverted to their exact state prior to this transaction.',
      timestamp: new Date(),
    });

    return res.status(400).json({
      success: false,
      transactionStatus: 'ABORTED',
      executionTimeMs: Date.now() - startTime,
      error: error.message,
      steps,
    });
  }
};

/**
 * RESOLVE INCIDENT (also executed inside a MongoDB Transaction)
 * 1. Start Session & Transaction
 * 2. Find incident, verify it exists & not already resolved
 * 3. Update Incident status to RESOLVED and set resolvedAt
 * 4. If assigned unit exists, update ResponseUnit back to AVAILABLE
 * 5. Create ResponseEvent document with eventType RESOLVED
 * 6. Commit transaction
 */
export const resolveIncidentWithTransaction = async (req, res) => {
  const { id: incidentId } = req.params;
  const { notes, actor } = req.body;

  const steps = [];
  const startTime = Date.now();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    steps.push({
      step: 1,
      title: 'Session Started',
      status: 'SUCCESS',
      detail: 'MongoDB Client Session started for resolution workflow.',
      timestamp: new Date(),
    });

    const incident = await Incident.findById(incidentId).session(session);
    if (!incident) {
      throw new Error(`Incident with ID ${incidentId} not found`);
    }
    if (incident.status === 'RESOLVED') {
      throw new Error(`Incident #${incident.incidentNumber} is already resolved!`);
    }

    steps.push({
      step: 2,
      title: 'Incident Verified',
      status: 'SUCCESS',
      detail: `Incident ${incident.incidentNumber} verified for resolution.`,
      timestamp: new Date(),
    });

    // Free assigned unit if any
    let unit = null;
    if (incident.assignedUnit) {
      unit = await ResponseUnit.findById(incident.assignedUnit).session(session);
      if (unit) {
        unit.status = 'AVAILABLE';
        unit.currentIncident = null;
        await unit.save({ session });

        steps.push({
          step: 3,
          title: 'Response Unit Released',
          status: 'SUCCESS',
          detail: `Unit ${unit.unitCode} status restored to AVAILABLE and unlinked from incident.`,
          timestamp: new Date(),
        });
      }
    }

    // Update incident
    incident.status = 'RESOLVED';
    incident.resolvedAt = new Date();
    incident.responseNotes = notes || 'Incident successfully resolved on-site.';
    await incident.save({ session });

    steps.push({
      step: 4,
      title: 'Incident Status Updated',
      status: 'SUCCESS',
      detail: `Incident ${incident.incidentNumber} marked RESOLVED with completion timestamp.`,
      timestamp: new Date(),
    });

    // Create RESOLVED event
    const [event] = await ResponseEvent.create(
      [
        {
          incidentId: incident._id,
          unitId: unit ? unit._id : null,
          eventType: 'RESOLVED',
          timestamp: new Date(),
          notes: notes || `Case closed. Unit ${unit ? unit.unitCode : 'N/A'} released back to patrol pool.`,
          actor: actor || 'Field Unit / Control Center',
        },
      ],
      { session }
    );

    steps.push({
      step: 5,
      title: 'Resolution Event Logged',
      status: 'SUCCESS',
      detail: `Event RESOLVED logged in audit ledger.`,
      timestamp: new Date(),
    });

    await session.commitTransaction();
    steps.push({
      step: 6,
      title: 'Transaction Committed',
      status: 'SUCCESS',
      detail: `Resolution transaction committed atomically in ${Date.now() - startTime}ms.`,
      timestamp: new Date(),
    });

    session.endSession();

    await incident.populate('assignedUnit');

    res.json({
      success: true,
      transactionStatus: 'COMMITTED',
      executionTimeMs: Date.now() - startTime,
      steps,
      incident,
      unit,
      event,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    steps.push({
      step: 'ABORT',
      title: 'Transaction Aborted',
      status: 'FAILED',
      detail: error.message,
      timestamp: new Date(),
    });

    res.status(400).json({
      success: false,
      transactionStatus: 'ABORTED',
      error: error.message,
      steps,
    });
  }
};
