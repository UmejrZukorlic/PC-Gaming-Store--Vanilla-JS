import {
  bindProductCardNavigation,
  renderProductGrid,
} from "../../components/product-card/product-card.js";
import { syncNavigation } from "../../components/navbar/navbar.js";
import { loadProductsFromApi } from "../../services/product.service.js";
import { loadState, state } from "../../services/state.service.js";

function filteredProducts() {
  const search = document.getElementById("search-input")?.value.toLowerCase().trim() || "";
  const filter = document.getElementById("filter-select")?.value || "all";
  return state.products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);
    const matchesFilter =
      filter === "all" || product.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });
}

function renderProductsPage() {
  renderProductGrid(
    document.getElementById("product-grid"),
    filteredProducts(),
    "No games match your search.",
  );
}

async function initProductsPage() {
  loadState();
  await loadProductsFromApi();
  syncNavigation();
  renderProductsPage();

  document.getElementById("search-input")?.addEventListener("input", renderProductsPage);
  document.getElementById("filter-select")?.addEventListener("change", renderProductsPage);
  bindProductCardNavigation(document.getElementById("product-grid"));
}

document.addEventListener("DOMContentLoaded", initProductsPage);

