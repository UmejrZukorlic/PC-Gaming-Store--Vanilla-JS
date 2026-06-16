import { formatCurrency, truncateText } from "../../utils/formatters.js";
import { escapeHtml } from "../../utils/helpers.js";

export function productCard(product) {
  return `
    <article class="card" data-id="${product.id}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" />
      <span class="tag">${escapeHtml(product.category)}</span>
      <h3>${escapeHtml(product.title)}</h3>
      <p>${escapeHtml(truncateText(product.description, 80))}</p>
      <div class="actions">
        <span class="price">${formatCurrency(product.price)}</span>
        <button class="secondary-btn view-product-btn" data-id="${product.id}">View</button>
      </div>
    </article>
  `;
}

export function renderProductGrid(container, products, emptyMessage) {
  if (!container) return;
  container.innerHTML = products.length
    ? products.map(productCard).join("")
    : `<p class="empty-inline">${escapeHtml(emptyMessage)}</p>`;
}

export function bindProductCardNavigation(container) {
  container?.addEventListener("click", (event) => {
    const viewBtn = event.target.closest(".view-product-btn");
    if (!viewBtn) return;
    window.location.href = `product.html?id=${Number(viewBtn.dataset.id)}`;
  });
}

