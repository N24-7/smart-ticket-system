import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["bug", "feature", "support", "billing", "security", "other"],
      default: "support",
    },
    // User who created the ticket
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Moderator assigned to handle the ticket (set by Inngest in Phase 5)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // AI-extracted skills needed to resolve this ticket (set by Gemini in Phase 4)
    relatedSkills: {
      type: [String],
      default: [],
    },
    // AI analysis result from Gemini (Phase 4)
    aiAnalysis: {
      summary: { type: String, default: "" },
      suggestedPriority: { type: String, default: "" },
      extractedSkills: { type: [String], default: [] },
      analyzedAt: { type: Date, default: null },
    },
    // Internal notes from moderators
    notes: {
      type: String,
      default: "",
    },
    // When the ticket was resolved
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-set resolvedAt when status changes to resolved
ticketSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
