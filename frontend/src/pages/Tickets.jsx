import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ticketService } from "../services/api";
import { PriorityBadge, StatusBadge, Spinner, EmptyState } from "../components/ui/index.jsx";
import { PlusIcon, FilterIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["", "open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["", "low", "medium", "high", "critical"];
const CATEGORIES = ["", "bug", "feature", "support", "billing", "security", "other"];

export default function Tickets() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: "", priority: "", category: "", page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => ticketService.getAll({ ...filters }),
  });

  const tickets = data?.data?.tickets || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500">{total} total tickets</p>
        </div>
        <Link to="/tickets/new" className="btn-primary flex items-center gap-1.5 text-sm">
          <PlusIcon size={15} />
          New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <FilterIcon size={14} className="text-gray-400" />
          <select
            className="input-field w-auto text-xs py-1.5"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s ? s.replace("_", " ") : "All statuses"}</option>
            ))}
          </select>
          <select
            className="input-field w-auto text-xs py-1.5"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p || "All priorities"}</option>
            ))}
          </select>
          <select
            className="input-field w-auto text-xs py-1.5"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || "All categories"}</option>
            ))}
          </select>
          {(filters.status || filters.priority || filters.category) && (
            <button
              onClick={() => setFilters({ status: "", priority: "", category: "", page: 1 })}
              className="text-xs text-red-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tickets list */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="No tickets found"
            description={filters.status || filters.priority || filters.category ? "Try adjusting your filters" : "Create your first ticket"}
            action={
              <Link to="/tickets/new" className="btn-primary text-sm inline-flex items-center gap-1.5">
                <PlusIcon size={14} /> New Ticket
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{ticket.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{ticket.category}</span>
                    {ticket.assignedTo && (
                      <span className="text-xs text-gray-400">→ {ticket.assignedTo.name}</span>
                    )}
                    {ticket.aiAnalysis?.analyzedAt && (
                      <span className="text-xs text-purple-500">🤖 AI analyzed</span>
                    )}
                    {ticket.relatedSkills?.length > 0 && (
                      <span className="text-xs text-gray-400">{ticket.relatedSkills.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              className="btn-secondary text-xs py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">Page {filters.page} of {totalPages}</span>
            <button
              disabled={filters.page === totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              className="btn-secondary text-xs py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
