import { ROUTES } from "../../utils/constants.js";
import { currentUser, isAdmin, logout } from "../../services/auth.service.js";

export function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;
  const user = currentUser();
  const count = user?.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  cartCount.textContent = count.toString();
}

export function renderNavigation() {
  const user = currentUser();
  document.getElementById("login-btn")?.classList.toggle("hide", Boolean(user));
  document.getElementById("logout-btn")?.classList.toggle("hide", !user);
  document
    .getElementById("admin-dashboard-btn")
    ?.classList.toggle("hide", !isAdmin(user));

  const userGreeting = document.getElementById("user-greeting");
  if (!userGreeting) return;
  if (user) {
    userGreeting.textContent = `Hello, ${user.name}`;
    userGreeting.classList.remove("hide");
  } else {
    userGreeting.textContent = "";
    userGreeting.classList.add("hide");
  }
}

export function renderAdminNavigation() {
  document.getElementById("login-btn")?.classList.add("hide");
  document.getElementById("logout-btn")?.classList.remove("hide");
  document.getElementById("admin-dashboard-btn")?.classList.remove("hide");
  const greeting = document.getElementById("user-greeting");
  if (greeting) {
    greeting.textContent = "Admin dashboard";
    greeting.classList.remove("hide");
  }
}

export function bindLogout() {
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    logout();
    renderNavigation();
    updateCartCount();
    window.location.href = ROUTES.home;
  });
}

export function syncNavigation() {
  renderNavigation();
  updateCartCount();
  bindLogout();
}
