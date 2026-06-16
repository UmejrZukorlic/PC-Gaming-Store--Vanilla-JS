export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getQueryNumber(name) {
  return Number(new URLSearchParams(window.location.search).get(name)) || null;
}

export function getHashProductId() {
  const match = window.location.hash.match(/^#product-(\d+)$/);
  return match ? Number(match[1]) : null;
}

