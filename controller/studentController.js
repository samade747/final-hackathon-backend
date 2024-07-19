import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  OK,
} from "../constants/httpStatus.js";
import { responseMessages } from "../constants/responseMessages.js";
import Course from "../models/Course.js";
import pkg from "jsonwebtoken";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import Slot from "../models/Slot.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  console.log(req.body);
  const {
    fullName,
    email,
    fatherEmail,
    phoneNumber,
    courseName,
    batchNumber,
    slotId,
    rollNumber,
  } = req.body;

  try {
    // Check for missing fields
    if (
      !fullName ||
      !email ||
      !fatherEmail ||
      !phoneNumber ||
      !courseName ||
      !batchNumber ||
      !slotId ||
      !rollNumber
    ) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
    }

    // Check if student email already exists
    const checkEmail = await Student.findOne({ Email: email });
    if (checkEmail) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
        );
    }

    // Check if student father's email already exists
    const checkFatherEmail = await Student.findOne({
      FatherEmail: fatherEmail,
    });
    if (checkFatherEmail) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.FATHER_EMAIL_EXISTS,
        })
      );
    }

    // check course is exsists
    const checkCourse = await Course.findOne({ CourseName: courseName });
    if (!checkCourse) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.INVALID_COURSE })
        );
    }

    // Check if student phone number already exists
    const checkPhoneNumber = await Student.findOne({
      PhoneNumber: phoneNumber,
    });
    if (checkPhoneNumber) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.PHONE_EXISTS })
        );
    }

    // Validate batch existence and validity
    const checkBatch = await Batch.findOne({
      CourseName: courseName,
      BatchNumber: batchNumber,
    });

    console.log(checkBatch);

    if (!checkBatch) {
      console.log("Invalid Batch", { batchNumber, courseName }); // Log for debugging
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.INVALID_BATCH })
        );
    }

    // Check if batch has expired
    const checkExpiry = new Date(checkBatch.EndDate);
    if (checkExpiry < new Date()) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.EXPIRED_BATCH })
        );
    }

    // Validate slot existence and course match
    const checkSlot = await Slot.findOne({ _id: slotId });
    if (!checkSlot) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.INVALID_SLOT })
        );
    }
    if (checkSlot.CourseName !== courseName) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: "This slot is not for this course",
        })
      );
    }

    // check the rollNumber is unique
    const checkRollNumber = await Student.findOne({ RollNumber: rollNumber });
    if (checkRollNumber) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.ROLL_NUMBER_EXISTS,
        })
      );
    }

    // Create new student object
    const obj = {
      FullName: fullName,
      Email: email,
      FatherEmail: fatherEmail,
      PhoneNumber: phoneNumber,
      CourseName: courseName,
      BatchNumber: batchNumber,
      SlotId: slotId,
      RollNumber: rollNumber,
    };
    console.log(obj);
    const student = new Student(obj);
    const data = await student.save();

    // Update slot's StudentsId array
    await Slot.findByIdAndUpdate(
      slotId,
      { $push: { StudentsId: data._id } },
      { new: true }
    );

    // Respond with success message
    res.status(CREATED).json({
      status: true,
      message: responseMessages.STUDENT_ADDED,
      data: data,
    });
  } catch (error) {
    console.error(error); // Log any unexpected errors
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const {
    fullName,
    email,
    fatherEmail,
    phoneNumber,
    courseName,
    batchNumber,
    slotId,
    rollNumber,
  } = req.body;

  try {
    const checkId = await Student.findOne({ _id: id });
    if (!checkId) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.INVALID_ID,
        })
      );
    }

    // check if email already exists
    if (email) {
      const checkEmail = await Student.findOne({
        Email: email,
        _id: { $ne: id },
      });
      if (checkEmail) {
        return res.status(ALREADYEXISTS).send(
          sendError({
            status: false,
            message: responseMessages.EMAIL_EXISTS,
          })
        );
      } else {
        checkId.Email = email;
      }
    }

    if (fatherEmail) {
      const checkFatherEmail = await Student.findOne({
        FatherEmail: fatherEmail,
        _id: { $ne: id },
      });
      if (checkFatherEmail) {
        return res.status(ALREADYEXISTS).send(
          sendError({
            status: false,
            message: responseMessages.FATHER_EMAIL_EXISTS,
          })
        );
      } else {
        checkId.FatherEmail = fatherEmail;
      }
    }

    // check if phone number already exists
    if (phoneNumber) {
      const checkPhoneNumber = await Student.findOne({
        PhoneNumber: phoneNumber,
        _id: { $ne: id },
      });
      if (checkPhoneNumber) {
        return res.status(ALREADYEXISTS).send(
          sendError({
            status: false,
            message: responseMessages.PHONE_EXISTS,
          })
        );
      } else {
        checkId.PhoneNumber = phoneNumber;
      }
    }

    //check if course is exsists
    if (courseName) {
      const checkCourse = await Course.findOne({ CourseName: courseName });
      if (!checkCourse) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.INVALID_COURSE,
          })
        );
      } else {
        checkId.CourseName = courseName;
      }
    }

    // check if batch is valid and not expired
    if (batchNumber || courseName) {
      const checkBatch = await Batch.findOne({
        BatchNumber: batchNumber || checkId.BatchNumber,
        CourseName: courseName || checkId.CourseName,
      });
      console.log(checkBatch + "=====>>> checkBatch");
      if (!checkBatch) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.INVALID_BATCH,
          })
        );
      } else {
        // check if batch is expired
        const checkExpiry = new Date(checkBatch.Expiry);
        if (checkExpiry < new Date()) {
          return res.status(BADREQUEST).send(
            sendError({
              status: false,
              message: responseMessages.EXPIRED_BATCH,
            })
          );
        }

        checkId.BatchNumber = batchNumber || checkId.BatchNumber;
        checkId.CourseName = courseName || checkId.CourseName;
      }
    }

    let oldSlotId = checkId.SlotId;
    // check if slot is valid
    if (slotId) {
      const checkSlot = await Slot.findById(slotId);
      if (!checkSlot) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.INVALID_SLOT,
          })
        );
      } else {
        const checkCourseName = checkSlot.CourseName;
        const checkBatchNumber = checkSlot.BatchNumber;
        if (
          checkId.CourseName !== checkCourseName ||
          checkId.BatchNumber !== checkBatchNumber
        ) {
          return res.status(BADREQUEST).send(
            sendError({
              status: false,
              message: responseMessages.INVALID_SLOT,
            })
          );
        } else {
          checkId.SlotId = slotId;
        }
      }
    }

    if (batchNumber || courseName) {
      // check the slot if the slot is for this course or batch
      const slot = await Slot.findById(checkId.SlotId);
      if (slot) {
        const checkCourseName = slot.CourseName;
        const checkBatchNumber = slot.BatchNumber;
        if (
          checkId.CourseName !== checkCourseName ||
          checkId.BatchNumber !== checkBatchNumber
        ) {
          return res.status(BADREQUEST).send(
            sendError({
              status: false,
              message: responseMessages.INVALID_SLOT,
            })
          );
        }
      }
    }

    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(id, checkId, {
      new: true,
    });

    // Update the slot's StudentsId array if slotId has changed
    if (slotId) {
      const slot = await Slot.findById(slotId);
      if (slot) {
        const updated = [...slot.StudentsId, updatedStudent._id];
        await Slot.updateOne({ _id: slotId }, { StudentsId: updated });

        // Remove the student from the old slot's StudentsId array
        const oldSlot = await Slot.findById(oldSlotId);
        if (oldSlot) {
          const oldUpdated = oldSlot.StudentsId.filter(
            (studentId) =>
              studentId.toString() !== updatedStudent._id.toString()
          );
          await Slot.updateOne({ _id: oldSlotId }, { StudentsId: oldUpdated });
        }
      }
    }

    res.status(OK).json({
      status: true,
      message: responseMessages.STUDENT_UPDATED,
      data: updatedStudent,
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        data: null,
      })
    );
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Student not found",
        })
      );
    } else {
      const deleted = await Student.findByIdAndDelete(req.params.id);

      // update the slot student array
      const slot = await Slot.findOne({ _id: student.SlotId });
      if (slot) {
        const updated = slot.StudentsId.filter(
          (studentId) => studentId.toString() !== deleted._id.toString()
        );
        await Slot.updateOne({ _id: slot._id }, { StudentsId: updated });
      }
      res.status(OK);
      res.json({
        status: true,
        message: "Student deleted successfully",
      });
    }
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

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(OK);
    res.json({
      status: true,
      message: "Students fetched successfully",
      data: students,
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

export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Student not found",
        })
      );
    }
    res.status(OK);
    res.json({
      status: true,
      message: "Student fetched successfully",
      data: student,
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
