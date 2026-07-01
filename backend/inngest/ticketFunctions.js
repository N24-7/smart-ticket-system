import { inngest } from "./client.js";
import Ticket from "../models/Ticket.js";
import { analyzeTicket } from "../utils/gemini.js";
import { findBestModerator } from "./skillMatcher.js";

// Triggered whenever a "ticket/created" event is sent
export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    const { ticketId } = event.data;

    // Step 1 — Fetch the ticket
    const ticket = await step.run("fetch-ticket", async () => {
      const t = await Ticket.findById(ticketId);
      if (!t) throw new Error("Ticket not found");
      return t;
    });

    // Step 2 — Run AI analysis
    const analysis = await step.run("ai-analysis", async () => {
      const result = await analyzeTicket({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
      });
      return result;
    });

    // Step 3 — Save AI analysis results to ticket
    if (analysis.success && analysis.analysis) {
      await step.run("save-analysis", async () => {
        const { summary, suggestedPriority, extractedSkills, reasoning, estimatedResolutionTime } = analysis.analysis;

        await Ticket.findByIdAndUpdate(ticketId, {
          priority: suggestedPriority || ticket.priority,
          relatedSkills: extractedSkills || [],
          aiAnalysis: {
            summary: summary || "",
            suggestedPriority: suggestedPriority || "",
            extractedSkills: extractedSkills || [],
            reasoning: reasoning || "",
            estimatedResolutionTime: estimatedResolutionTime || "",
            analyzedAt: new Date(),
          },
        });
      });
    }

    // Step 4 — Auto-assign to best matching moderator
    const assignedModerator = await step.run("assign-moderator", async () => {
      const skills = analysis.success ? analysis.analysis?.extractedSkills : [];
      const moderator = await findBestModerator(skills);

      if (moderator) {
        await Ticket.findByIdAndUpdate(ticketId, {
          assignedTo: moderator._id,
        });
        return { assigned: true, moderatorId: moderator._id, moderatorName: moderator.name };
      }

      return { assigned: false };
    });

    return {
      ticketId,
      aiSuccess: analysis.success,
      assignment: assignedModerator,
    };
  }
);

export const functions = [onTicketCreated];
