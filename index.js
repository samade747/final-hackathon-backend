import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/default.js";
import { authRoutes } from "./routes/auth.js";
import { teacherRoutes } from "./routes/teacher.js";
import { batchRoutes } from "./routes/batch.js";
import { slotRoutes } from "./routes/slot.js";
import { studentRoutes } from "./routes/student.js";
import { holidayRoutes } from "./routes/holiday.js";
import { courseRoutes } from "./routes/course.js";
import attendanceRoutes from "./routes/attendance.js";
import cron from "node-cron";
import { markAbsentStudents } from "./controller/attendanceController.js";

const app = express();

dotenv.config();
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // mark absent at 12:55 pm daily
cron.schedule("55 23 * * *", markAbsentStudents);

connectDB();
app.use(express.json());
app.use(cors());

// routes
app.use("/api/course", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/slot", slotRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/holiday", holidayRoutes);
app.use("/api/attendance", attendanceRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running at http://localhost:${process.env.PORT}`);
});
