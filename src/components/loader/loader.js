export function showLoader() {
  let loader = document.getElementById("admin-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "admin-loader";
    loader.className = "admin-loader hide";
    loader.innerHTML = '<div class="admin-loader-spinner"></div><span>Loading...</span>';
    document.body.appendChild(loader);
  }
  loader.classList.remove("hide");
}

export function hideLoader() {
  document.getElementById("admin-loader")?.classList.add("hide");
}

export function setButtonLoading(button, isLoading, loadingText = "Saving...") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || "Save";
    button.disabled = false;
  }
}

