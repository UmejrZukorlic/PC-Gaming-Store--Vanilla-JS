import { apiRequest, extractCollection } from "./api.service.js";
import { setProducts } from "./state.service.js";
import { toNumber } from "../utils/helpers.js";

export function normalizeGame(game) {
  return {
    ...game,
    id: game.id,
    title: game.title || game.name || "",
    category: game.category || game.genre || "",
    price: toNumber(game.price),
    stock: toNumber(game.stock),
    image: game.image || game.image_url || "",
    description: game.description || "",
  };
}

export async function loadProductsFromApi({ silent = true } = {}) {
  try {
    const products = extractCollection(await apiRequest("/games"));
    if (products.length > 0) setProducts(products.map(normalizeGame));
  } catch (error) {
    if (!silent) throw error;
    console.warn("Backend product fetch failed:", error);
  }
}

export function gamePayload(formData) {
  return {
    title: formData.title,
    genre: formData.category,
    category: formData.category,
    price: toNumber(formData.price),
    stock: parseInt(formData.stock, 10),
    image: formData.image,
    image_url: formData.image,
    description: formData.description,
  };
}

export async function getGames() {
  return extractCollection(await apiRequest("/games", { auth: true }));
}

export async function createGame(data) {
  return apiRequest("/admin/games", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function updateGame(id, data) {
  return apiRequest(`/admin/games/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function deleteGame(id) {
  return apiRequest(`/admin/games/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
