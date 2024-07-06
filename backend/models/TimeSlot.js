import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: String, required: true }
});

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
export default TimeSlot;
