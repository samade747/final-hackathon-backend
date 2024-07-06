import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import TimeSlot from '../models/TimeSlot.js';

// Mark attendance for a student
export const markAttendance = async (req, res) => {
  const { studentId, timeSlotId } = req.body;

  try {
    const student = await User.findById(studentId);
    const timeSlot = await TimeSlot.findById(timeSlotId);

    if (!student || !timeSlot) {
      return res.status(404).json({ message: 'Student or time slot not found' });
    }

    const today = new Date();
    const attendance = new Attendance({
      studentId,
      teacherId: timeSlot.assignedTeacher,
      timeSlotId,
      date: today,
      status: 'Present'
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all attendance records
export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('studentId', 'name').populate('timeSlotId');
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get attendance records for a student
export const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;

  try {
    const attendance = await Attendance.find({ studentId }).populate('timeSlotId');
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get class attendance status (present/absent count) for a specific time slot
export const getClassAttendanceStatus = async (req, res) => {
  const { timeSlotId } = req.body;

  try {
    const presentCount = await Attendance.countDocuments({ timeSlotId, status: 'Present' });
    const absentCount = await Attendance.countDocuments({ timeSlotId, status: 'Absent' });

    res.json({ presentCount, absentCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
