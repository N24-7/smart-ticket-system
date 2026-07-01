import api from "../lib/axios";

// Auth
export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password, role) => api.post("/auth/register", { name, email, password, role }),
  getMe: () => api.get("/auth/me"),
  updateSkills: (skills) => api.put("/auth/me/skills", { skills }),
  getAllUsers: () => api.get("/auth/users"),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
};

// Tickets
export const ticketService = {
  getAll: (params) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  getStats: () => api.get("/tickets/stats"),
  reanalyze: (id) => api.post(`/tickets/${id}/analyze`),
};
