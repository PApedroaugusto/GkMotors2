const ADMIN_USER = "Gkmotors";
const ADMIN_PASS = "admin12345";
const AUTH_KEY = "admin_logged";

const form = document.getElementById("login-form");
const error = document.getElementById("error");

// 🔹 LOGIN
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem(AUTH_KEY, "true");
      window.location.href = "admin.html";
    } else {
      error.classList.remove("hidden");
    }
  });
}

// 🔹 PROTEÇÃO DO ADMIN
function protectAdmin() {
  if (localStorage.getItem(AUTH_KEY) !== "true") {
    window.location.href = "login.html";
  }
}

// 🔹 LOGOUT
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}
