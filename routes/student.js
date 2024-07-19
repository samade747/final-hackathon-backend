import express from "express";
import {
  add,
  deleteStudent,
  getStudent,
  getStudents,
  update,
} from "../controller/studentController.js";

export const studentRoutes = express.Router();

// add
// POST http://localhost:9000/api/student/add
// Public
studentRoutes.post("/add", add);

// update
// put http://localhost:9000/api/student/update/:id
// Public
studentRoutes.put("/update/:id", update);

// delete
// delete http://localhost:9000/api/student/delete/:id
// Public
studentRoutes.delete("/delete/:id", deleteStudent);

// get all students
// delete http://localhost:9000/api/student/delete/:id
// Public
studentRoutes.get("/", getStudents);

// get single student
// get http://localhost:9000/api/student/:id
// Public
studentRoutes.get("/:id", getStudent);
