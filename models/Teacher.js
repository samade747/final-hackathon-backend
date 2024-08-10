import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    TeacherName: {
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
    PhoneNumber: {
      type: Number,
      required: true,
    },
    TeacherOf: {
      type: String,
      required: true,
    },
    ProfilePicture: {
      type: String,
      required: true,
    },
    Slots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
      },
    ],
    TeacherId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Teacher =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
