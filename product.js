function getProductIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id")) || null;
}

function renderProductDetailPage(product) {
  const image = document.getElementById("product-image");
  const title = document.getElementById("product-title");
  const category = document.getElementById("product-category");
  const description = document.getElementById("product-description");
  const price = document.getElementById("product-price");
  const stock = document.getElementById("product-stock");
  const addCart = document.getElementById("product-add-cart");

  if (
    !image ||
    !title ||
    !category ||
    !description ||
    !price ||
    !stock ||
    !addCart
  )
    return;

  image.src = product.image;
  title.textContent = product.title;
  category.textContent = product.category;
  description.textContent = product.description;
  price.textContent = `$${product.price.toFixed(2)}`;
  stock.textContent = `In stock: ${product.stock}`;

  addCart.addEventListener("click", () => {
    addProductToCart(product.id);
  });
}

function initProductPage() {
  loadStorage();
  fetchProductsFromApi().finally(() => {
    renderNavigation();
    updateCartCount();
    const productId = getProductIdFromQuery();
    const product = state.products.find((item) => item.id === productId);
    if (!product) {
      window.location.href = "products.html";
      return;
    }
    renderProductDetailPage(product);
  });

  const detailBack = document.getElementById("detail-back");
  if (detailBack) {
    detailBack.addEventListener("click", () => {
      window.location.href = "products.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", initProductPage);
