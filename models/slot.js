import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    CourseName: {
      type: String,
      required: true,
    },
    BatchNumber: {
      type: Number,
      required: true,
    },
    StartTime: {
      type: String,
      required: true,
    },
    EndTime: {
      type: String,
      required: true,
    },
    Days: [
      {
        type: String,
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
    ],
    TeacherId: {
      type: Number,
      required: true,
    },
    StudentsId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Slot = mongoose.models.Slot || mongoose.model("Slot", slotSchema);
export default Slot;
