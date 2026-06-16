import { ORDER_STATUS_COLORS } from "../../utils/constants.js";
import { formatCurrency, formatDateTime } from "../../utils/formatters.js";
import { escapeHtml } from "../../utils/helpers.js";

export function orderItemTitle(item, products = []) {
  return (
    item.product?.title ||
    item.game?.title ||
    item.title ||
    products.find(
      (product) =>
        product.id ===
        (item.product_id ?? item.productId ?? item.game_id ?? item.gameId),
    )?.title ||
    "Unknown game"
  );
}

export function orderItemQuantity(item) {
  return item.quantity ?? item.qty ?? 1;
}

export function orderTotal(order) {
  return order.items.reduce(
    (sum, item) => sum + (item.game?.price || item.product?.price || 0) * orderItemQuantity(item),
    0,
  );
}

export function orderCard(order) {
  const statusColor = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.cancelled;
  const items = order.items
    .map(
      (item) => `
        <div class="order-item">
          <span>${escapeHtml(orderItemTitle(item))}</span>
          <span>x${orderItemQuantity(item)}</span>
        </div>
      `,
    )
    .join("");

  return `
    <article class="order-card">
      <div class="order-header">
        <div class="order-info">
          <h3>Order #${order.id}</h3>
          <p class="order-date">${formatDateTime(order.created_at || order.createdAt)}</p>
        </div>
        <div class="order-status" style="color:${statusColor}">
          <span class="status-badge">${escapeHtml(order.status).toUpperCase()}</span>
        </div>
      </div>
      <div class="order-items">${items}</div>
      <div class="order-footer">
        <span class="order-total">Total: <strong>${formatCurrency(order.total || orderTotal(order))}</strong></span>
      </div>
    </article>
  `;
}

