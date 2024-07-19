import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    CourseName: {
      type: String,
      required: true,
    },
    BatchNumber: {
      type: Number,
      required: true,
    },
    StartedFrom: {
      type: Date,
      required: true,
    },
    EndDate: {
      type: Date,
      required: true,
    },
    Slots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.models.Batch || mongoose.model("Batch", batchSchema);
export default Batch;
