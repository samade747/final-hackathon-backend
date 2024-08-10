import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  INTERNALERROR,
  NOTFOUND,
  OK,
} from "../constants/httpStatus.js";

import { responseMessages } from "../constants/responseMessages.js";
import pkg from "jsonwebtoken";
import Batch from "../models/Batch.js";
import Course from "../models/Course.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  const { courseName, batchNumber, startedFrom, endDate } = req.body;

  try {
    if (!courseName || !batchNumber || !startedFrom || !endDate) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
      // .send("Missing Fields");
    } else {
      // check the course is exists

      const checkCourse = await Course.findOne({ CourseName: courseName });
      if (!checkCourse) {
        return res.status(NOTFOUND).send(
          sendError({
            status: false,
            message: responseMessages.COURSE_NOT_FOUND,
          })
        );
      }

      const checkBatch = await Batch.findOne({
        BatchNumber: req.body.batchNumber,
        CourseName: req.body.courseName,
      });
      if (checkBatch) {
        return res.status(ALREADYEXISTS).send(
          sendError({
            status: false,
            message: responseMessages.BATCH_AND_COURSE_EXISTS,
          })
        );
      } else {
        // create an object
        const newBatch = new Batch({
          CourseName: courseName && courseName,
          BatchNumber: batchNumber && batchNumber,
          StartedFrom: new Date(startedFrom && startedFrom),
          EndDate: new Date(endDate && endDate),
        });
        const data = await newBatch.save();

        // update the course with the new batch
        const course = await Course.findOneAndUpdate(
          { CourseName: courseName },
          { $push: { Batches: data._id } },
          { new: true }
        );
        return res.status(CREATED).send(
          sendSuccess({
            status: true,
            message: responseMessages.GET_SUCCESS_MESSAGES,
            data: data,
          })
        );
      }
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

export const update = async (req, res) => {
  console.log(req.body, "===>>> req.body");
  try {
    // Retrieve existing batch data
    const singleBatchData = await Batch.findById(req.params.id);

    const { courseName, batchNumber, startedFrom, endDate, sirname } = req.body;

    // Check if the combination of courseName and batchNumber already exists in another document
    const checkBatch = await Batch.findOne({
      CourseName: courseName || singleBatchData.CourseName,
      BatchNumber: batchNumber || singleBatchData.BatchNumber,
      _id: { $ne: req.params.id }, // Exclude the current document
    });

    console.log(checkBatch, "===>>> checkBatch");
    if (checkBatch) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.BATCH_AND_COURSE_EXISTS,
        })
      );
    }

    // Check if the courseName exists
    if (courseName) {
      const checkCourse = await Course.findOne({ CourseName: courseName });
      if (!checkCourse) {
        return res.status(NOTFOUND).send(
          sendError({
            status: false,
            message: responseMessages.COURSE_NOT_FOUND,
          })
        );
      }
    }

    // Prepare data for update
    const data = {
      CourseName: courseName || singleBatchData.CourseName,
      BatchNumber: batchNumber || singleBatchData.BatchNumber,
      StartedFrom: new Date(startedFrom || singleBatchData.StartedFrom),
      EndDate: new Date(endDate || singleBatchData.EndDate),
      SirName: sirname || singleBatchData.SirName,
    };

    // Update the batch
    const updated = await Batch.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    // change the course array with the new batch
    if (courseName) {
      const course = await Course.findOneAndUpdate(
        { CourseName: courseName },
        { $push: { Batches: updated._id } },
        { new: true }
      );

      const oldCourse = await Course.findOneAndUpdate(
        { CourseName: singleBatchData.CourseName },
        { $pull: { Batches: singleBatchData._id } },
        { new: true }
      );
    }
    res.status(OK).json({
      status: true,
      message: "Batch updated successfully",
      data: updated,
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

export const deleteBatch = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete({ _id: req.params.id });

    // update the course array
    const course = await Course.findOneAndUpdate(
      { CourseName: deleted.CourseName },
      { $pull: { Batches: deleted._id } },
      { new: true }
    );

    // send success response
    res.status(OK);
    res.json({
      status: true,
      message: "Batch deleted successfully",
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

export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find();
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

export const getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Batch not found",
        })
      );
    }
    res.status(OK);
    res.json({
      status: true,
      message: "Batch fetched successfully",
      data: batch,
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
