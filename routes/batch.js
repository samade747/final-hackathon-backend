import express from "express";
import {
  add,
  deleteBatch,
  getBatch,
  getBatches,
  update,
} from "../controller/batchController.js";

export const batchRoutes = express.Router();

// add
// POST http://localhost:9000/api/batch/add
// Public
batchRoutes.post("/add", add);

// update
// put http://localhost:9000/api/batch/update/:id
// Public
batchRoutes.put("/update/:id", update);

// delete
// delete http://localhost:9000/api/batch/delete/:id
// Public
batchRoutes.delete("/delete/:id", deleteBatch);

// get all batches
// get http://localhost:9000/api/batch
// Public
batchRoutes.get("/", getBatches);

// get single batch
// delete http://localhost:9000/api/batch/:id
// Public
batchRoutes.get("/:id", getBatch);
