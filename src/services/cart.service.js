import { CART_TAX_RATE, ROUTES } from "../utils/constants.js";
import { currentUser } from "./auth.service.js";
import { persistState, state } from "./state.service.js";

export function updateUserCart(user, cart) {
  const storedUser = state.users.find((item) => item.id === user.id);
  if (storedUser) {
    storedUser.cart = cart;
    persistState();
  }
}

export function addProductToCart(productId) {
  const user = currentUser();
  if (!user) {
    window.location.href = ROUTES.auth;
    return false;
  }

  const cart = user.cart || [];
  const item = cart.find((entry) => entry.productId === productId);
  if (item) item.quantity += 1;
  else cart.push({ productId, quantity: 1 });

  updateUserCart(user, cart);
  return true;
}

export function changeCartItemQuantity(productId, action) {
  const user = currentUser();
  if (!user) return;
  const cart = user.cart || [];
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return;

  if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) user.cart = cart.filter((entry) => entry.productId !== productId);
  }
  if (action === "increase") item.quantity += 1;
  updateUserCart(user, user.cart);
}

export function removeFromCart(productId) {
  const user = currentUser();
  if (!user) return;
  user.cart = (user.cart || []).filter((entry) => entry.productId !== productId);
  updateUserCart(user, user.cart);
}

export function getCartSummary(cart, products) {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((product) => product.id === item.productId);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
  const tax = subtotal * CART_TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

