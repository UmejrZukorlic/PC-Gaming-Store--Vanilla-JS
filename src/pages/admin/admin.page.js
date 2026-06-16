import { hideLoader, setButtonLoading, showLoader } from "../../components/loader/loader.js";
import { closeModal, openModal } from "../../components/modal/modal.js";
import { renderAdminNavigation, updateCartCount, bindLogout } from "../../components/navbar/navbar.js";
import { orderItemQuantity, orderItemTitle } from "../../components/order-card/order-card.js";
import { showToast } from "../../components/toast/toast.js";
import { getToken, isAdmin } from "../../services/auth.service.js";
import {
  createGame,
  deleteGame,
  gamePayload,
  getGames,
  normalizeGame,
  updateGame,
} from "../../services/product.service.js";
import {
  getAdminOrders,
  normalizeOrder,
  updateOrderStatus,
} from "../../services/order.service.js";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  normalizeUser,
  updateUser,
  userPayload,
} from "../../services/user.service.js";
import { loadState, setOrders, setProducts, setUsers, state } from "../../services/state.service.js";
import { ROUTES } from "../../utils/constants.js";
import { formatCurrency } from "../../utils/formatters.js";
import { escapeHtml, toNumber } from "../../utils/helpers.js";
import { validateGame, validateUser } from "../../utils/validation.js";

