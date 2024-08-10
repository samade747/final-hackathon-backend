import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  OK,
  NOTFOUND,
} from "../constants/httpStatus.js";
import { responseMessages } from "../constants/responseMessages.js";
import Course from "../models/Course.js";
import pkg from "jsonwebtoken";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import Slot from "../models/Slot.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  const {
    fullName,
    email,
    fatherEmail,
    phoneNumber,
    courseName,
    batchNumber,
    slotId,
    rollNumber,
    profilePicture,
  } = req.body;

  try {
    if (
      !fullName ||
      !email ||
      !fatherEmail ||
      !phoneNumber ||
      !courseName ||
      !batchNumber ||
      !slotId ||
      !rollNumber ||
      !profilePicture
    ) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
    }

    const checkEmail = await Student.findOne({ Email: email });
    if (checkEmail) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
        );
    }

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

    const checkCourse = await Course.findOne({ CourseName: courseName });
    if (!checkCourse) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.INVALID_COURSE })
        );
    }

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

    const checkBatch = await Batch.findOne({
      CourseName: courseName,
      BatchNumber: batchNumber,
    });
    if (!checkBatch) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.INVALID_BATCH })
        );
    }

    const checkExpiry = new Date(checkBatch.EndDate);
    if (checkExpiry < new Date()) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.EXPIRED_BATCH })
        );
    }

    const checkSlot = await Slot.findOne({ SlotId: slotId });
    if (!checkSlot || checkSlot.CourseName !== courseName) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.INVALID_SLOT })
        );
    }

    const checkRollNumber = await Student.findOne({ RollNumber: rollNumber });
    if (checkRollNumber) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.ROLL_NUMBER_EXISTS,
        })
      );
    }

    const student = new Student({
      FullName: fullName,
      Email: email,
      FatherEmail: fatherEmail,
      PhoneNumber: phoneNumber,
      CourseName: courseName,
      BatchNumber: batchNumber,
      SlotId: slotId,
      RollNumber: rollNumber,
      ProfilePicture: profilePicture,
    });

    const data = await student.save();

    await Slot.findOneAndUpdate(
      { SlotId: slotId },
      { $push: { StudentsId: data._id } },
      { new: true }
    );

    res.status(CREATED).json({
      status: true,
      message: responseMessages.STUDENT_ADDED,
      data: data,
    });
  } catch (error) {
    console.error(error);
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
  const {
    fullName,
    email,
    fatherEmail,
    phoneNumber,
    courseName,
    batchNumber,
    slotId,
    rollNumber,
    profilePicture,
  } = req.body;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.INVALID_ID,
        })
      );
    }

    // image update
    if (profilePicture) {
      student.ProfilePicture = profilePicture;
    }

    if (email) {
      const checkEmail = await Student.findOne({
        Email: email,
        _id: { $ne: id },
      });
      if (checkEmail) {
        return res
          .status(ALREADYEXISTS)
          .send(
            sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
          );
      } else {
        student.Email = email;
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
        student.FatherEmail = fatherEmail;
      }
    }

    if (phoneNumber) {
      const checkPhoneNumber = await Student.findOne({
        PhoneNumber: phoneNumber,
        _id: { $ne: id },
      });
      if (checkPhoneNumber) {
        return res
          .status(ALREADYEXISTS)
          .send(
            sendError({ status: false, message: responseMessages.PHONE_EXISTS })
          );
      } else {
        student.PhoneNumber = phoneNumber;
      }
    }

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
        student.CourseName = courseName;
      }
    }

    if (batchNumber || courseName) {
      const checkBatch = await Batch.findOne({
        BatchNumber: batchNumber || student.BatchNumber,
        CourseName: courseName || student.CourseName,
      });
      if (!checkBatch) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.INVALID_BATCH,
          })
        );
      } else {
        const checkExpiry = new Date(checkBatch.Expiry);
        if (checkExpiry < new Date()) {
          return res.status(BADREQUEST).send(
            sendError({
              status: false,
              message: responseMessages.EXPIRED_BATCH,
            })
          );
        }

        student.BatchNumber = batchNumber || student.BatchNumber;
        student.CourseName = courseName || student.CourseName;
      }
    }

    let oldSlotId = student.SlotId;
    if (slotId) {
      const checkSlot = await Slot.findOne({ SlotId: slotId });
      if (!checkSlot || checkSlot.CourseName !== student.CourseName) {
        return res
          .status(BADREQUEST)
          .send(
            sendError({ status: false, message: responseMessages.INVALID_SLOT })
          );
      } else {
        student.SlotId = slotId;
      }
    }

    if (rollNumber) {
      const checkRollNumber = await Student.findOne({
        RollNumber: rollNumber,
        _id: { $ne: id },
      });
      if (checkRollNumber) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.ROLL_NUMBER_EXISTS,
          })
        );
      } else {
        student.RollNumber = rollNumber;
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: student },
      { new: true }
    );

    if (slotId && oldSlotId !== slotId) {
      await Slot.findOneAndUpdate(
        { SlotId: slotId },
        { $push: { StudentsId: updatedStudent._id } },
        { new: true }
      );
      await Slot.findOneAndUpdate(
        { SlotId: oldSlotId },
        { $pull: { StudentsId: updatedStudent._id } }
      );
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
          message: responseMessages.INVALID_ID,
        })
      );
    }

    await Student.findByIdAndDelete(req.params.id);
    await Slot.findOneAndUpdate(
      { SlotId: student.SlotId },
      { $pull: { StudentsId: student._id } }
    );

    res.status(OK).send(
      sendSuccess({
        status: true,
        message: responseMessages.STUDENT_DELETED,
      })
    );
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
