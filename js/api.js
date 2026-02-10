const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://chatbackend-kfc9.onrender.com";

window.API_VEHICLES = `${BASE_URL}/api/vehicles`;

