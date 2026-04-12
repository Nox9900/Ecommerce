import express from "express";
import { googleSignIn, appleSignIn, register, login, forgotPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

export default router;
