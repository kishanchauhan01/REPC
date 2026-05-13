import { Router } from "express";
import { login } from "./auth.controller.js";

const router = Router();

// router.route("/register")
router.route("/login").post(login)
router.route("/refresh")
// router.route("/logout")

export default router;
