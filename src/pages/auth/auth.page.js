import { renderNavigation, updateCartCount, syncNavigation } from "../../components/navbar/navbar.js";
import { isAdmin, login, register } from "../../services/auth.service.js";
import { loadState } from "../../services/state.service.js";
import { ROUTES } from "../../utils/constants.js";

function setMessage(id, text, type) {
  const message = document.getElementById(id);
  if (!message) return;
  message.textContent = text;
  message.className = `message ${type}`;
}

async function handleRegister() {
  const payload = {
    name: document.getElementById("register-name")?.value?.trim(),
    email: document.getElementById("register-email")?.value?.trim(),
    password: document.getElementById("register-password")?.value,
    password_confirmation: document.getElementById("password-confirmation")?.value,
  };
  if (!payload.name || !payload.email || !payload.password || !payload.password_confirmation) {
    setMessage("register-message", "All fields are required.", "error");
    return;
  }

  try {
    await register(payload);
    setMessage("register-message", "Registration complete. You can now login.", "success");
  } catch (error) {
    setMessage("register-message", error.message || "Registration service unavailable.", "error");
  }
}

async function handleLogin() {
  const payload = {
    email: document.getElementById("login-email")?.value?.trim(),
    password: document.getElementById("login-password")?.value,
  };
  if (!payload.email || !payload.password) {
    setMessage("login-message", "Email and password are required.", "error");
    return;
  }

  try {
    const user = await login(payload);
    setMessage("login-message", "Login successful.", "success");
    renderNavigation();
    updateCartCount();
    window.location.href = isAdmin(user) ? ROUTES.admin : ROUTES.home;
  } catch (error) {
    setMessage("login-message", error.message || "Login service unavailable.", "error");
  }
}

function toggleAuthMode(showRegister) {
  document.querySelector(".register-box")?.classList.toggle("hide", !showRegister);
  document.querySelector(".login-box")?.classList.toggle("hide", showRegister);
}

function initAuthPage() {
  loadState();
  syncNavigation();
  document.getElementById("login-submit")?.addEventListener("click", handleLogin);
  document.getElementById("register-submit")?.addEventListener("click", handleRegister);
  document.getElementById("show-register")?.addEventListener("click", () => toggleAuthMode(true));
  document.getElementById("show-login")?.addEventListener("click", () => toggleAuthMode(false));
}

document.addEventListener("DOMContentLoaded", initAuthPage);
