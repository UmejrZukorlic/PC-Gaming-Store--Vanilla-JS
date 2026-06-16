async function fetchOrders() {
  try {
    const response = await fetch("http://localhost:8000/api/orders", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function renderOrdersPage() {
  const ordersList = document.getElementById("orders-list");
  const emptyState = document.getElementById("empty-orders-state");

  if (!ordersList) return;

  const orders = await fetchOrders();

  if (!orders || orders.length === 0) {
    ordersList.innerHTML = "";
    emptyState?.classList.remove("hide");
    return;
  }

  emptyState?.classList.add("hide");

  ordersList.innerHTML = orders
    .map((order) => {
      const items = order.items
        .map(
          (item) => `
          <div class="order-item">
            <span>${item.game?.title || "Unknown game"}</span>
            <span>×${item.quantity}</span>
          </div>
        `,
        )
        .join("");

      const date = new Date(order.created_at);

      const statusColor =
        order.status === "pending"
          ? "#fbbf24"
          : order.status === "completed"
            ? "#10b981"
            : "#ef4444";

      return `
        <article class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #${order.id}</h3>
              <p class="order-date">
                ${date.toLocaleDateString()} at
                ${date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div class="order-status" style="color:${statusColor}">
              <span class="status-badge">
                ${order.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div class="order-items">
            ${items}
          </div>

          <div class="order-footer">
            <span class="order-total">
              Total:
              <strong>$${order.items
                .reduce((sum, item) => {
                  return sum + (item.game?.price || 0) * item.quantity;
                }, 0)
                .toFixed(2)}</strong>
            </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function initOrdersPage() {
  loadStorage();

  fetchProductsFromApi().finally(() => {
    renderNavigation();
    updateCartCount();
    renderOrdersPage();
  });
}

document.addEventListener("DOMContentLoaded", initOrdersPage);
