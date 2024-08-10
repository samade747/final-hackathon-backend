import { sendError, sendSuccess } from "../utils/responses.js";
import { INTERNALERROR, NOTFOUND, OK } from "../constants/httpStatus.js";
import pkg from "jsonwebtoken";
import Teacher from "../models/Teacher.js";
import Slot from "../models/Slot.js";
import Batch from "../models/Batch.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  const {
    courseName,
    batchNumber,
    startTime,
    endTime,
    days,
    teacherId,
    slotId,
  } = req.body;

  console.log("Received request:", req.body);

  try {
    // Check if all required fields are provided
    if (
      !courseName ||
      !batchNumber ||
      !startTime ||
      !endTime ||
      !days ||
      !teacherId ||
      !slotId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // check the slot  id is unique
    const checkSlotId = await Slot.findOne({ SlotId: slotId });
    console.log(checkSlotId + "===>>> checkSlotId");
    if (checkSlotId) {
      console.log(`SlotId ${slotId} already exists`);
      return res.status(400).json({ error: "SlotId already exists" });
    }

    // check the course name and batch number
    const checkCourseNameAndBatchNumber = await Batch.findOne({
      CourseName: courseName,
      BatchNumber: batchNumber,
    });
    console.log(
      checkCourseNameAndBatchNumber + "===>>> checkCourseNameAndBatchNumber"
    );
    if (!checkCourseNameAndBatchNumber) {
      console.log(
        `Batch not found for CourseName: ${courseName} and BatchNumber: ${batchNumber}`
      );
      return res.status(404).json({ error: "Batch not found" });
    }

    // Find the teacher by teacherId
    const teacher = await Teacher.findOne({ TeacherId: parseInt(teacherId) });
    console.log(teacher + "===>>> teacher");
    if (!teacher) {
      console.log(`Teacher not found for TeacherId: ${teacherId}`);
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if the teacher is assigned to the specified course
    if (teacher.TeacherOf !== courseName) {
      console.log(
        `Teacher ${teacher.TeacherName} is not assigned to course ${courseName}`
      );
      return res
        .status(403)
        .json({ error: "This Teacher is not assigned to this Course!" });
    }

    const existingSlot = await Slot.findOne({
      TeacherId: teacher.TeacherId,
      $or: [
        {
          $and: [
            { StartTime: { $lt: endTime } },
            { EndTime: { $gt: startTime } },
          ],
        },
        {
          $and: [
            { StartTime: { $gte: startTime } },
            { StartTime: { $lt: endTime } },
          ],
        },
        {
          $and: [
            { EndTime: { $gt: startTime } },
            { EndTime: { $lte: endTime } },
          ],
        },
      ],
      Days: { $in: days }, // Check if any day in 'days' array matches any day in 'Days' array
    });

    console.log(existingSlot + "===>>> existingSlot");
    if (existingSlot) {
      console.log(
        "Teacher already has a slot overlapping with the requested time and days"
      );
      return res.status(409).json({
        error:
          "Teacher already has a slot overlapping with the requested time and days",
      });
    }

    // Proceed to create the slot
    const newSlot = new Slot({
      CourseName: courseName,
      BatchNumber: batchNumber,
      StartTime: startTime,
      EndTime: endTime,
      Days: days,
      TeacherId: teacher.TeacherId,
      SlotId: slotId,
    });
    console.log(newSlot + "===>>> newSlot");

    const savedSlot = await newSlot.save();

    // Update the teacher's Slots array
    await Teacher.findByIdAndUpdate(
      teacher._id,
      { $push: { Slots: savedSlot._id } },
      { new: true }
    );

    // Update the batch's Slots array
    await Batch.findOneAndUpdate(
      { CourseName: courseName, BatchNumber: batchNumber },
      { $push: { Slots: savedSlot._id } },
      { new: true }
    );

    return res
      .status(201)
      .json({ message: "Slot added successfully", data: savedSlot });
  } catch (error) {
    console.error("Error adding slot:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Slot not found",
        })
      );
    }
    const teacherID = parseInt(slot.TeacherId);
    // Update the teacher's slots array
    await Teacher.findOneAndUpdate(
      { TeacherId: teacherID },
      { $pull: { Slots: slot._id } },
      { new: true }
    );

    // Update the batch's slots array
    await Batch.findOneAndUpdate(
      { CourseName: slot.CourseName, BatchNumber: slot.BatchNumber },
      { $pull: { Slots: slot._id } },
      { new: true }
    );

    // Delete the slot itself
    await Slot.findByIdAndDelete(req.params.id);

    // Send success response
    res.status(OK).json({
      status: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};

export const getSlots = async (req, res) => {
  try {
    const batches = await Slot.find();
    res.status(OK);
    res.json({
      status: true,
      message: "Batches fetched successfully",
      data: batches,
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};

export const getSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Slot not found",
        })
      );
    }
    res.status(OK);
    res.json({
      status: true,
      message: "Slot fetched successfully",
      data: slot,
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};

// update slot

export const update = async (req, res) => {
  const { id } = req.params; // Slot ID to update
  const {
    courseName,
    batchNumber,
    startTime,
    endTime,
    days,
    teacherId,
    slotId,
  } = req.body;

  try {
    // check the slot id is unique
    if (slotId) {
      const existingSlot = await Slot.findOne({ slotId, SlotId: { $ne: id } });
      if (existingSlot) {
        return res.status(409).json({ error: "Slot ID already exists" });
      }
    }

    // Find the slot by ID
    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Fetch the current teacher
    const currentTeacher = await Teacher.findOne({
      TeacherId: parseInt(slot.TeacherId),
    });
    if (!currentTeacher) {
      return res.status(404).json({ error: "Current teacher not found" });
    }

    // Check if teacherId is provided and update if necessary
    if (teacherId) {
      const teacher = await Teacher.findOne({ TeacherId: parseInt(teacherId) });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      // Check if the teacher is assigned to the specified course
      if (teacher.TeacherOf !== courseName || slot.courseName) {
        return res
          .status(403)
          .json({ error: "Teacher is not assigned to this course" });
      }
      slot.TeacherId = teacher.TeacherId;
    }

    // Check if startTime and endTime are provided and update if necessary
    if (startTime || endTime) {
      const existingSlot = await Slot.findOne({
        TeacherId: slot.TeacherId,
        $or: [
          {
            $and: [
              { StartTime: { $lt: endTime || slot.EndTime } },
              { EndTime: { $gt: startTime || slot.StartTime } },
            ],
          },
          {
            $and: [
              { StartTime: { $gte: startTime || slot.StartTime } },
              { StartTime: { $lt: endTime || slot.EndTime } },
            ],
          },
          {
            $and: [
              { EndTime: { $gt: startTime || slot.StartTime } },
              { EndTime: { $lte: endTime || slot.EndTime } },
            ],
          },
        ],
        _id: { $ne: id },
      });

      console.log(existingSlot + "===>>> existingSlot");
      if (existingSlot) {
        console.log(
          "Teacher already has a slot overlapping with the requested time and days"
        );
        return res.status(409).json({
          error:
            "Teacher already has a slot overlapping with the requested time and days",
        });
      }

      slot.StartTime = startTime || slot.StartTime;
      slot.EndTime = endTime || slot.EndTime;
    }

    // Check if days are provided and update if necessary
    if (days) {
      const existingSlot = await Slot.findOne({
        TeacherId: slot.TeacherId,
        _id: { $ne: id },
        StartTime: slot.StartTime,
        EndTime: slot.EndTime,
        Days: { $in: days },
      });

      if (existingSlot) {
        return res.status(409).json({
          error:
            "Teacher already has a slot overlapping with the requested time and days",
        });
      }

      slot.Days = days;
    }

    // Save the updated slot
    const updatedSlot = await slot.save();

    // Update the teacher's slot references
    if (teacherId && teacherId !== currentTeacher.TeacherId) {
      await Teacher.updateOne(
        { TeacherId: teacherId },
        { $push: { Slots: updatedSlot._id } } // Add the updatedSlot ID
      );
      await Teacher.updateOne(
        { TeacherId: currentTeacher.TeacherId },
        { $pull: { Slots: id } } // Remove the old slot ID
      );
    }

    return res.json({
      message: "Slot updated successfully",
      data: updatedSlot,
    });
  } catch (error) {
    console.error("Error updating slot:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
