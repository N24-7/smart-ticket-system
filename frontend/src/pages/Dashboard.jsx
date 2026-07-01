import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketService } from "../services/api";
import { StatCard, PriorityBadge, StatusBadge, Spinner, EmptyState } from "../components/ui/index.jsx";
import { PlusIcon, ArrowRightIcon } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ["tickets", "recent"],
    queryFn: () => ticketService.getAll({ limit: 5 }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["tickets", "stats"],
    queryFn: () => ticketService.getStats(),
    enabled: ["admin", "moderator"].includes(user?.role),
  });

  const tickets = ticketsData?.data?.tickets || [];
  const stats = statsData?.data;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your tickets</p>
        </div>
        <Link to="/tickets/new" className="btn-primary flex items-center gap-1.5 text-sm">
          <PlusIcon size={15} />
          New Ticket
        </Link>
      </div>

      {/* Stats (admin/moderator only) */}
      {["admin", "moderator"].includes(user?.role) && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Tickets" value={stats.total} icon="🎫" color="blue" />
          {stats.byStatus?.map((s) => (
            <StatCard
              key={s._id}
              label={s._id?.replace("_", " ")}
              value={s.count}
              icon={s._id === "open" ? "🔵" : s._id === "resolved" ? "✅" : s._id === "in_progress" ? "🔄" : "⭕"}
              color={s._id === "open" ? "blue" : s._id === "resolved" ? "green" : s._id === "in_progress" ? "yellow" : "gray"}
            />
          ))}
        </div>
      )}

      {/* User quick stats */}
      {user?.role === "user" && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="My Tickets" value={tickets.length} icon="🎫" color="blue" />
          <StatCard
            label="Open Tickets"
            value={tickets.filter((t) => t.status === "open").length}
            icon="🔵"
            color="yellow"
          />
        </div>
      )}

      {/* Recent Tickets */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRightIcon size={12} />
          </Link>
        </div>

        {ticketsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="No tickets yet"
            description="Create your first ticket to get started"
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
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}
                    {ticket.assignedTo && ` · Assigned to ${ticket.assignedTo.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* AI Info card for users */}
      {user?.role === "user" && (
        <div className="card p-5 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-sm font-semibold text-primary-900">AI-powered ticket handling</p>
              <p className="text-xs text-primary-700 mt-1">
                Every ticket you submit is automatically analyzed by AI to determine priority and assigned to the best moderator based on their skills.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
