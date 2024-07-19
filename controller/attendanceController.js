import Student from "../models/Student.js";
import Slot from "../models/Slot.js";
import Batch from "../models/Batch.js";
import Attendance from "../models/Attendance.js";
// mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    if (!rollNumber) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    // Find the student by ID
    const student = await Student.findOne({ RollNumber: rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const slot = await Slot.findById(student.SlotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check if current day and time match the slot's days and time range
    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
    });

    console.log(currentDay + "====>> currentTime");
    console.log(currentTime + "====>> currentTime");

    if (
      !slot.Days.includes(currentDay) ||
      currentTime < slot.StartTime ||
      currentTime > slot.EndTime
    ) {
      return res
        .status(400)
        .json({ message: "Current time does not match slot timings" });
    }

    // Check if the batch is expired
    const batch = await Batch.findOne({
      CourseName: student.CourseName,
      BatchNumber: student.BatchNumber,
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (new Date() > batch.EndDate) {
      return res.status(400).json({ message: "Batch is expired" });
    }

    // Check if the student has already marked attendance for the current day and time slot.

    const existingAttendance = await Attendance.findOne({
      RollNumber: student.RollNumber,
      SlotId: student.SlotId,
      Date: {
        // Query for the date range today
        $gte: new Date().setHours(0, 0, 0, 0), // Start of today
        $lt: new Date().setHours(23, 59, 59, 999), // End of today
      },
    });
    console.log(existingAttendance + "====>> existingAttendance");

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for this slot today" });
    }

    // Increment PresentDays for the student
    student.PresentDays += 1;
    student.TotalDays += 1;
    await student.save();

    // Save the attendance record
    const attendance = new Attendance({
      RollNumber: student.RollNumber,
      SlotId: slot._id,
      Date: new Date(),
      Status: "present",
    });
    await attendance.save();

    return res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// mark absent students
export const markAbsentStudents = async (req, res) => {
  try {
    checkHoliday = await Holiday.findOne({ Date: new Date() });
    console.log(checkHoliday + "====>> checkHoliday");
    if (checkHoliday) {
      return res
        .status(200)
        .json({ status: false, message: "today is Holiday" });
    }

    // Step 1: Fetch all slots that match the current day
    const currentDay = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    console.log(currentDay + "====>> currentDay");

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const slots = await Slot.find({ Days: currentDay }).populate("StudentsId");
    console.log(slots + "====>> slots");

    if (slots.length === 0) {
      console.log("No slots found for the current day.");
      return res.status(200).json({
        status: false,
        message: "No slots found for the current day.",
      });
    }

    // Step 2: Loop through each slot to mark absent students
    for (let slot of slots) {
      // Step 3: Retrieve students who are marked present for this slot
      const presentStudents = await Attendance.find({
        SlotId: slot._id,
        Date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        Status: "present",
      });
      console.log(presentStudents + "====>> presentStudents");

      // Step 4: Extract RollNumbers of present students
      const presentStudentRollNumbers = presentStudents.map(
        (att) => att.RollNumber
      );
      console.log(
        presentStudentRollNumbers + "====>> presentStudentRollNumbers"
      );

      // Step 5: Mark absent students
      const absentStudents = slot.StudentsId.filter(
        (student) => !presentStudentRollNumbers.includes(student.RollNumber)
      );
      console.log(absentStudents + "====>> absentStudents");

      // Step 6: Save attendance for absent students and update AbsentDays
      for (let student of absentStudents) {
        await Attendance.create({
          RollNumber: student.RollNumber,
          SlotId: slot._id,
          Date: new Date(),
          Status: "absent",
        });

        await Student.updateOne(
          { _id: student._id },
          { $inc: { AbsentDays: 1 }, $inc: { TotalDays: 1 } }
        );
      }
    }
    console.log("Absent students marked successfully.");

    res
      .status(200)
      .json({ status: true, message: "Absent students marked successfully" });
  } catch (error) {
    console.error("Error marking absent students:", error);
    res.status(500).json({
      status: false,
      message: "Error marking absent students",
      error: error.message,
    });
  }
};
