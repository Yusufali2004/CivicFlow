import { Incident } from '../models/Incident.js';
import { ResponseUnit } from '../models/ResponseUnit.js';
import { ResponseEvent } from '../models/ResponseEvent.js';

/**
 * GET Analytics & Metrics using MongoDB Aggregation Pipelines
 */
export const getAnalytics = async (req, res) => {
  try {
    // 1. Incidents By Type Aggregation
    const incidentsByTypePromise = Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 2. Incidents By Severity Aggregation
    const incidentsBySeverityPromise = Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $project: { severity: '$_id', count: 1, _id: 0 } },
    ]);

    // 3. Incidents By Area (Bengaluru zones) Aggregation
    const incidentsByAreaPromise = Incident.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $project: { area: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 4. Active vs Resolved Aggregation
    const activeVsResolvedPromise = Incident.aggregate([
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$status', 'RESOLVED'] }, 'Resolved', 'Active'],
          },
          count: { $sum: 1 },
        },
      },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    // 5. Response Units Status Breakdown Aggregation
    const unitsByStatusPromise = ResponseUnit.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    // 6. Response Units By Type Aggregation
    const unitsByTypePromise = ResponseUnit.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] },
          },
          dispatched: {
            $sum: { $cond: [{ $eq: ['$status', 'DISPATCHED'] }, 1, 0] },
          },
          busy: {
            $sum: { $cond: [{ $eq: ['$status', 'BUSY'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          total: 1,
          available: 1,
          dispatched: 1,
          busy: 1,
          _id: 0,
        },
      },
    ]);

    // 7. Average Resolution Time Aggregation (minutes)
    const avgResolutionPromise = Incident.aggregate([
      {
        $match: {
          resolvedAt: { $ne: null },
          reportedAt: { $ne: null },
        },
      },
      {
        $project: {
          durationMinutes: {
            $divide: [{ $subtract: ['$resolvedAt', '$reportedAt'] }, 60000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgMinutes: { $avg: '$durationMinutes' },
          minMinutes: { $min: '$durationMinutes' },
          maxMinutes: { $max: '$durationMinutes' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 8. Average Dispatch Lag Aggregation (time from incident reported to unit dispatched)
    const avgDispatchPromise = ResponseEvent.aggregate([
      { $match: { eventType: 'DISPATCHED' } },
      {
        $lookup: {
          from: 'incidents',
          localField: 'incidentId',
          foreignField: '_id',
          as: 'incident',
        },
      },
      { $unwind: '$incident' },
      {
        $project: {
          lagMinutes: {
            $divide: [{ $subtract: ['$timestamp', '$incident.reportedAt'] }, 60000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDispatchMinutes: { $avg: '$lagMinutes' },
          totalDispatches: { $sum: 1 },
        },
      },
    ]);

    // Execute pipelines in parallel
    const [
      incidentsByType,
      incidentsBySeverity,
      incidentsByArea,
      activeVsResolved,
      unitsByStatus,
      unitsByType,
      avgResolutionResult,
      avgDispatchResult,
      totalIncidents,
      totalUnits,
      resolvedIncidents,
      availableUnits,
      dispatchedUnits,
    ] = await Promise.all([
      incidentsByTypePromise,
      incidentsBySeverityPromise,
      incidentsByAreaPromise,
      activeVsResolvedPromise,
      unitsByStatusPromise,
      unitsByTypePromise,
      avgResolutionPromise,
      avgDispatchPromise,
      Incident.countDocuments(),
      ResponseUnit.countDocuments(),
      Incident.countDocuments({ status: 'RESOLVED' }),
      ResponseUnit.countDocuments({ status: 'AVAILABLE' }),
      ResponseUnit.countDocuments({ status: 'DISPATCHED' }),
    ]);

    const activeIncidents = totalIncidents - resolvedIncidents;
    const resolutionRate =
      totalIncidents > 0
        ? Number(((resolvedIncidents / totalIncidents) * 100).toFixed(1))
        : 0;

    const avgResolutionMinutes =
      avgResolutionResult.length > 0 && avgResolutionResult[0].avgMinutes != null
        ? Number(avgResolutionResult[0].avgMinutes.toFixed(1))
        : 18.5; // fallback default if new db

    const avgDispatchMinutes =
      avgDispatchResult.length > 0 && avgDispatchResult[0].avgDispatchMinutes != null
        ? Number(Math.max(1, avgDispatchResult[0].avgDispatchMinutes).toFixed(1))
        : 4.2;

    res.json({
      success: true,
      data: {
        summary: {
          totalIncidents,
          activeIncidents,
          resolvedIncidents,
          totalUnits,
          availableUnits,
          dispatchedUnits,
          resolutionRate,
          avgResolutionMinutes,
          avgDispatchMinutes,
        },
        incidentsByType,
        incidentsBySeverity,
        incidentsByArea,
        activeVsResolved,
        unitsByStatus,
        unitsByType,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
