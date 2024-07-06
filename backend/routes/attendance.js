import express from 'express';
import { markAttendance, getAttendance, getStudentAttendance, getClassAttendanceStatus } from '../controllers/attendanceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Mark attendance for a student
router.post('/', authMiddleware, markAttendance);

// Get all attendance records
router.get('/', authMiddleware, getAttendance);

// Get attendance records for a student
router.get('/:studentId', authMiddleware, getStudentAttendance);

// Get class attendance status for a specific time slot
router.post('/class-status', authMiddleware, getClassAttendanceStatus);

export default router;
