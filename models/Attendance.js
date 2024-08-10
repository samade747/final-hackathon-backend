import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    RollNumber: {
      type: String,
      required: true,
    },
    SlotId: {
      type: Number,
      ref: "Slot",
      required: true,
    },
    Date: {
      type: Date,
      required: true,
    },
    Status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export default Attendance;
