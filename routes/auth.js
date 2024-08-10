import express from "express";
import {
  isUserLoggedIn,
  login,
  resetPasswordEmail,
  signUp,
  verifyEmail,
} from "../controller/authController.js";
import { checkToken, validateToken } from "../helpers/token.js";

export const authRoutes = express.Router();

// SIGNUP
// POST http://localhost:9000/api/auth/signup
// Public
authRoutes.post("/signup", signUp);

// LOGIN
// POST http://localhost:9000/api/auth/login
// Public
authRoutes.post("/login", login);

// isUserLoggedIn
// http://localhost:7000/api/auth/isuserloggedin
// get
authRoutes.get("/isuserloggedin", checkToken, isUserLoggedIn);

// verify otp
// POST http://localhost:9000/api/auth/verifyEmail
// Public
authRoutes.post('/verifyEmail', validateToken, verifyEmail);


// authRoutes.post("/forgotPassword", forgotPasswordEmail);
// authRoutes.put("/resetPassword", resetPasswordEmail);
