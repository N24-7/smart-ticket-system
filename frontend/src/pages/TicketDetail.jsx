import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PriorityBadge, StatusBadge, Spinner, LoadingPage } from "../components/ui/index.jsx";
import toast from "react-hot-toast";
import { ArrowLeftIcon, BotIcon, UserIcon, ClockIcon, TagIcon, RefreshCwIcon, TrashIcon } from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.getById(id),
    onSuccess: (data) => {
      const t = data.data.ticket;
      setForm({ status: t.status, priority: t.priority, notes: t.notes || "" });
    },
  });

  const ticket = data?.data?.ticket;

  const { mutate: updateTicket, isPending: updating } = useMutation({
    mutationFn: (updates) => ticketService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket updated!");
      setEditing(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const { mutate: reanalyze, isPending: reanalyzing } = useMutation({
    mutationFn: () => ticketService.reanalyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      toast.success("AI re-analysis complete!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Analysis failed"),
  });

  const { mutate: deleteTicket, isPending: deleting } = useMutation({
    mutationFn: () => ticketService.delete(id),
    onSuccess: () => {
      toast.success("Ticket deleted");
      navigate("/tickets");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });

  if (isLoading) return <LoadingPage />;
  if (!ticket) return <div className="text-center py-20 text-gray-400">Ticket not found</div>;

  const isAdminOrMod = ["admin", "moderator"].includes(user?.role);
  const isOwner = ticket.createdBy?._id === user?._id;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeftIcon size={14} /> Back to tickets
      </button>

      {/* Main ticket card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-semibold text-gray-900 flex-1">{ticket.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">{ticket.description}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 py-4 border-t border-b border-gray-50">
          <div className="flex items-center gap-1.5">
            <UserIcon size={12} />
            <span>By <span className="font-medium text-gray-700">{ticket.createdBy?.name}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <TagIcon size={12} />
            <span className="capitalize">{ticket.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon size={12} />
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1.5">
              <UserIcon size={12} />
              <span>→ <span className="font-medium text-gray-700">{ticket.assignedTo.name}</span></span>
            </div>
          )}
        </div>

        {/* Skills */}
        {ticket.relatedSkills?.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Skills needed:</span>
            {ticket.relatedSkills.map((skill) => (
              <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {ticket.aiAnalysis?.analyzedAt && (
        <div className="card p-5 border-purple-100 bg-purple-50">
          <div className="flex items-center gap-2 mb-3">
            <BotIcon size={15} className="text-purple-600" />
            <h2 className="text-sm font-semibold text-purple-900">AI Analysis</h2>
            <span className="text-xs text-purple-400 ml-auto">
              {new Date(ticket.aiAnalysis.analyzedAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-purple-800 mb-3">{ticket.aiAnalysis.summary}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2.5">
              <p className="text-purple-400 mb-0.5">Suggested priority</p>
              <p className="font-medium text-purple-900 capitalize">{ticket.aiAnalysis.suggestedPriority}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5">
              <p className="text-purple-400 mb-0.5">Est. resolution</p>
              <p className="font-medium text-purple-900">{ticket.aiAnalysis.estimatedResolutionTime || "N/A"}</p>
            </div>
          </div>
          {ticket.aiAnalysis.reasoning && (
            <p className="text-xs text-purple-600 mt-2 italic">"{ticket.aiAnalysis.reasoning}"</p>
          )}
        </div>
      )}

      {/* Moderator/Admin actions */}
      {isAdminOrMod && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Update Ticket</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                className="input-field text-sm"
                value={form.status || ticket.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              <select
                className="input-field text-sm"
                value={form.priority || ticket.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Internal Notes</label>
            <textarea
              className="input-field resize-none text-sm"
              rows={3}
              placeholder="Add internal notes..."
              value={form.notes ?? ticket.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateTicket(form)}
              disabled={updating}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              {updating ? <Spinner size="sm" /> : null}
              Save changes
            </button>
            <button
              onClick={() => reanalyze()}
              disabled={reanalyzing}
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              {reanalyzing ? <Spinner size="sm" /> : <RefreshCwIcon size={13} />}
              Re-analyze with AI
            </button>
          </div>
        </div>
      )}

      {/* Delete */}
      {(isOwner || user?.role === "admin") && (
        <div className="card p-4 border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete ticket</p>
              <p className="text-xs text-gray-400">This action cannot be undone</p>
            </div>
            <button
              onClick={() => { if (confirm("Delete this ticket?")) deleteTicket(); }}
              disabled={deleting}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1.5 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              {deleting ? <Spinner size="sm" /> : <TrashIcon size={13} />}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
