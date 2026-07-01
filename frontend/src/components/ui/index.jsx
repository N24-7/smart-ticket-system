// ─── Badge ───────────────────────────────────────────────────────────────────
export const Badge = ({ label, variant = "gray" }) => {
  const styles = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const map = {
    low: { label: "Low", variant: "blue" },
    medium: { label: "Medium", variant: "yellow" },
    high: { label: "High", variant: "orange" },
    critical: { label: "Critical", variant: "red" },
  };
  const { label, variant } = map[priority] || map.medium;
  return <Badge label={label} variant={variant} />;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    open: { label: "Open", variant: "blue" },
    in_progress: { label: "In Progress", variant: "yellow" },
    resolved: { label: "Resolved", variant: "green" },
    closed: { label: "Closed", variant: "gray" },
  };
  const { label, variant } = map[status] || map.open;
  return <Badge label={label} variant={variant} />;
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
export const RoleBadge = ({ role }) => {
  const map = {
    admin: { label: "Admin", variant: "purple" },
    moderator: { label: "Moderator", variant: "orange" },
    user: { label: "User", variant: "gray" },
  };
  const { label, variant } = map[role] || map.user;
  return <Badge label={label} variant={variant} />;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = "md" }) => {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 ${sizes[size]}`} />
  );
};

// ─── Loading Page ─────────────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-3 text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = "🎫", title, description, action }) => (
  <div className="text-center py-16">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {action}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
};
