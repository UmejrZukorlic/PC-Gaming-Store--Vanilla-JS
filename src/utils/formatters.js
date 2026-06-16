export function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function truncateText(value, maxLength = 80) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

