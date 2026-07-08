import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// This runs before every request - it automatically attaches
// the saved token (if we have one) to the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
}

export async function signup(name, email, password) {
  const response = await api.post("/users/", { name, email, password });
  return response.data;
}

export async function getGroups() {
  const response = await api.get("/groups/");
  return response.data;
}

export async function getGroup(groupId) {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
}

export async function getExpenses(groupId) {
  const response = await api.get(`/expenses/group/${groupId}`);
  return response.data;
}

export async function getSettlements(groupId) {
  const response = await api.get(`/groups/${groupId}/settlements`);
  return response.data;
}

export async function createExpense(groupId, amount, description, splits) {
  const response = await api.post("/expenses/", {
    group_id: groupId,
    amount,
    description,
    splits,
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/users/me");
  return response.data;
}

export async function createGroup(name, createdBy) {
  const response = await api.post("/groups/", { name, created_by: createdBy });
  return response.data;
}

export async function addMember(groupId, userId) {
  const response = await api.post(`/groups/${groupId}/members`, { user_id: userId });
  return response.data;
}

export default api;