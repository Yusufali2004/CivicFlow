import express from 'express';
import {
  getIncidents,
  getIncidentById,
  createIncident,
  assignUnitWithTransaction,
  resolveIncidentWithTransaction,
} from '../controllers/incidentController.js';

const router = express.Router();

router.get('/', getIncidents);
router.post('/', createIncident);
router.get('/:id', getIncidentById);
router.post('/:id/assign', assignUnitWithTransaction);
router.post('/:id/resolve', resolveIncidentWithTransaction);

export default router;
