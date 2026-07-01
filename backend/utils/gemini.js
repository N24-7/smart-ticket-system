import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeTicket = async (ticket) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are an expert support ticket analyzer. Analyze the following support ticket and respond ONLY with a valid JSON object — no markdown, no explanation, just raw JSON.

Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}
Current Category: ${ticket.category}
Current Priority: ${ticket.priority}

Respond with this exact JSON structure:
{
  "summary": "A concise 1-2 sentence summary of the issue",
  "suggestedPriority": "low|medium|high|critical",
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "reasoning": "Brief explanation of why you chose this priority",
  "estimatedResolutionTime": "e.g. 2-4 hours, 1-2 days"
}

Rules for suggestedPriority:
- critical: system down, security breach, data loss, payment issues
- high: major feature broken, affects many users
- medium: partial functionality broken, workaround exists
- low: minor issue, cosmetic bug, feature request

Rules for extractedSkills:
- List 2-5 technical skills needed to resolve this ticket
- Examples: "React", "MongoDB", "authentication", "payment gateway", "mobile debugging"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleaned);

    return { success: true, analysis };
  } catch (error) {
    console.error("Groq AI error:", error.message);
    return { success: false, error: error.message, analysis: null };
  }
};