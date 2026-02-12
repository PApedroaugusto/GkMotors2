document.addEventListener("DOMContentLoaded", () => {
  const sb = window.supabaseClient;
  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("error");

  if (!sb) {
    console.error("Supabase não inicializado");
    return;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(error.message);
        errorMsg.classList.remove("hidden");
        return;
      }

      // Login OK
      window.location.replace("admin.html");
    });
  }
});
