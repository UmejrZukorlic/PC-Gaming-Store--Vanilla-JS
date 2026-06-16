import { cartItemCard } from "../../components/cart-item/cart-item.js";
import { renderNavigation, syncNavigation, updateCartCount } from "../../components/navbar/navbar.js";
import { showToast } from "../../components/toast/toast.js";
import {
  changeCartItemQuantity,
  getCartSummary,
  removeFromCart,
  updateUserCart,
} from "../../services/cart.service.js";
import { currentUser } from "../../services/auth.service.js";
import { placeOrder } from "../../services/order.service.js";
import { loadProductsFromApi } from "../../services/product.service.js";
import { loadState, state } from "../../services/state.service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { ROUTES } from "../../utils/constants.js";

function renderCartPage() {
  const cartList = document.getElementById("cart-list");
  const emptyState = document.getElementById("empty-cart-state");
  const cartTotal = document.getElementById("cart-total");
  const subtotal = document.getElementById("subtotal");
  const tax = document.getElementById("tax");
  const checkoutBtn = document.getElementById("checkout-btn");
  const user = currentUser();
  if (!cartList || !cartTotal || !checkoutBtn) return;

  const cart = user?.cart || [];
  if (!user || cart.length === 0) {
    cartList.innerHTML = "";
    emptyState?.classList.remove("hide");
    cartTotal.textContent = formatCurrency(0);
    if (subtotal) subtotal.textContent = formatCurrency(0);
    if (tax) tax.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    return;
  }

  emptyState?.classList.add("hide");
  cartList.innerHTML = cart
    .map((item) => {
      const product = state.products.find((product) => product.id === item.productId);
      return product ? cartItemCard(item, product) : "";
    })
    .join("");

  const summary = getCartSummary(cart, state.products);
  cartTotal.textContent = formatCurrency(summary.total);
  if (subtotal) subtotal.textContent = formatCurrency(summary.subtotal);
  if (tax) tax.textContent = formatCurrency(summary.tax);
  checkoutBtn.disabled = false;
}

async function handleCheckout() {
  const user = currentUser();
  const cart = user?.cart || [];
  if (!user || cart.length === 0) return;

  try {
    await placeOrder(cart);
    updateUserCart(user, []);
    showToast("Order placed successfully!");
    window.location.href = ROUTES.orders;
  } catch (error) {
    showToast(error.message, "error");
  }
}

function bindCartEvents() {
  document.getElementById("checkout-btn")?.addEventListener("click", handleCheckout);
  document.getElementById("cart-list")?.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    const productId = Number(target.dataset.id);
    if (target.classList.contains("cart-remove")) removeFromCart(productId);
    if (target.classList.contains("cart-change")) {
      changeCartItemQuantity(productId, target.dataset.action);
    }
    renderCartPage();
    renderNavigation();
    updateCartCount();
  });
}

async function initCartPage() {
  loadState();
  await loadProductsFromApi();
  syncNavigation();
  renderCartPage();
  bindCartEvents();
}

document.addEventListener("DOMContentLoaded", initCartPage);

