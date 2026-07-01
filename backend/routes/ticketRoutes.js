import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats,
  reanalyzeTicket,
} from "../controllers/ticketController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All ticket routes require authentication
router.use(protect);

// Stats route — must be before /:id
router.get("/stats", authorize("admin", "moderator"), getTicketStats);

// Main CRUD
router.route("/")
  .get(getTickets)
  .post(createTicket);

router.route("/:id")
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

// AI reanalysis (admin/moderator only)
router.post("/:id/analyze", authorize("admin", "moderator"), reanalyzeTicket);

export default router;
