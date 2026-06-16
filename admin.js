const ADMIN_API_HEADERS = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

function getToken() {
  return localStorage.getItem("token");
}

function extractCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.games)) return payload.games;
  return [];
}

function extractResource(payload) {
  return (
    payload?.data || payload?.user || payload?.order || payload?.game || payload
  );
}

function validationMessage(errors) {
  if (!errors) return null;
  return Object.values(errors).flat().join(" ");
}

async function apiRequest(path, options = {}) {
  if (!getToken()) {
    throw new Error("Unauthorized. Please log in as an admin.");
  }

  let response;
  let payload = null;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...ADMIN_API_HEADERS(),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error("Network error. Please check that the API is running.");
  }

  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new Error("Invalid JSON response from server.");
    }
  }

  if (!response.ok) {
    const serverMessage =
      validationMessage(payload?.errors) ||
      payload?.message ||
      payload?.error ||
      null;

    const fallbackMessages = {
      401: "Unauthorized. Please log in again.",
      403: "Forbidden. Your account does not have admin access.",
      404: "Resource not found.",
      422: "Validation failed. Please check the form fields.",
      500: "Server error. Please try again later.",
    };

    throw new Error(
      serverMessage || fallbackMessages[response.status] || "Request failed.",
    );
  }

  return payload ?? {};
}

async function getUsers() {
  return extractCollection(await apiRequest("/admin/users"));
}

async function getUser(id) {
  return extractResource(await apiRequest(`/admin/users/${id}`));
}

async function createUser(data) {
  return apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function updateUser(id, data) {
  return apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

async function deleteUser(id) {
  return apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });
}

async function getOrders() {
  return extractCollection(await apiRequest("/admin/orders"));
}

async function updateOrderStatus(id, status) {
  return apiRequest(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

async function getGames() {
  return extractCollection(await apiRequest("/games"));
}

async function createGame(data) {
  return apiRequest("/admin/games", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function updateGame(id, data) {
  return apiRequest(`/admin/games/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

async function deleteGame(id) {
  return apiRequest(`/admin/games/${id}`, {
    method: "DELETE",
  });
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeGame(game) {
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

function normalizeUser(user) {
  return {
    ...user,
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "customer",
    status: user.status || (user.is_active === false ? "inactive" : "active"),
  };
}

function normalizeOrder(order) {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
        <p>$${product.price.toFixed(2)} - Stock: ${product.stock}</p>
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

function productTitleFromOrderItem(item) {
  return (
    item.product?.title ||
    item.game?.title ||
    item.title ||
    state.products.find(
      (product) =>
        product.id ===
        (item.product_id ?? item.productId ?? item.game_id ?? item.gameId),
    )?.title ||
    "Unknown game"
  );
}

function productQuantityFromOrderItem(item) {
  return item.quantity ?? item.qty ?? 1;
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
      const user =
        order.user || state.users.find((item) => item.id === order.userId);
      const rows =
        order.items
          .map(
            (item) =>
              `<li>${escapeHtml(productTitleFromOrderItem(item))} x ${productQuantityFromOrderItem(item)}</li>`,
          )
          .join("") || "<li>No order items returned.</li>";

      return `
        <article class="admin-card">
          <h3>Order #${order.id}</h3>
          <p>User: ${escapeHtml(user?.name || user?.email || "Guest")}</p>
          <p>Status: <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(order.status)}</span></p>
          ${order.createdAt ? `<p>Date: ${escapeHtml(new Date(order.createdAt).toLocaleString())}</p>` : ""}
          <ul>${rows}</ul>
          <p>Total: $${order.total.toFixed(2)}</p>
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
  const totalRevenue = state.orders.reduce(
    (sum, order) => sum + order.total,
    0,
  );
  const totalSales = state.orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) =>
          itemSum + toNumber(productQuantityFromOrderItem(item), 1),
        0,
      ),
    0,
  );
  const completedOrders = state.orders.filter(
    (order) => order.status === "completed",
  ).length;
  const pendingOrders = state.orders.filter(
    (order) => order.status === "pending",
  ).length;
  const activeUsers = state.users.filter(
    (user) => user.status !== "inactive",
  ).length;

  const values = {
    "total-games": state.products.length,
    "total-revenue": `$${totalRevenue.toFixed(2)}`,
    "total-sales": totalSales,
    "total-orders": state.orders.length,
    "completed-orders": completedOrders,
    "pending-orders": pendingOrders,
    "total-users": state.users.length,
    "active-users": activeUsers,
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

function showLoader() {
  let loader = document.getElementById("admin-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "admin-loader";
    loader.className = "admin-loader hide";
    loader.innerHTML =
      '<div class="admin-loader-spinner"></div><span>Loading...</span>';
    document.body.appendChild(loader);
  }
  loader.classList.remove("hide");
}

function hideLoader() {
  document.getElementById("admin-loader")?.classList.add("hide");
}

function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => toast.remove(), 3500);
}

function setButtonLoading(button, isLoading, loadingText = "Saving...") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || "Save";
    button.disabled = false;
  }
}

