import { renderProductGrid, bindProductCardNavigation } from "../../components/product-card/product-card.js";
import { renderNavigation, updateCartCount, syncNavigation } from "../../components/navbar/navbar.js";
import { addProductToCart } from "../../services/cart.service.js";
import { loadProductsFromApi } from "../../services/product.service.js";
import { loadState, state } from "../../services/state.service.js";
import { ROUTES } from "../../utils/constants.js";
import { formatCurrency } from "../../utils/formatters.js";
import { getQueryNumber } from "../../utils/helpers.js";

function renderProductDetailPage(product) {
  const image = document.getElementById("product-image");
  const title = document.getElementById("product-title");
  const category = document.getElementById("product-category");
  const categoryTag = document.getElementById("product-category-tag");
  const description = document.getElementById("product-description");
  const price = document.getElementById("product-price");
  const stock = document.getElementById("product-stock");
  const addCart = document.getElementById("product-add-cart");
  if (!image || !title || !category || !description || !price || !stock || !addCart) return;

  image.src = product.image;
  title.textContent = product.title;
  category.textContent = product.category;
  if (categoryTag) categoryTag.textContent = product.category;
  description.textContent = product.description;
  price.textContent = formatCurrency(product.price);
  stock.textContent = `In stock: ${product.stock}`;

  addCart.addEventListener("click", () => {
    addProductToCart(product.id);
    renderNavigation();
    updateCartCount();
  });
}

function renderRelatedProducts(product) {
  const related = state.products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);
  renderProductGrid(document.getElementById("related-products"), related, "No related games found.");
  bindProductCardNavigation(document.getElementById("related-products"));
}

async function initProductPage() {
  loadState();
  await loadProductsFromApi();
  syncNavigation();

  const product = state.products.find((item) => item.id === getQueryNumber("id"));
  if (!product) {
    window.location.href = ROUTES.products;
    return;
  }

  renderProductDetailPage(product);
  renderRelatedProducts(product);
  document.getElementById("detail-back")?.addEventListener("click", () => {
    window.location.href = ROUTES.products;
  });
}

document.addEventListener("DOMContentLoaded", initProductPage);

