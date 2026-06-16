import { bindNewsletterForm } from "../../components/footer/footer.js";
import {
  bindProductCardNavigation,
  renderProductGrid,
} from "../../components/product-card/product-card.js";
import { syncNavigation } from "../../components/navbar/navbar.js";
import { loadProductsFromApi } from "../../services/product.service.js";
import { loadState, state } from "../../services/state.service.js";

function renderHomeProducts() {
  renderProductGrid(
    document.getElementById("home-product-grid"),
    state.products.slice(0, 6),
    "No featured games available.",
  );
}

async function initHomePage() {
  loadState();
  await loadProductsFromApi();
  syncNavigation();
  renderHomeProducts();
  bindProductCardNavigation(document.getElementById("home-product-grid"));
  bindNewsletterForm();
}

document.addEventListener("DOMContentLoaded", initHomePage);

