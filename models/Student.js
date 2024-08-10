import mongoose from "mongoose";

const student = mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    Email: {
      type: String,
      required: [true, "Please Add Email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    FatherEmail: {
      type: String,
      required: [true, "Please Add Email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    PhoneNumber: {
      type: Number,
      required: true,
    },
    ProfilePicture: {
      type: String,
    },
    CourseName: {
      type: String,
      required: true,
    },
    BatchNumber: {
      type: Number,
      required: true,
    },
    SlotId: {
      type: String, // or String, depending on your data
      required: true,
    },
    PresentDays: {
      type: Number,
      default: 0,
    },
    AbsentDays: {
      type: Number,
      default: 0,
    },
    TotalDays: {
      type: Number,
      default: 0,
    },
    RollNumber: {
      type: String,
      unique: true,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Student", student);
