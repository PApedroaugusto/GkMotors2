const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gkmotors.onrender.com";

window.API_VEHICLES = `${BASE_URL}/api/vehicles`;

// Exemplo de fetch
async function fetchVehicles() {
  const res = await fetch(window.API_VEHICLES);
  const data = await res.json();
  console.log(data);
}

fetchVehicles();
