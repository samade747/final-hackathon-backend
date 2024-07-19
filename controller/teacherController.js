import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  NOTFOUND,
  OK,
} from "../constants/httpStatus.js";
import { responseMessages } from "../constants/responseMessages.js";
import Slot from "../models/Slot.js";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import pkg from "jsonwebtoken";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  const { teacherName, email, phoneNumber, teacherOf, teacherId } = req.body;

  try {
    if (!teacherName || !email || !phoneNumber || !teacherOf || !teacherId) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
      // .send("Missing Fields");
    } else {
      const checkEmail = await Teacher.findOne({ Email: email });
      if (checkEmail) {
        return res
          .status(ALREADYEXISTS)
          .send(
            sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
          );
      }

      const checkPhoneNumber = await Teacher.findOne({
        PhoneNumber: phoneNumber,
      });
      if (checkPhoneNumber) {
        return res
          .status(ALREADYEXISTS)
          .send(
            sendError({ status: false, message: responseMessages.PHONE_EXISTS })
          );
      }

      const checkTeacherId = await Teacher.findOne({ TeacherId: teacherId });
      if (checkTeacherId) {
        return res.status(ALREADYEXISTS).send(
          sendError({
            status: false,
            message: responseMessages.TEACHERID_EXISTS,
          })
        );
      }

      // check the course is exists
      const checkCourse = await Course.findOne({ CourseName: teacherOf });
      if (!checkCourse) {
        return res.status(NOTFOUND).send(
          sendError({
            status: false,
            message: responseMessages.COURSE_NOT_FOUND,
          })
        );
      }

      const obj = {
        TeacherName: teacherName,
        Email: email,
        PhoneNumber: phoneNumber,
        TeacherOf: teacherOf,
        TeacherId: teacherId,
      };

      const teacher = new Teacher(obj);

      // update the course array
      const course = await Course.findOneAndUpdate(
        { CourseName: teacherOf },
        { $push: { Teachers: teacher._id } },
        { new: true }
      );

      const data = await teacher.save();
      res.status(OK);
      res.json({
        status: true,
        message: "Teacher added successfully",
        data: data,
      });
    }
  } catch (error) {
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        data: null,
      })
    );

    console.log(error);
  }
};

export const update = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  const { id } = req.params;
  const { teacherName, email, phoneNumber, teacherOf, teacherId } = req.body;

  try {
    // get the teacher
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: responseMessages.TEACHER_NOT_FOUND,
        })
      );
    }

    // check the email
    const checkEmail = await Teacher.findOne({ Email: req.body.email });
    if (checkEmail) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
        );
    }

    const checkPhoneNumber = await Teacher.findOne({
      PhoneNumber: req.body.phoneNumber,
    });
    if (checkPhoneNumber) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.PHONE_EXISTS })
        );
    }

    const checkTeacherId = await Teacher.findOne({
      TeacherId: req.body.teacherId,
    });
    if (checkTeacherId) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.TEACHERID_EXISTS,
        })
      );
    }

    // check the course is exists
    const checkCourse = await Course.findOne({ CourseName: teacherOf });
    if (!checkCourse) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: responseMessages.COURSE_NOT_FOUND,
        })
      );
    }

    const data = {
      TeacherName: teacherName && teacherName,
      Email: email && email,
      PhoneNumber: phoneNumber && phoneNumber,
      TeacherOf: teacherOf && teacherOf,
      TeacherId: teacherId && teacherId,
    };

    const updated = await Teacher.findByIdAndUpdate(
      { _id: req.params.id },
      data,
      { new: true }
    );

    if (teacherOf) {
      const updateCourse = await Course.updateMany(
        { CourseName: teacherOf },
        { $push: { Teachers: req.params.id } }
      );

      const oldCourse = await Course.updateMany(
        { CourseName: teacher.TeacherOf },
        { $pull: { Teachers: req.params.id } }
      );
    }

    res.status(OK);
    res.json({
      status: true,
      message: "Teacher updated successfully",
      data: updated,
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

export const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Find and delete the teacher
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

    if (!deletedTeacher) {
      return res.status(NOTFOUND).json({
        status: false,
        message: "Teacher not found",
      });
    }

    // Remove teacher from slots
    await Slot.updateMany(
      { teacherId: teacherId },
      { $set: { teacherId: "" } }
    );

    // update the course array
    await Course.updateMany(
      { CourseName: deletedTeacher.TeacherOf },
      { $pull: { Teachers: deletedTeacher._id } }
    );

    res.status(OK).json({
      status: true,
      message: "Teacher deleted successfully and removed from slots",
    });
  } catch (error) {
    console.error(error);
    return res.status(INTERNALERROR).json(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(OK);
    res.json({
      status: true,
      message: "Teachers fetched successfully",
      data: teachers,
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

export const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Teacher not found",
        })
      );
    }

    res.status(OK);
    res.json({
      status: true,
      message: "Teacher fetched successfully",
      data: teacher,
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
