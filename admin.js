function renderAdminProducts() {
  const adminProductList = document.getElementById("admin-product-list");
  if (!adminProductList) return;

  adminProductList.innerHTML = state.products
    .map(
      (product) => `
      <article class="admin-card">
        <h3>${product.title}</h3>
        <span class="tag">${product.category}</span>
        <p>$${product.price.toFixed(2)} • Stock: ${product.stock}</p>
        <p>${product.description.slice(0, 100)}...</p>
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
      const rows = order.items
        .map((item) => {
          const product = state.products.find(
            (product) => product.id === item.productId,
          );
          return `<li>${product ? product.title : "Unknown game"} × ${item.quantity}</li>`;
        })
        .join("");
      const user = state.users.find((user) => user.id === order.userId);
      return `
        <article class="admin-card">
          <h3>Order #${order.id}</h3>
          <p>User: ${user ? user.name : "Guest"}</p>
          <p>Status: <strong>${order.status}</strong></p>
          <ul>${rows}</ul>
          <p>Total: $${order.total.toFixed(2)}</p>
          <div class="admin-actions">
            <button class="secondary-btn admin-update-status" data-id="${order.id}" data-status="pending">Pending</button>
            <button class="secondary-btn admin-update-status" data-id="${order.id}" data-status="shipped">Shipped</button>
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

  adminUserList.innerHTML = state.users
    .map(
      (user) => `
      <article class="user-card">
        <h3>${user.name}</h3>
        <p>${user.email}</p>
        <p>Role: ${user.role}</p>
        <div class="admin-actions">
          <button class="secondary-btn admin-edit-user" data-id="${user.id}">Edit</button>
          <button class="secondary-btn admin-delete-user" data-id="${user.id}">Delete</button>
        </div>
      </article>
    `,
    )
    .join("");
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
}

function handleAdminProductEdit(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  openModal(
    "Edit Product",
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
    (updates) => {
      product.title = updates.title;
      product.category = updates.category;
      product.price = parseFloat(updates.price);
      product.stock = parseInt(updates.stock, 10);
      product.image = updates.image;
      product.description = updates.description;
      persist();
      renderAdminProducts();
    },
  );
}

function handleAdminProductDelete(productId) {
  if (!confirm("Remove this game permanently?")) return;
  state.products = state.products.filter((product) => product.id !== productId);
  persist();
  renderAdminProducts();
}

function handleNewProduct() {
  openModal(
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
    (product) => {
      const nextId = state.products.length
        ? Math.max(...state.products.map((p) => p.id)) + 1
        : 1;
      state.products.push({
        id: nextId,
        title: product.title,
        category: product.category,
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10),
        image: product.image,
        description: product.description,
      });
      persist();
      renderAdminProducts();
    },
  );
}

function handleAdminOrderStatus(orderId, status) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.status = status;
  persist();
  renderAdminOrders();
}

function handleAdminUserEdit(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  openModal(
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
      {
        name: "role",
        label: "Role",
        type: "select",
        options: [
          { value: "customer", label: "Customer" },
          { value: "admin", label: "Admin" },
        ],
        value: user.role,
        required: true,
      },
    ],
    (changes) => {
      user.name = changes.name;
      user.email = changes.email;
      user.role = changes.role;
      persist();
      renderAdminUsers();
      renderNavigation();
    },
  );
}

function handleAdminUserDelete(userId) {
  if (userId === 1) {
    alert("Admin user cannot be removed.");
    return;
  }
  if (!confirm("Delete this user account?")) return;
  state.users = state.users.filter((user) => user.id !== userId);
  state.orders = state.orders.filter((order) => order.userId !== userId);
  persist();
  renderAdminUsers();
}

function initAdminPage() {
  loadStorage();
  const user = currentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "auth.html";
    return;
  }

  renderNavigation();
  updateCartCount();
  renderAdminPanel();

  const adminProductList = document.getElementById("admin-product-list");
  const adminOrderList = document.getElementById("admin-order-list");
  const adminUserList = document.getElementById("admin-user-list");
  const newProductBtn = document.getElementById("new-product-btn");
  const modalCancel = document.getElementById("modal-cancel");

  if (adminProductList) {
    adminProductList.addEventListener("click", (event) => {
      const editBtn = event.target.closest(".admin-edit-product");
      const deleteBtn = event.target.closest(".admin-delete-product");
      if (editBtn) handleAdminProductEdit(Number(editBtn.dataset.id));
      if (deleteBtn) handleAdminProductDelete(Number(deleteBtn.dataset.id));
    });
  }

  if (adminOrderList) {
    adminOrderList.addEventListener("click", (event) => {
      const button = event.target.closest(".admin-update-status");
      if (!button) return;
      handleAdminOrderStatus(Number(button.dataset.id), button.dataset.status);
    });
  }

  if (adminUserList) {
    adminUserList.addEventListener("click", (event) => {
      const editBtn = event.target.closest(".admin-edit-user");
      const deleteBtn = event.target.closest(".admin-delete-user");
      if (editBtn) handleAdminUserEdit(Number(editBtn.dataset.id));
      if (deleteBtn) handleAdminUserDelete(Number(deleteBtn.dataset.id));
    });
  }

  if (newProductBtn) {
    newProductBtn.addEventListener("click", handleNewProduct);
  }
  if (modalCancel) {
    modalCancel.addEventListener("click", closeModal);
  }

  document.querySelectorAll(".admin-tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.adminTab = button.dataset.adminTab;
      renderAdminPanel();
    });
  });
}

document.addEventListener("DOMContentLoaded", initAdminPage);
