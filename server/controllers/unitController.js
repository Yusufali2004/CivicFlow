import { ResponseUnit } from '../models/ResponseUnit.js';

// GET all response units
export const getUnits = async (req, res) => {
  try {
    const { status, type, area } = req.query;
    const filter = {};

    if (status && status !== 'ALL') filter.status = status;
    if (type && type !== 'ALL') filter.type = type;
    if (area && area !== 'ALL') filter.stationArea = area;

    const units = await ResponseUnit.find(filter)
      .populate('currentIncident')
      .sort({ type: 1, unitCode: 1 });

    res.json({ success: true, count: units.length, data: units });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single unit
export const getUnitById = async (req, res) => {
  try {
    const unit = await ResponseUnit.findById(req.params.id).populate('currentIncident');
    if (!unit) {
      return res.status(404).json({ success: false, error: 'Response unit not found' });
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create unit
export const createUnit = async (req, res) => {
  try {
    const { unitCode, type, stationArea, vehicleNumber, contactNumber } = req.body;

    if (!unitCode || !type || !stationArea) {
      return res.status(400).json({
        success: false,
        error: 'Unit Code, Type, and Station Area are required',
      });
    }

    const unit = await ResponseUnit.create({
      unitCode: unitCode.toUpperCase(),
      type,
      stationArea,
      vehicleNumber: vehicleNumber || '',
      contactNumber: contactNumber || '',
      status: 'AVAILABLE',
    });

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH update unit status
export const updateUnitStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['AVAILABLE', 'DISPATCHED', 'BUSY'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const unit = await ResponseUnit.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
