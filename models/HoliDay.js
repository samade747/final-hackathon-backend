import mongoose from "mongoose";

const { Schema } = mongoose;

const holidaySchema = new Schema({
  Name: { type: String, required: true },
  Date: { type: Date, required: true },
});

export default mongoose.model("Holiday", holidaySchema);
