function renderHomeProducts() {
  const homeProductGrid = document.getElementById("home-product-grid");
  if (!homeProductGrid) return;

  const featured = state.products.slice(0, 6);
  homeProductGrid.innerHTML =
    featured
      .map(
        (product) => `
      <article class="card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
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
      .join("") || "<p style='text-align: center; color: var(--text-muted);'>No featured games available.</p>";
}

function initHomePage() {
  loadStorage();
  fetchProductsFromApi().finally(() => {
    renderNavigation();
    updateCartCount();
    renderHomeProducts();
    addProductCardInteractions();
  });

  const homeProductGrid = document.getElementById("home-product-grid");
  if (homeProductGrid) {
    homeProductGrid.addEventListener("click", (event) => {
      const viewBtn = event.target.closest(".view-product-btn");
      if (!viewBtn) return;
      const productId = Number(viewBtn.dataset.id);
      window.location.href = `product.html?id=${productId}`;
    });
  }
}

function addProductCardInteractions() {
  const cards = document.querySelectorAll("#home-product-grid .card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.cursor = "pointer";
    });
  });
}

document.addEventListener("DOMContentLoaded", initHomePage);
