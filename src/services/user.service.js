import { apiRequest, extractCollection, extractResource } from "./api.service.js";

export function normalizeUser(user) {
  return {
    ...user,
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "customer",
    status: user.status || (user.is_active === false ? "inactive" : "active"),
  };
}

export function userPayload(formData, includePassword = false) {
  const payload = {
    name: formData.name,
    email: formData.email,
    role: formData.role || "customer",
  };
  if (includePassword || formData.password) payload.password = formData.password;
  return payload;
}

export async function getUsers() {
  return extractCollection(await apiRequest("/admin/users", { auth: true }));
}

export async function getUser(id) {
  return extractResource(await apiRequest(`/admin/users/${id}`, { auth: true }));
}

export async function createUser(data) {
  return apiRequest("/admin/users", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function updateUser(id, data) {
  return apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

