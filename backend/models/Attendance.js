import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent'], required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
