import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import { RoleBadge, Spinner, LoadingPage } from "../components/ui/index.jsx";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authService.getAllUsers,
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }) => authService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated!");
    },
    onError: () => toast.error("Failed to update role"),
  });

  if (isLoading) return <LoadingPage />;

  const users = data?.data?.users || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">{users.length} total users</p>
      </div>

      <div className="card">
        <div className="divide-y divide-gray-50">
          {users.map((u) => (
            <div key={u._id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 text-sm font-semibold">
                  {u.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  {u._id === currentUser._id && (
                    <span className="text-xs text-gray-400">(you)</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                {u.skills?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Skills: {u.skills.slice(0, 3).join(", ")}{u.skills.length > 3 ? ` +${u.skills.length - 3}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <RoleBadge role={u.role} />
                {u._id !== currentUser._id && (
                  <select
                    className="input-field w-auto text-xs py-1.5"
                    value={u.role}
                    onChange={(e) => updateRole({ id: u._id, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
