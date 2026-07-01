import express from "express";
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole,
  updateMySkills,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes (require JWT)
router.get("/me", protect, getMe);

router.put("/me/skills", protect, updateMySkills);

// Admin only routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);

export default router;
