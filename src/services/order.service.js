import { apiRequest, extractCollection } from "./api.service.js";
import { toNumber } from "../utils/helpers.js";

export function normalizeOrder(order) {
  return {
    ...order,
    id: order.id,
    userId: order.user_id ?? order.userId,
    user: order.user || null,
    items: Array.isArray(order.items)
      ? order.items
      : Array.isArray(order.order_items)
        ? order.order_items
        : [],
    status: order.status || "pending",
    total: toNumber(order.total),
    createdAt: order.created_at || order.createdAt || "",
  };
}

export async function fetchOrders() {
  return extractCollection(await apiRequest("/orders", { auth: true }));
}

export async function placeOrder(cart) {
  return apiRequest("/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      items: cart.map((item) => ({
        game_id: item.productId,
        quantity: item.quantity,
      })),
    }),
  });
}

export async function getAdminOrders() {
  return extractCollection(await apiRequest("/admin/orders", { auth: true }));
}

export async function updateOrderStatus(id, status) {
  return apiRequest(`/admin/orders/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
}

