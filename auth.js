async function registerUser({ name, email, password, password_confirmation }) {
  const message = document.getElementById("register-message");
  if (!message) return;
  if (!name || !email || !password || !password_confirmation) {
    message.textContent = "All fields are required.";
    message.className = "message error";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    const data = await response.json();

    if (!response.ok) {
      const errors = data.errors
        ? Object.values(data.errors).flat().join(" ")
        : data.message || "Registration failed.";
      message.textContent = errors;
      message.className = "message error";
      return;
    }

    const user = data.user || data;
    if (!user || !user.email) {
      throw new Error("Invalid registration response.");
    }

    const nextId = state.users.length
      ? Math.max(...state.users.map((user) => user.id)) + 1
      : 1;
    state.users.push({
      id: nextId,
      name: user.name || name,
      email: user.email,
      password,
      role: user.role || "customer",
      cart: [],
    });
    persist();
    message.textContent = "Registration complete. You can now login.";
    message.className = "message success";
  } catch (error) {
    message.textContent = error.message || "Registration service unavailable.";
    message.className = "message error";
  }
}

async function loginUser({ email, password }) {
  const message = document.getElementById("login-message");
  if (!message) return;
  if (!email || !password) {
    message.textContent = "Email and password are required.";
    message.className = "message error";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      const errors = data.errors
        ? Object.values(data.errors).flat().join(" ")
        : data.message || "Login failed.";
      message.textContent = errors;
      message.className = "message error";
      return;
    }

    const user = data.user || data;
    if (!user || !user.email) {
      throw new Error("Invalid login response.");
    }

    const existingUser = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );
    if (!existingUser) {
      const nextId = state.users.length
        ? Math.max(...state.users.map((user) => user.id)) + 1
        : 1;
      state.users.push({
        id: nextId,
        name: user.name || email,
        email: user.email,
        password,
        role: user.role || "customer",
        cart: [],
      });
      persist();
    } else {
      existingUser.name = user.name || existingUser.name;
      existingUser.role = user.role || existingUser.role;
      persist();
    }

    saveAuth({
      ...user,
      email: user.email,
      name: user.name || existingUser?.name || email,
      role: user.role || existingUser?.role || "customer",
    });
    message.textContent = "Login successful.";
    message.className = "message success";
    renderNavigation();
    updateCartCount();
    window.location.href = "index.html";
  } catch (error) {
    message.textContent = error.message || "Login service unavailable.";
    message.className = "message error";
  }
}

function initAuthPage() {
  loadStorage();
  renderNavigation();
  updateCartCount();

  const loginSubmit = document.getElementById("login-submit");
  const registerSubmit = document.getElementById("register-submit");
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");

  if (loginSubmit) {
    loginSubmit.addEventListener("click", () =>
      loginUser({
        email: document.getElementById("login-email")?.value,
        password: document.getElementById("login-password")?.value,
      }),
    );
  }
  if (registerSubmit) {
    registerSubmit.addEventListener("click", () =>
      registerUser({
        name: document.getElementById("register-name")?.value,
        email: document.getElementById("register-email")?.value,
        password: document.getElementById("register-password")?.value,
        password_confirmation: document.getElementById("password-confirmation")
          ?.value,
      }),
    );
  }
  if (showRegister) {
    showRegister.addEventListener("click", () => {
      document.querySelector(".register-box")?.classList.remove("hide");
      document
        .querySelector(".auth-box:not(.register-box)")
        ?.classList.add("hide");
    });
  }
  if (showLogin) {
    showLogin.addEventListener("click", () => {
      document.querySelector(".register-box")?.classList.add("hide");
      document
        .querySelector(".auth-box:not(.register-box)")
        ?.classList.remove("hide");
    });
  }
}

document.addEventListener("DOMContentLoaded", initAuthPage);
