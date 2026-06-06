function renderProductsPage() {
  const productGrid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");
  if (!productGrid) return;

  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const filter = filterSelect ? filterSelect.value : "all";
  const filtered = state.products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);
    const matchesFilter =
      filter === "all" ||
      product.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  productGrid.innerHTML =
    filtered
      .map(
        (product) => `
      <article class="card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.title}" />
        <span class="tag">${product.category}</span>
        <h3>${product.title}</h3>
        <p>${product.description.slice(0, 80)}...</p>
        <div class="actions">
          <span class="price">$${product.price.toFixed(2)}</span>
          <button class="secondary-btn view-product-btn" data-id="${product.id}">View</button>
        </div>
      </article>
    `,
      )
      .join("") || "<p>No games match your search.</p>";
}

function initProductsPage() {
  loadStorage();
  fetchProductsFromApi().finally(() => {
    renderNavigation();
    updateCartCount();
    renderProductsPage();
    const productId = getHashProductId();
    if (productId) showProductDetail(productId);
  });

  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");
  const productGrid = document.getElementById("product-grid");
  const detailAddCart = document.getElementById("detail-add-cart");
  const detailBack = document.getElementById("detail-back");

  if (searchInput) {
    searchInput.addEventListener("input", renderProductsPage);
  }
  if (filterSelect) {
    filterSelect.addEventListener("change", renderProductsPage);
  }
  if (productGrid) {
    productGrid.addEventListener("click", (event) => {
      const viewBtn = event.target.closest(".view-product-btn");
      if (!viewBtn) return;
      const productId = Number(viewBtn.dataset.id);
      window.location.href = `product.html?id=${productId}`;
    });
  }
  if (detailAddCart) {
    detailAddCart.addEventListener("click", () => {
      const productId = state.selectedProduct?.id;
      if (productId) {
        addProductToCart(productId);
        hideDetailView();
      }
    });
  }
  if (detailBack) {
    detailBack.addEventListener("click", () => {
      hideDetailView();
      window.location.hash = "";
    });
  }
}

document.addEventListener("DOMContentLoaded", initProductsPage);
