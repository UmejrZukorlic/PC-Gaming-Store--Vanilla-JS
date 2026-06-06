function renderOrdersPage() {
  const ordersList = document.getElementById("orders-list");
  const emptyState = document.getElementById("empty-orders-state");
  if (!ordersList) return;

  const user = currentUser();
  if (!user) {
    ordersList.innerHTML = "";
    emptyState?.classList.remove("hide");
    return;
  }

  const orders = state.orders.filter((order) => order.userId === user.id);
  if (orders.length === 0) {
    ordersList.innerHTML = "";
    emptyState?.classList.remove("hide");
    return;
  }

  emptyState?.classList.add("hide");
  ordersList.innerHTML = orders
    .map((order) => {
      const items = order.items
        .map((item) => {
          const product = state.products.find(
            (product) => product.id === item.productId,
          );
          return `<div class="order-item"><span>${product ? product.title : "Unknown game"}</span> <span>×${item.quantity}</span></div>`;
        })
        .join("");

      const date = new Date(order.createdAt);
      const statusColor = order.status === "pending" ? "#fbbf24" : "#10b981";

      return `
        <article class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #${order.id}</h3>
              <p class="order-date">${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div class="order-status" style="color: ${statusColor};">
              <span class="status-badge">${order.status.toUpperCase()}</span>
            </div>
          </div>
          <div class="order-items">
            ${items}
          </div>
          <div class="order-footer">
            <span class="order-total">Total: <strong>$${order.total.toFixed(2)}</strong></span>
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