function openAdminModal(title, fields, submitHandler) {
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modal-form");
  const modalTitle = document.getElementById("modal-title");
  const modalSave = document.getElementById("modal-save");
  if (!modal || !modalForm || !modalTitle || !modalSave) return;

  modalTitle.textContent = title;
  modalForm.innerHTML = fields
    .map((field) => {
      const required = field.required ? "required" : "";
      const value = escapeHtml(field.value || "");

      if (field.type === "textarea") {
        return `<textarea name="${field.name}" placeholder="${field.label}" ${required}>${value}</textarea>`;
      }

      if (field.type === "select") {
        return `
          <select name="${field.name}" ${required}>
            ${field.options
              .map(
                (option) =>
                  `<option value="${escapeHtml(option.value)}" ${
                    option.value === field.value ? "selected" : ""
                  }>${escapeHtml(option.label)}</option>`,
              )
              .join("")}
          </select>
        `;
      }

      return `<input name="${field.name}" type="${field.type}" placeholder="${field.label}" value="${value}" ${required} />`;
    })
    .join("");

  modal.classList.remove("hide");

  const submit = async (event) => {
    event.preventDefault();
    if (!modalForm.reportValidity()) return;

    const formData = new FormData(modalForm);
    const result = {};
    for (const [key, value] of formData.entries()) {
      result[key] = typeof value === "string" ? value.trim() : value;
    }

    try {
      setButtonLoading(modalSave, true);
      await submitHandler(result);
      closeModal();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setButtonLoading(modalSave, false);
    }
  };

  modalForm.onsubmit = submit;
  modalSave.onclick = () => modalForm.requestSubmit();
}

