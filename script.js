const API_BASE = "http://127.0.0.1:8000/api";

const state = {
  products: [],
  users: [],
  orders: [],
  auth: null,
  selectedProduct: null,
  adminTab: "products",
};

function loadStorage() {
  const storage = JSON.parse(localStorage.getItem("gamestore")) || {};
  state.products = storage.products || getDefaultProducts();
  state.users = storage.users || getDefaultUsers();
  state.orders = storage.orders || [];
  state.auth = storage.auth || null;
  persist();
}

function persist() {
  localStorage.setItem(
    "gamestore",
    JSON.stringify({
      products: state.products,
      users: state.users,
      orders: state.orders,
      auth: state.auth,
    }),
  );
}

function getDefaultUsers() {
  return [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      cart: [],
    },
    {
      id: 2,
      name: "Regular User",
      email: "user@example.com",
      password: "user123",
      role: "customer",
      cart: [],
    },
  ];
}

function getDefaultProducts() {
  return [];
}

function saveAuth(user) {
  if (user) {
    const { password, ...safeUser } = user;
    state.auth = { ...safeUser };
  } else {
    state.auth = null;
  }
  persist();
}

function currentUser() {
  if (!state.auth) return null;
  return state.users.find((user) => user.email === state.auth.email) || null;
}

function updateUserCart(user, cart) {
  const storedUser = state.users.find((item) => item.id === user.id);
  if (storedUser) {
    storedUser.cart = cart;
    persist();
  }
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;
  const user = currentUser();
  const count = user?.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  cartCount.textContent = count.toString();
}

function renderNavigation() {
  const user = currentUser();
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const adminDashboardBtn = document.getElementById("admin-dashboard-btn");
  const userGreeting = document.getElementById("user-greeting");

  if (loginBtn) {
    loginBtn.classList.toggle("hide", Boolean(user));
  }
  if (logoutBtn) {
    logoutBtn.classList.toggle("hide", !user);
  }
  if (userGreeting) {
    if (user) {
      userGreeting.textContent = `Hello, ${user.name}`;
      userGreeting.classList.remove("hide");
    } else {
      userGreeting.classList.add("hide");
      userGreeting.textContent = "";
    }
  }
  if (adminDashboardBtn) {
    adminDashboardBtn.classList.toggle("hide", !user || user.role !== "admin");
  }
}

async function fetchProductsFromApi() {
  try {
    const response = await fetch(`${API_BASE}/games`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Product API unavailable");
    const data = await response.json();
    const products = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
        ? data.data
        : [];
    if (products.length > 0) {
      state.products = products.map((product) => ({
        id: product.id,
        title: product.title,
        category: product.genre,
        price: parseFloat(product.price),
        stock: product.stock ?? 0,
        image: product.image ?? product.image_url ?? "",
        description: product.description ?? "",
      }));
      persist();
    }
  } catch (error) {
    console.warn("Backend product fetch failed:", error);
  }
}

function openModal(title, fields, submitHandler) {
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modal-form");
  const modalTitle = document.getElementById("modal-title");
  if (!modal || !modalForm || !modalTitle) return;

  modalTitle.textContent = title;
  modalForm.innerHTML = fields
    .map((field) => {
      if (field.type === "textarea") {
        return `<textarea name="${field.name}" placeholder="${field.label}" required>${field.value || ""}</textarea>`;
      }
      if (field.type === "select") {
        return `
          <select name="${field.name}" required>
            ${field.options
              .map(
                (option) =>
                  `<option value="${option.value}" ${
                    option.value === field.value ? "selected" : ""
                  }>${option.label}</option>`,
              )
              .join("")}
          </select>
        `;
      }
      return `<input name="${field.name}" type="${field.type}" placeholder="${field.label}" value="${field.value || ""}" ${field.required ? "required" : ""} />`;
    })
    .join("");

  modal.classList.remove("hide");
  modalForm.onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(modalForm);
    const result = {};
    for (const [key, value] of formData.entries()) {
      result[key] = value.trim();
    }
    submitHandler(result);
    closeModal();
  };
}

function closeModal() {
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modal-form");
  if (!modal || !modalForm) return;
  modal.classList.add("hide");
  modalForm.innerHTML = "";
}

function addProductToCart(productId) {
  const user = currentUser();
  if (!user) {
    window.location.href = "auth.html";
    return;
  }
  const cart = user.cart || [];
  const item = cart.find((entry) => entry.productId === productId);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  updateUserCart(user, cart);
  renderNavigation();
  updateCartCount();
}

function showProductDetail(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.selectedProduct = product;
  const productDetailView = document.getElementById("product-detail-view");
  const detailImage = document.getElementById("detail-image");
  const detailTitle = document.getElementById("detail-title");
  const detailCategory = document.getElementById("detail-category");
  const detailDescription = document.getElementById("detail-description");
  const detailPrice = document.getElementById("detail-price");
  const detailStock = document.getElementById("detail-stock");

  if (!productDetailView || !detailImage) {
    window.location.href = `products.html#product-${productId}`;
    return;
  }

  detailImage.src = product.image;
  detailTitle.textContent = product.title;
  detailCategory.textContent = product.category;
  detailDescription.textContent = product.description;
  detailPrice.textContent = `$${product.price.toFixed(2)}`;
  detailStock.textContent = `In stock: ${product.stock}`;
  productDetailView.classList.remove("hide");
}

function hideDetailView() {
  const productDetailView = document.getElementById("product-detail-view");
  if (!productDetailView) return;
  productDetailView.classList.add("hide");
}

function getHashProductId() {
  if (!location.hash) return null;
  const match = location.hash.match(/^#product-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function logoutUser() {
  saveAuth(null);
  renderNavigation();
  updateCartCount();
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }
});