function renderAdminProducts() {
  const adminProductList = document.getElementById("admin-product-list");
  if (!adminProductList) return;
  if (state.products.length === 0) {
    adminProductList.innerHTML = "<p>No games found.</p>";
    return;
  }

  adminProductList.innerHTML = state.products
    .map(
      (product) => `
        <article class="admin-card">
          <h3>${escapeHtml(product.title)}</h3>
          <span class="tag">${escapeHtml(product.category)}</span>
          <p>${formatCurrency(product.price)} - Stock: ${product.stock}</p>
          <p>${escapeHtml(product.description).slice(0, 100)}${product.description.length > 100 ? "..." : ""}</p>
          <div class="admin-actions">
            <button class="secondary-btn admin-edit-product" data-id="${product.id}">Edit</button>
            <button class="secondary-btn admin-delete-product" data-id="${product.id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAdminOrders() {
  const adminOrderList = document.getElementById("admin-order-list");
  if (!adminOrderList) return;
  if (state.orders.length === 0) {
    adminOrderList.innerHTML = "<p>No orders have been placed yet.</p>";
    return;
  }

  adminOrderList.innerHTML = state.orders
    .map((order) => {
      const user = order.user || state.users.find((item) => item.id === order.userId);
      const rows =
        order.items
          .map((item) => `<li>${escapeHtml(orderItemTitle(item, state.products))} x ${orderItemQuantity(item)}</li>`)
          .join("") || "<li>No order items returned.</li>";

      return `
        <article class="admin-card">
          <h3>Order #${order.id}</h3>
          <p>User: ${escapeHtml(user?.name || user?.email || "Guest")}</p>
          <p>Status: <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(order.status)}</span></p>
          ${order.createdAt ? `<p>Date: ${escapeHtml(new Date(order.createdAt).toLocaleString())}</p>` : ""}
          <ul>${rows}</ul>
          <p>Total: ${formatCurrency(order.total)}</p>
          <div class="admin-actions">
            <button class="secondary-btn admin-update-status" data-id="${order.id}" data-status="pending">Pending</button>
            <button class="secondary-btn admin-update-status" data-id="${order.id}" data-status="processing">Shipped</button>
            <button class="secondary-btn admin-update-status" data-id="${order.id}" data-status="completed">Completed</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAdminUsers() {
  const adminUserList = document.getElementById("admin-user-list");
  if (!adminUserList) return;
  if (state.users.length === 0) {
    adminUserList.innerHTML = "<p>No users found.</p>";
    return;
  }

  adminUserList.innerHTML = state.users
    .map(
      (user) => `
        <article class="user-card">
          <h3>${escapeHtml(user.name)}</h3>
          <p>${escapeHtml(user.email)}</p>
          <div class="admin-actions">
            <button class="secondary-btn admin-edit-user" data-id="${user.id}">Edit</button>
            <button class="secondary-btn admin-delete-user" data-id="${user.id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAdminStats() {
  const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = state.orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + toNumber(orderItemQuantity(item), 1), 0),
    0,
  );
  const values = {
    "total-games": state.products.length,
    "total-revenue": formatCurrency(totalRevenue),
    "total-sales": totalSales,
    "total-orders": state.orders.length,
    "completed-orders": state.orders.filter((order) => order.status === "completed").length,
    "pending-orders": state.orders.filter((order) => order.status === "pending").length,
    "total-users": state.users.length,
    "active-users": state.users.filter((user) => user.status !== "inactive").length,
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function renderAdminPanel() {
  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.adminTab === state.adminTab);
  });
  document.querySelectorAll(".admin-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `admin-${state.adminTab}`);
  });
  renderAdminProducts();
  renderAdminOrders();
  renderAdminUsers();
  renderAdminStats();
}

async function withAdminWork(task, successMessage) {
  showLoader();
  try {
    await task();
    if (successMessage) showToast(successMessage);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoader();
  }
}

async function loadGames() {
  setProducts((await getGames()).map(normalizeGame));
  renderAdminProducts();
  renderAdminStats();
}

async function loadUsers() {
  setUsers((await getUsers()).map(normalizeUser));
  renderAdminUsers();
  renderAdminStats();
}

async function loadOrders() {
  setOrders((await getAdminOrders()).map(normalizeOrder));
  renderAdminOrders();
  renderAdminStats();
}

const gameFields = (product = {}) => [
  { name: "title", label: "Title", type: "text", value: product.title, required: true },
  { name: "category", label: "Genre", type: "text", value: product.category, required: true },
  { name: "price", label: "Price", type: "number", value: product.price, required: true },
  { name: "stock", label: "Stock", type: "number", value: product.stock, required: true },
  { name: "image", label: "Image URL", type: "text", value: product.image, required: true },
  { name: "description", label: "Description", type: "textarea", value: product.description, required: true },
];

function userFields(user = {}, includePassword = false) {
  return [
    { name: "name", label: "Name", type: "text", value: user.name, required: true },
    { name: "email", label: "Email", type: "email", value: user.email, required: true },
    { name: "password", label: includePassword ? "Password" : "New Password (optional)", type: "password", required: includePassword },
  ];
}

function openAdminModal(title, fields, submitHandler) {
  const modalSave = document.getElementById("modal-save");
  openModal(title, fields, async (formData) => {
    try {
      setButtonLoading(modalSave, true);
      await submitHandler(formData);
      closeModal();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setButtonLoading(modalSave, false);
    }
  });
}

function handleNewProduct() {
  openAdminModal("Add New Game", gameFields(), async (product) => {
    validateGame(product);
    await withAdminWork(async () => {
      await createGame(gamePayload(product));
      await loadGames();
    }, "Game created successfully");
  });
}

function handleAdminProductEdit(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    showToast("Game not found.", "error");
    return;
  }
  openAdminModal("Edit Game", gameFields(product), async (updates) => {
    validateGame(updates);
    await withAdminWork(async () => {
      await updateGame(productId, gamePayload(updates));
      await loadGames();
    }, "Game updated successfully");
  });
}

async function handleAdminProductDelete(productId) {
  if (!confirm("Remove this game permanently?")) return;
  await withAdminWork(async () => {
    await deleteGame(productId);
    setProducts(state.products.filter((product) => product.id !== productId));
    renderAdminProducts();
    renderAdminStats();
  }, "Game deleted successfully");
}

async function handleAdminOrderStatus(orderId, status) {
  await withAdminWork(async () => {
    await updateOrderStatus(orderId, status);
    await loadOrders();
  }, "Order status updated successfully");
}

async function handleAdminUserEdit(userId) {
  let user;
  try {
    user = normalizeUser(await getUser(userId));
  } catch (error) {
    showToast(error.message, "error");
    return;
  }

  openAdminModal("Edit User", userFields(user), async (changes) => {
    validateUser(changes);
    await withAdminWork(async () => {
      await updateUser(userId, userPayload(changes));
      await loadUsers();
    }, "User updated successfully");
  });
}

async function handleAdminUserDelete(userId) {
  if (!confirm("Delete this user account?")) return;
  await withAdminWork(async () => {
    await deleteUser(userId);
    setUsers(state.users.filter((user) => user.id !== userId));
    renderAdminUsers();
    renderAdminStats();
  }, "User deleted successfully");
}

function handleNewUser() {
  openAdminModal("Add New User", userFields({}, true), async (user) => {
    validateUser(user, true);
    await withAdminWork(async () => {
      await createUser(userPayload(user, true));
      await loadUsers();
    }, "User created successfully");
  });
}

function bindAdminEvents() {
  document.getElementById("admin-product-list")?.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".admin-edit-product");
    const deleteBtn = event.target.closest(".admin-delete-product");
    if (editBtn) handleAdminProductEdit(Number(editBtn.dataset.id));
    if (deleteBtn) handleAdminProductDelete(Number(deleteBtn.dataset.id));
  });

  document.getElementById("admin-order-list")?.addEventListener("click", (event) => {
    const button = event.target.closest(".admin-update-status");
    if (button) handleAdminOrderStatus(Number(button.dataset.id), button.dataset.status);
  });

  document.getElementById("admin-user-list")?.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".admin-edit-user");
    const deleteBtn = event.target.closest(".admin-delete-user");
    if (editBtn) handleAdminUserEdit(Number(editBtn.dataset.id));
    if (deleteBtn) handleAdminUserDelete(Number(deleteBtn.dataset.id));
  });

  document.getElementById("new-product-btn")?.addEventListener("click", handleNewProduct);
  document.getElementById("new-user-btn")?.addEventListener("click", handleNewUser);
  document.getElementById("modal-cancel")?.addEventListener("click", closeModal);
  document.querySelectorAll(".admin-tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.adminTab = button.dataset.adminTab;
      renderAdminPanel();
    });
  });
}

async function initAdminPage() {
  loadState();
  if (!getToken() || !isAdmin()) {
    window.location.href = ROUTES.auth;
    return;
  }

  renderAdminNavigation();
  updateCartCount();
  bindLogout();
  renderAdminPanel();
  showLoader();

  try {
    await Promise.all([loadGames(), loadUsers(), loadOrders()]);
    renderAdminPanel();
  } catch (error) {
    showToast(error.message, "error");
    if (["unauthorized", "forbidden"].some((text) => error.message.toLowerCase().includes(text))) {
      window.location.href = ROUTES.auth;
    }
  } finally {
    hideLoader();
  }

  bindAdminEvents();
}

document.addEventListener("DOMContentLoaded", initAdminPage);
