import express from 'express';
import {
  getUnits,
  getUnitById,
  createUnit,
  updateUnitStatus,
} from '../controllers/unitController.js';

const router = express.Router();

router.get('/', getUnits);
router.post('/', createUnit);
router.get('/:id', getUnitById);
router.patch('/:id/status', updateUnitStatus);

export default router;
