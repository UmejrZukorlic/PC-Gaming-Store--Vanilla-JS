import { toNumber } from "./helpers.js";

export function validationMessage(errors) {
  if (!errors) return null;
  return Object.values(errors).flat().join(" ");
}

export function validateGame(formData) {
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

export function validateUser(formData, isCreate = false) {
  if (!formData.name || !formData.email) {
    throw new Error("Name and email are required.");
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

