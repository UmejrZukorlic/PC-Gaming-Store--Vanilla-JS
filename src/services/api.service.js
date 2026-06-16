import { CONFIG } from "../config.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { getItem } from "../utils/storage.js";
import { validationMessage } from "../utils/validation.js";

export class ApiError extends Error {
  constructor(message, status = null, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function authHeaders() {
  const token = getItem(STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(path, options = {}) {
  let response;
  let payload = null;

  try {
    response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.auth ? authHeaders() : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new ApiError("Network error. Please check that the API is running.");
  }

  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new ApiError("Invalid JSON response from server.", response.status);
    }
  }

  if (!response.ok) {
    const fallbackMessages = {
      401: "Unauthorized. Please log in again.",
      403: "Forbidden. Your account does not have access.",
      404: "Resource not found.",
      422: "Validation failed. Please check the form fields.",
      500: "Server error. Please try again later.",
    };
    const message =
      validationMessage(payload?.errors) ||
      payload?.message ||
      payload?.error ||
      fallbackMessages[response.status] ||
      "Request failed.";
    throw new ApiError(message, response.status, payload);
  }

  return payload ?? {};
}

export function extractCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.games)) return payload.games;
  return [];
}

export function extractResource(payload) {
  return payload?.data || payload?.user || payload?.order || payload?.game || payload;
}

