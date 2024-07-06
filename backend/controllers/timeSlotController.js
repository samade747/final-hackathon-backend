import TimeSlot from '../models/TimeSlot.js';

// Create a new time slot
export const createTimeSlot = async (req, res) => {
  const { startTime, endTime, assignedTeacher, dayOfWeek } = req.body;

  try {
    const timeSlot = new TimeSlot({ startTime, endTime, assignedTeacher, dayOfWeek });
    await timeSlot.save();
    res.status(201).json(timeSlot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all time slots
export const getTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find().populate('assignedTeacher', 'name');
    res.json(timeSlots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update a time slot by ID
export const updateTimeSlot = async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, assignedTeacher, dayOfWeek } = req.body;

  try {
    const timeSlot = await TimeSlot.findByIdAndUpdate(id, { startTime, endTime, assignedTeacher, dayOfWeek }, { new: true });
    if (!timeSlot) return res.status(404).json({ message: 'Time slot not found' });
    res.json(timeSlot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a time slot by ID
export const deleteTimeSlot = async (req, res) => {
  const { id } = req.params;

  try {
    const timeSlot = await TimeSlot.findByIdAndDelete(id);
    if (!timeSlot) return res.status(404).json({ message: 'Time slot not found' });
    res.json({ message: 'Time slot deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
