import Ticket from "../models/Ticket.js";
import { analyzeTicket } from "../utils/gemini.js";
import { inngest } from "../inngest/client.js";

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (any logged in user)
export const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const ticket = await Ticket.create({
      title,
      description,
      category: category || "support",
      priority: priority || "medium",
      createdBy: req.user._id,
    });

    // Fire Inngest event — triggers background AI analysis + auto-assignment
    await inngest.send({
      name: "ticket/created",
      data: { ticketId: ticket._id.toString() },
    });

    await ticket.populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Ticket created! AI analysis & auto-assignment running in background.",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, message: "Server error creating ticket" });
  }
};

// @desc    Get tickets (role-based)
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (req.user.role === "user") {
      filter.createdBy = req.user._id;
    } else if (req.user.role === "moderator") {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Ticket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, message: "Server error fetching tickets" });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role skills");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const isOwner = ticket.createdBy._id.toString() === req.user._id.toString();
    const isAssigned = ticket.assignedTo?._id.toString() === req.user._id.toString();
    const isAdminOrMod = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isAssigned && !isAdminOrMod) {
      return res.status(403).json({ success: false, message: "Not authorized to view this ticket" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ success: false, message: "Server error fetching ticket" });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const isOwner = ticket.createdBy.toString() === req.user._id.toString();
    const isAdminOrMod = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isAdminOrMod) {
      return res.status(403).json({ success: false, message: "Not authorized to update this ticket" });
    }

    if (isOwner && !isAdminOrMod) {
      const { title, description, category } = req.body;
      if (ticket.status !== "open") {
        return res.status(400).json({ success: false, message: "Cannot edit a ticket that is no longer open" });
      }
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      if (category) ticket.category = category;
    }

    if (isAdminOrMod) {
      const { title, description, category, status, priority, assignedTo, notes } = req.body;
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      if (category) ticket.category = category;
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
      if (notes !== undefined) ticket.notes = notes;
    }

    await ticket.save();
    await ticket.populate("createdBy", "name email");
    await ticket.populate("assignedTo", "name email");

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ success: false, message: "Server error updating ticket" });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (owner or admin)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const isOwner = ticket.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this ticket" });
    }

    await ticket.deleteOne();
    res.status(200).json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ success: false, message: "Server error deleting ticket" });
  }
};

// @desc    Get ticket stats
// @route   GET /api/tickets/stats
// @access  Private (admin/moderator)
export const getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const priorityStats = await Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
    const total = await Ticket.countDocuments();

    res.status(200).json({ success: true, total, byStatus: stats, byPriority: priorityStats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
};

// @desc    Manually trigger AI analysis on existing ticket
// @route   POST /api/tickets/:id/analyze
// @access  Private (admin/moderator)
export const reanalyzeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const result = await analyzeTicket({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
    });

    if (!result.success) {
      return res.status(500).json({ success: false, message: "AI analysis failed", error: result.error });
    }

    const { summary, suggestedPriority, extractedSkills, reasoning, estimatedResolutionTime } = result.analysis;

    ticket.priority = suggestedPriority || ticket.priority;
    ticket.relatedSkills = extractedSkills || [];
    ticket.aiAnalysis = {
      summary,
      suggestedPriority,
      extractedSkills,
      reasoning,
      estimatedResolutionTime,
      analyzedAt: new Date(),
    };

    await ticket.save();

    res.status(200).json({ success: true, message: "AI analysis complete", ticket });
  } catch (error) {
    console.error("Reanalyze error:", error);
    res.status(500).json({ success: false, message: "Server error during analysis" });
  }
};
