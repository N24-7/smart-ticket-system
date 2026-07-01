import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Spinner, LoadingPage } from "../components/ui/index.jsx";
import { PlusIcon, XIcon } from "lucide-react";

const SUGGESTED_SKILLS = [
  "React", "Node.js", "MongoDB", "Express", "JavaScript", "TypeScript",
  "Python", "payment gateway", "Stripe", "billing systems", "authentication",
  "cybersecurity", "debugging", "API development", "customer support",
  "frontend debugging", "backend development", "database", "cloud",
];

export default function Settings() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
  });

  const profile = data?.data?.user;
  const [skills, setSkills] = useState(profile?.skills || []);

  const { mutate: saveSkills, isPending } = useMutation({
    mutationFn: (s) => authService.updateSkills(s),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setSkills(data.data.user.skills);
      toast.success("Skills updated! You'll now receive tickets matching these skills.");
    },
    onError: () => toast.error("Failed to update skills"),
  });

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setNewSkill("");
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  if (isLoading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-lg font-semibold">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">Role: {profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Skills (moderator/admin only) */}
      {["moderator", "admin"].includes(user?.role) && (
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Your Skills</h2>
            <p className="text-xs text-gray-500 mt-1">
              The AI uses these skills to automatically assign matching tickets to you.
            </p>
          </div>

          {/* Current skills */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-8">
            {skills.length === 0 && (
              <p className="text-xs text-gray-400">No skills added yet — tickets won't be auto-assigned to you</p>
            )}
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-primary-900">
                  <XIcon size={10} />
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="input-field text-sm flex-1"
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
            />
            <button
              onClick={() => addSkill(newSkill)}
              disabled={!newSkill.trim()}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <PlusIcon size={13} /> Add
            </button>
          </div>

          {/* Suggested skills */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Suggested skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => saveSkills(skills)}
            disabled={isPending}
            className="btn-primary mt-4 text-sm flex items-center gap-2"
          >
            {isPending ? <Spinner size="sm" /> : null}
            {isPending ? "Saving..." : "Save skills"}
          </button>
        </div>
      )}
    </div>
  );
}
