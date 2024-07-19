import Course from "../models/Course.js";
import mongoose from "mongoose";

//add
export const add = async (req, res) => {
  try {
    console.log(req.body, "====> req.body");
    const { courseName } = req.body;

    // missing feilds
    if (!courseName) {
      return res.status(400).send({ status: false, message: "Missing Fields" });
    }

    // check the courseName is already exists
    const checkCourseName = await Course.findOne({ CourseName: courseName });
    if (checkCourseName) {
      return res
        .status(409)
        .send({ status: false, message: "CourseName already exists" });
    }

    // create an object
    const newCourse = new Course({
      CourseName: courseName,
    });

    // save
    const course = await newCourse.save();

    // response send
    res.status(201).json({
      status: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// update
export const update = async (req, res) => {
  try {
    const { courseName } = req.body;
    const { id } = req.params;

    // check the selectedCourse is available
    const selectedCourse = await Course.findById(id);
    if (!selectedCourse) {
      return res
        .status(404)
        .send({ status: false, message: "Course not found" });
    }

    // check the courseName is already exists
    const checkCourseName = await Course.findOne({
      CourseName: courseName,
      _id: { $ne: id },
    });
    if (checkCourseName) {
      return res
        .status(409)
        .send({ status: false, message: "CourseName already exists" });
    }

    const data = {
      CourseName: courseName,
    };

    // update
    const course = await Course.findByIdAndUpdate(id, data, {
      new: true,
    });

    // response send
    res.status(200).json({
      status: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// delete

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOneAndDelete({ _id: id });
    if (!course) {
      return res
        .status(404)
        .send({ status: false, message: "Course not found" });
    }
    res.status(200).send({
      status: true,
      message: "Course deleted successfully",
      data: course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

// get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).send({
      status: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

// get single course
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .send({ status: false, message: "Course not found" });
    }
    res.status(200).send({
      status: true,
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};
