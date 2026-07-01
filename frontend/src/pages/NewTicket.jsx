import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/api";
import toast from "react-hot-toast";
import { Spinner } from "../components/ui/index.jsx";
import { ArrowLeftIcon } from "lucide-react";

export default function NewTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "support",
    priority: "medium",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => ticketService.create(form),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket submitted! AI is analyzing it in the background.");
      navigate(`/tickets/${data.data.ticket._id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title.length < 5) { toast.error("Title must be at least 5 characters"); return; }
    if (form.description.length < 10) { toast.error("Description must be at least 10 characters"); return; }
    mutate();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeftIcon size={14} /> Back
      </button>

      <div className="card p-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Submit a ticket</h1>
          <p className="text-sm text-gray-500 mt-1">Our AI will analyze your ticket and assign it to the right person</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="Brief summary of the issue"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-400">*</span></label>
            <textarea
              className="input-field resize-none"
              rows={5}
              placeholder="Describe the issue in detail. Include steps to reproduce, expected behavior, and actual behavior."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="support">Support</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* AI notice */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-start gap-2">
            <span className="text-base">🤖</span>
            <p className="text-xs text-purple-700">
              AI will automatically analyze this ticket, adjust priority if needed, extract required skills, and assign it to the best available moderator.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isPending ? <Spinner size="sm" /> : null}
              {isPending ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
