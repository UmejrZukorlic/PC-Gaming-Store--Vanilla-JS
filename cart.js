function renderCartPage() {
  const cartList = document.getElementById("cart-list");
  const emptyState = document.getElementById("empty-cart-state");
  const cartTotal = document.getElementById("cart-total");
  const subtotal = document.getElementById("subtotal");
  const tax = document.getElementById("tax");
  const checkoutBtn = document.getElementById("checkout-btn");
  const user = currentUser();
  if (!cartList || !cartTotal || !checkoutBtn) return;

  if (!user) {
    cartList.innerHTML = "";
    emptyState?.classList.remove("hide");
    cartTotal.textContent = "$0.00";
    checkoutBtn.disabled = true;
    return;
  }

  const cart = user.cart || [];
  if (cart.length === 0) {
    cartList.innerHTML = "";
    emptyState?.classList.remove("hide");
    cartTotal.textContent = "$0.00";
    checkoutBtn.disabled = true;
    if (subtotal) subtotal.textContent = "$0.00";
    if (tax) tax.textContent = "$0.00";
    return;
  }

  emptyState?.classList.add("hide");
  cartList.innerHTML = cart
    .map((item) => {
      const product = state.products.find(
        (product) => product.id === item.productId,
      );
      if (!product) return "";
      const itemTotal = product.price * item.quantity;
      return `
      <article class="cart-card">
        <div class="cart-card-image">
          <img src="${product.image}" alt="${product.title}" />
        </div>
        <div class="cart-card-info">
          <h3>${product.title}</h3>
          <p class="cart-card-category">${product.category}</p>
          <div class="cart-card-quantity">
            <button class="btn-quantity cart-change" data-action="decrease" data-id="${product.id}">−</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="btn-quantity cart-change" data-action="increase" data-id="${product.id}">+</button>
          </div>
        </div>
        <div class="cart-card-price">
          <span class="price">$${itemTotal.toFixed(2)}</span>
          <button class="btn-remove cart-remove" data-id="${product.id}">🗑</button>
        </div>
      </article>
    `;
    })
    .join("");

  const total = cart.reduce((sum, item) => {
    const product = state.products.find(
      (product) => product.id === item.productId,
    );
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const taxAmount = total * 0.1;
  cartTotal.textContent = `$${(total + taxAmount).toFixed(2)}`;
  if (subtotal) subtotal.textContent = `$${total.toFixed(2)}`;
  if (tax) tax.textContent = `$${taxAmount.toFixed(2)}`;
  checkoutBtn.disabled = false;
}

function placeOrder() {
  const user = currentUser();
  if (!user) return;
  const cart = user.cart || [];
  if (cart.length === 0) return;

  const orderItems = cart.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
  const total = cart.reduce((sum, item) => {
    const product = state.products.find(
      (product) => product.id === item.productId,
    );
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const nextOrderId = state.orders.length
    ? Math.max(...state.orders.map((order) => order.id)) + 1
    : 1;
  state.orders.push({
    id: nextOrderId,
    userId: user.id,
    items: orderItems,
    status: "pending",
    total,
    createdAt: new Date().toISOString(),
  });
  updateUserCart(user, []);
  persist();
  renderCartPage();
  alert("Order placed successfully!");
  window.location.href = "orders.html";
}

function handleCartChange(action, productId) {
  const user = currentUser();
  if (!user) return;
  const cart = user.cart || [];
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return;
  if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      user.cart = cart.filter((entry) => entry.productId !== productId);
    }
  } else if (action === "increase") {
    item.quantity += 1;
  }
  updateUserCart(user, user.cart);
  renderCartPage();
  updateCartCount();
}

function removeFromCart(productId) {
  const user = currentUser();
  if (!user) return;
  user.cart = (user.cart || []).filter(
    (entry) => entry.productId !== productId,
  );
  updateUserCart(user, user.cart);
  renderCartPage();
  updateCartCount();
}

function initCartPage() {
  loadStorage();
  fetchProductsFromApi().finally(() => {
    renderNavigation();
    updateCartCount();
    renderCartPage();
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  const cartList = document.getElementById("cart-list");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", placeOrder);
  }
  if (cartList) {
    cartList.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      const productId = Number(target.dataset.id);
      if (target.classList.contains("cart-remove")) {
        removeFromCart(productId);
        return;
      }
      if (target.classList.contains("cart-change")) {
        handleCartChange(target.dataset.action, productId);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initCartPage);
