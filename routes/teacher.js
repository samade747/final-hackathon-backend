import express from "express";
import {
  add,
  deleteTeacher,
  getTeacher,
  getTeachers,
  queryTeachers,
  update,
} from "../controller/teacherController.js";

export const teacherRoutes = express.Router();

// add
// POST http://localhost:9000/api/teacher/add
// Public
teacherRoutes.post("/add", add);

// update
// put http://localhost:9000/api/teacher/update/:id
// Public
teacherRoutes.put("/update/:id", update);

// delete
// delete http://localhost:9000/api/teacher/delete/:id
// Public
teacherRoutes.delete("/delete/:id", deleteTeacher);

// get all Teachers
// delete http://localhost:9000/api/teacher/delete/:id
// Public
teacherRoutes.get("/", getTeachers);

// get single teacher
// delete http://localhost:9000/api/teacher/:id
// Public
teacherRoutes.get("/:id", getTeacher);

// get by query
// delete http://localhost:9000/api/teacher/query
// Public
teacherRoutes.get("/query", queryTeachers);