function gamePayload(formData) {
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

function userPayload(formData, includePassword = false) {
  const payload = {
    name: formData.name,
    email: formData.email,
    role: formData.role,
  };

  if (includePassword || formData.password) {
    payload.password = formData.password;
  }

  return payload;
}

function validateGame(formData) {
  if (!formData.title || !formData.category || !formData.description) {
    throw new Error("Title, genre, and description are required.");
  }
  if (toNumber(formData.price, -1) < 0) {
    throw new Error("Price must be a valid positive number.");
  }
  if (
    !Number.isInteger(toNumber(formData.stock, NaN)) ||
    toNumber(formData.stock, -1) < 0
  ) {
    throw new Error("Stock must be a valid whole number.");
  }
}

function validateUser(formData, isCreate = false) {
  if (!formData.name || !formData.email || !formData.role) {
    throw new Error("Name, email, and role are required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    throw new Error("Please enter a valid email address.");
  }
  if (isCreate && !formData.password) {
    throw new Error("Password is required when creating a user.");
  }
  if (formData.password && formData.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

async function loadGames() {
  const games = await getGames();
  state.products = games.map(normalizeGame);
  renderAdminProducts();
  renderAdminStats();
}

async function loadUsers() {
  const users = await getUsers();
  state.users = users.map(normalizeUser);
  renderAdminUsers();
  renderAdminStats();
}

async function loadOrders() {
  const orders = await getOrders();
  state.orders = orders.map(normalizeOrder);
  renderAdminOrders();
  renderAdminStats();
}

async function handleAdminProductEdit(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    showToast("Game not found.", "error");
    return;
  }

  openAdminModal(
    "Edit Game",
    [
      {
        name: "title",
        label: "Title",
        type: "text",
        value: product.title,
        required: true,
      },
      {
        name: "category",
        label: "Genre",
        type: "text",
        value: product.category,
        required: true,
      },
      {
        name: "price",
        label: "Price",
        type: "number",
        value: product.price,
        required: true,
      },
      {
        name: "stock",
        label: "Stock",
        type: "number",
        value: product.stock,
        required: true,
      },
      {
        name: "image",
        label: "Image URL",
        type: "text",
        value: product.image,
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        value: product.description,
        required: true,
      },
    ],
    async (updates) => {
      validateGame(updates);
      showLoader();
      try {
        await updateGame(productId, gamePayload(updates));
        showToast("Game updated successfully", "success");
        await loadGames();
      } finally {
        hideLoader();
      }
    },
  );
}

async function handleAdminProductDelete(productId) {
  if (!confirm("Remove this game permanently?")) return;

  try {
    showLoader();
    await deleteGame(productId);
    state.products = state.products.filter(
      (product) => product.id !== productId,
    );
    renderAdminProducts();
    renderAdminStats();
    showToast("Game deleted successfully", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoader();
  }
}

function handleNewProduct() {
  openAdminModal(
    "Add New Game",
    [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Genre", type: "text", required: true },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "stock", label: "Stock", type: "number", required: true },
      { name: "image", label: "Image URL", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
    ],
    async (product) => {
      validateGame(product);
      showLoader();
      try {
        await createGame(gamePayload(product));
        showToast("Game created successfully", "success");
        await loadGames();
      } finally {
        hideLoader();
      }
    },
  );
}

async function handleAdminOrderStatus(orderId, status) {
  try {
    showLoader();
    await updateOrderStatus(orderId, status);
    showToast("Order status updated successfully", "success");
    await loadOrders();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoader();
  }
}

async function handleAdminUserEdit(userId) {
  let user = state.users.find((item) => item.id === userId);

  try {
    user = normalizeUser(await getUser(userId));
  } catch (error) {
    showToast(error.message, "error");
    return;
  }

  openAdminModal(
    "Edit User",
    [
      {
        name: "name",
        label: "Name",
        type: "text",
        value: user.name,
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        value: user.email,
        required: true,
      },
      { name: "password", label: "New Password (optional)", type: "password" },
    ],
    async (changes) => {
      validateUser(changes, false);
      showLoader();
      try {
        await updateUser(userId, userPayload(changes));
        showToast("User updated successfully", "success");
        await loadUsers();
      } finally {
        hideLoader();
      }
    },
  );
}

async function handleAdminUserDelete(userId) {
  if (!confirm("Delete this user account?")) return;

  try {
    showLoader();
    await deleteUser(userId);
    state.users = state.users.filter((user) => user.id !== userId);
    renderAdminUsers();
    renderAdminStats();
    showToast("User deleted successfully", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoader();
  }
}

function handleNewUser() {
  openAdminModal(
    "Add New User",
    [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true },
    ],
    async (user) => {
      validateUser(user, true);
      showLoader();
      try {
        await createUser(userPayload(user, true));
        showToast("User created successfully", "success");
        await loadUsers();
      } finally {
        hideLoader();
      }
    },
  );
}

function renderAdminNavigation() {
  document.getElementById("login-btn")?.classList.add("hide");
  document.getElementById("logout-btn")?.classList.remove("hide");
  document.getElementById("admin-dashboard-btn")?.classList.remove("hide");
  const greeting = document.getElementById("user-greeting");
  if (greeting) {
    greeting.textContent = "Admin dashboard";
    greeting.classList.remove("hide");
  }
}

async function initAdminPage() {
  if (!getToken()) {
    window.location.href = "auth.html";
    return;
  }

  renderAdminNavigation();
  updateCartCount();
  renderAdminPanel();
  showLoader();

  try {
    await Promise.all([loadGames(), loadUsers(), loadOrders()]);
    renderAdminPanel();
  } catch (error) {
    showToast(error.message, "error");
    if (
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("forbidden")
    ) {
      window.location.href = "auth.html";
    }
  } finally {
    hideLoader();
  }

  const adminProductList = document.getElementById("admin-product-list");
  const adminOrderList = document.getElementById("admin-order-list");
  const adminUserList = document.getElementById("admin-user-list");
  const newProductBtn = document.getElementById("new-product-btn");
  const newUserBtn = document.getElementById("new-user-btn");
  const modalCancel = document.getElementById("modal-cancel");

  adminProductList?.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".admin-edit-product");
    const deleteBtn = event.target.closest(".admin-delete-product");
    if (editBtn) handleAdminProductEdit(Number(editBtn.dataset.id));
    if (deleteBtn) handleAdminProductDelete(Number(deleteBtn.dataset.id));
  });

  adminOrderList?.addEventListener("click", (event) => {
    const button = event.target.closest(".admin-update-status");
    if (!button) return;
    handleAdminOrderStatus(Number(button.dataset.id), button.dataset.status);
  });

  adminUserList?.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".admin-edit-user");
    const deleteBtn = event.target.closest(".admin-delete-user");
    if (editBtn) handleAdminUserEdit(Number(editBtn.dataset.id));
    if (deleteBtn) handleAdminUserDelete(Number(deleteBtn.dataset.id));
  });

  newProductBtn?.addEventListener("click", handleNewProduct);
  newUserBtn?.addEventListener("click", handleNewUser);
  modalCancel?.addEventListener("click", closeModal);

  document.querySelectorAll(".admin-tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.adminTab = button.dataset.adminTab;
      renderAdminPanel();
    });
  });
}

document.addEventListener("DOMContentLoaded", initAdminPage);
