import express from 'express';
import { createTimeSlot, getTimeSlots, updateTimeSlot, deleteTimeSlot } from '../controllers/timeSlotController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create a new time slot
router.post('/', authMiddleware, createTimeSlot);

// Get all time slots
router.get('/', authMiddleware, getTimeSlots);

// Update a time slot by ID
router.put('/:id', authMiddleware, updateTimeSlot);

// Delete a time slot by ID
router.delete('/:id', authMiddleware, deleteTimeSlot);

export default router;
