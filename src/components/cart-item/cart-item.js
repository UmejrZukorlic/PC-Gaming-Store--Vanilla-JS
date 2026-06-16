import { formatCurrency } from "../../utils/formatters.js";
import { escapeHtml } from "../../utils/helpers.js";

export function cartItemCard(item, product) {
  const itemTotal = product.price * item.quantity;
  return `
    <article class="cart-card">
      <div class="cart-card-image">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" />
      </div>
      <div class="cart-card-info">
        <h3>${escapeHtml(product.title)}</h3>
        <p class="cart-card-category">${escapeHtml(product.category)}</p>
        <div class="cart-card-quantity">
          <button class="btn-quantity cart-change" data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="btn-quantity cart-change" data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-card-price">
        <span class="price">${formatCurrency(itemTotal)}</span>
        <button class="btn-remove cart-remove" data-id="${product.id}" aria-label="Remove item">Remove</button>
      </div>
    </article>
  `;
}

