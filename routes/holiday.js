import express from "express";
import {
  add,
  deleteHoliday,
  getHoliday,
  getHolidays,
  update,
} from "../controller/holidayController.js";
export const holidayRoutes = express.Router();

// add
// POST http://localhost:9000/api/holiday/add
// Public
holidayRoutes.post("/add", add);

// update
// put http://localhost:9000/api/holiday/update/:id
// Public
holidayRoutes.put("/update/:id", update);

// delete
// delete http://localhost:9000/api/holiday/delete/:id
// Public
holidayRoutes.delete("/delete/:id", deleteHoliday);

// get all holidays
// get http://localhost:9000/api/holiday
// Public
holidayRoutes.get("/", getHolidays);

// get single holiday
// get http://localhost:9000/api/holiday/:id
// Public
holidayRoutes.get("/:id", getHoliday);
