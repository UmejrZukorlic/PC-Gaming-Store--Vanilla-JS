import { syncNavigation } from "../../components/navbar/navbar.js";
import { orderCard } from "../../components/order-card/order-card.js";
import { showToast } from "../../components/toast/toast.js";
import { fetchOrders } from "../../services/order.service.js";
import { loadProductsFromApi } from "../../services/product.service.js";
import { loadState } from "../../services/state.service.js";

async function renderOrdersPage() {
  const ordersList = document.getElementById("orders-list");
  const emptyState = document.getElementById("empty-orders-state");
  if (!ordersList) return;

  try {
    const orders = await fetchOrders();
    if (!orders.length) {
      ordersList.innerHTML = "";
      emptyState?.classList.remove("hide");
      return;
    }
    emptyState?.classList.add("hide");
    ordersList.innerHTML = orders.map(orderCard).join("");
  } catch (error) {
    ordersList.innerHTML = "";
    emptyState?.classList.remove("hide");
    showToast(error.message, "error");
  }
}

async function initOrdersPage() {
  loadState();
  await loadProductsFromApi();
  syncNavigation();
  renderOrdersPage();
}

document.addEventListener("DOMContentLoaded", initOrdersPage);

