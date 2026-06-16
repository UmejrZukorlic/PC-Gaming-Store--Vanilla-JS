import { STORAGE_KEYS } from "../utils/constants.js";
import { readJson, writeJson } from "../utils/storage.js";

export const state = {
  products: [],
  users: [],
  orders: [],
  auth: null,
  selectedProduct: null,
  adminTab: "products",
};

function defaultUsers() {
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

export function loadState() {
  const storage = readJson(STORAGE_KEYS.APP_STATE, {});
  state.products = storage.products || [];
  state.users = storage.users || defaultUsers();
  state.orders = storage.orders || [];
  state.auth = storage.auth || null;
  persistState();
}

export function persistState() {
  writeJson(STORAGE_KEYS.APP_STATE, {
    products: state.products,
    users: state.users,
    orders: state.orders,
    auth: state.auth,
  });
}

export function setProducts(products) {
  state.products = products;
  persistState();
}

export function setUsers(users) {
  state.users = users;
  persistState();
}

export function setOrders(orders) {
  state.orders = orders;
  persistState();
}

