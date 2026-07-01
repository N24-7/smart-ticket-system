import User from "../models/User.js";

// Find the best moderator to assign a ticket based on skill overlap
export const findBestModerator = async (requiredSkills = []) => {
  try {
    // Get all active moderators
    const moderators = await User.find({
      role: "moderator",
      isActive: true,
    });

    if (moderators.length === 0) {
      return null;
    }

    if (!requiredSkills || requiredSkills.length === 0) {
      // No skills specified — just pick the moderator with fewest assigned tickets
      return moderators[0];
    }

    // Score each moderator by how many required skills they have
    const scored = moderators.map((mod) => {
      const modSkillsLower = mod.skills.map((s) => s.toLowerCase());
      const requiredLower = requiredSkills.map((s) => s.toLowerCase());

      const matchCount = requiredLower.filter((skill) =>
        modSkillsLower.some((modSkill) => modSkill.includes(skill) || skill.includes(modSkill))
      ).length;

      return { moderator: mod, score: matchCount };
    });

    // Sort by highest score first
    scored.sort((a, b) => b.score - a.score);

    // Return the best match (even if score is 0, returns first moderator as fallback)
    return scored[0].moderator;
  } catch (error) {
    console.error("Error finding best moderator:", error);
    return null;
  }
};
