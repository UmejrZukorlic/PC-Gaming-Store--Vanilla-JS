import { ROUTES, STORAGE_KEYS } from "../utils/constants.js";
import { getItem, removeItem, setItem } from "../utils/storage.js";
import { state, persistState } from "./state.service.js";
import { apiRequest } from "./api.service.js";

export function getToken() {
  return getItem(STORAGE_KEYS.TOKEN);
}

export function saveAuth(user) {
  if (user) {
    const { password, ...safeUser } = user;
    state.auth = {
      ...safeUser,
      role: getUserRole(safeUser),
    };
  } else {
    state.auth = null;
  }
  persistState();
}

export function currentUser() {
  if (!state.auth) return null;
  const storedUser = state.users.find((user) => user.email === state.auth.email);
  if (!storedUser) return state.auth;
  return {
    ...storedUser,
    ...state.auth,
    cart: storedUser.cart || [],
    role: getUserRole(state.auth) || getUserRole(storedUser),
  };
}

export function isAdmin(user = currentUser()) {
  return getUserRole(user) === "admin";
}

export function requireAuth(redirectTo = ROUTES.auth) {
  if (!getToken() && !currentUser()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

export function logout() {
  removeItem(STORAGE_KEYS.TOKEN);
  saveAuth(null);
}

function upsertLocalUser(user, fallback = {}) {
  const email = (user.email || fallback.email || "").toLowerCase();
  const role = getUserRole(user) || getUserRole(fallback) || "customer";
  const existingUser = state.users.find(
    (item) => item.email.toLowerCase() === email,
  );

  if (existingUser) {
    existingUser.name = user.name || existingUser.name;
    existingUser.role = role || existingUser.role;
    persistState();
    return existingUser;
  }

  const nextId = state.users.length
    ? Math.max(...state.users.map((item) => item.id)) + 1
    : 1;
  const createdUser = {
    id: nextId,
    name: user.name || fallback.name || fallback.email,
    email: user.email || fallback.email,
    password: fallback.password,
    role,
    cart: [],
  };
  state.users.push(createdUser);
  persistState();
  return createdUser;
}

export function getUserRole(user) {
  if (!user) return null;
  if (typeof user.role === "string") return user.role;
  if (typeof user.type === "string") return user.type;
  if (user.is_admin === true || user.isAdmin === true) return "admin";
  if (Array.isArray(user.roles)) {
    const role = user.roles.find((item) => {
      if (typeof item === "string") return item === "admin";
      return item?.name === "admin" || item?.slug === "admin";
    });
    if (role) return "admin";
  }
  return null;
}

export async function login(credentials) {
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  const user = data.user || data;
  if (!user || !user.email) throw new Error("Invalid login response.");

  const token = data.token || data.access_token || data.plainTextToken;
  if (token) setItem(STORAGE_KEYS.TOKEN, token);

  const localUser = upsertLocalUser(user, credentials);
  const role = getUserRole(user) || getUserRole(localUser) || "customer";
  saveAuth({
    ...user,
    email: user.email,
    name: user.name || localUser.name || credentials.email,
    role,
  });
  return {
    ...user,
    role,
  };
}

export async function register(account) {
  const data = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(account),
  });
  const user = data.user || data;
  if (!user || !user.email) throw new Error("Invalid registration response.");
  upsertLocalUser(user, account);
  return user;
}
