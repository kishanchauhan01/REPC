import { Router } from "express";
import { login, logout, refresh } from "./auth.controller.js";

const router = Router();

// router.route("/register")
router.route("/login").post(login);
router.route("/refresh").post(refresh);
router.route("/logout").post(logout);

export default router;
