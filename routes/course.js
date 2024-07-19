import express from "express";
import {} from "../controller/courseController.js";
import { add } from "../controller/courseController.js";
import { update } from "../controller/courseController.js";
import { deleteCourse } from "../controller/courseController.js";
import { getCourses } from "../controller/courseController.js";
import { getCourse } from "../controller/courseController.js";
export const courseRoutes = express.Router();

// add
// POST http://localhost:9000/api/course/add
// Public
courseRoutes.post("/add", add);

// update
// put http://localhost:9000/api/course/update/:id
// Public
courseRoutes.put("/update/:id", update);

// delete
// delete http://localhost:9000/api/course/delete/:id
// Public
courseRoutes.delete("/delete/:id", deleteCourse);

// get all courses
// get http://localhost:9000/api/course
// Public
courseRoutes.get("/", getCourses);

// get single course
// delete http://localhost:9000/api/course/:id
// Public
courseRoutes.get("/:id", getCourse);


