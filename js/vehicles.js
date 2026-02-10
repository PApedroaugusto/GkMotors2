/* ===============================
   VEHICLES PAGE
================================ */
const API = window.API_VEHICLES;

const grid = document.getElementById("vehiclesGrid");
const brandFilter = document.getElementById("brandFilter");
const yearFilter = document.getElementById("yearFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("vehicleCount");

let vehicles = [];
let currentFiltered = [];
let displayed = 0;
const BATCH_SIZE = 6;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const res = await fetch(API);
    vehicles = await res.json();
    populateFilters();
    applyUrlFilters();
    applyFilters();
  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
  }
}

/* ===============================
   FILTROS DA URL
================================ */
function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const brandFromUrl = params.get("brand");
  if (brandFromUrl) brandFilter.value = brandFromUrl;
}

/* ===============================
   POPULAR FILTROS
================================ */
function populateFilters() {
  const brands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort();
  const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a,b) => b-a);
  const categories = [...new Set(vehicles.map(v => v.category).filter(Boolean))].sort();

  brandFilter.innerHTML = `<option value="">Todas as marcas</option>`;
  yearFilter.innerHTML = `<option value="">Todos os anos</option>`;
  categoryFilter.innerHTML = `<option value="">Todas categorias</option>`;

  brands.forEach(b => brandFilter.innerHTML += `<option value="${b}">${b}</option>`);
  years.forEach(y => yearFilter.innerHTML += `<option value="${y}">${y}</option>`);
  categories.forEach(c => categoryFilter.innerHTML += `<option value="${c}">${c}</option>`);
}

/* ===============================
   EVENTOS FILTROS
================================ */
[brandFilter, yearFilter, categoryFilter, priceFilter, sortFilter].forEach(el => el.addEventListener("change", applyFilters));
searchInput.addEventListener("keyup", applyFilters);
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (displayed < currentFiltered.length) renderVehicles(currentFiltered, false);
  }
});

/* ===============================
   APLICAR FILTROS
================================ */
function applyFilters() {
  let result = vehicles.filter(v => v.status === "disponivel");
  const search = searchInput.value.toLowerCase();

  if (search) result = result.filter(v => v.brand?.toLowerCase().includes(search) || v.model?.toLowerCase().includes(search));
  if (brandFilter.value) result = result.filter(v => v.brand === brandFilter.value);
  if (yearFilter.value) result = result.filter(v => String(v.year) === yearFilter.value);
  if (categoryFilter.value) result = result.filter(v => v.category === categoryFilter.value);
  if (priceFilter.value) {
    if (priceFilter.value.includes("-")) {
      const [min, max] = priceFilter.value.split("-").map(Number);
      result = result.filter(v => v.price >= min && v.price <= max);
    } else result = result.filter(v => v.price >= Number(priceFilter.value));
  }
  if (sortFilter.value === "price_asc") result.sort((a,b) => a.price - b.price);
  if (sortFilter.value === "price_desc") result.sort((a,b) => b.price - a.price);
  if (sortFilter.value === "newest") result.sort((a,b) => b.id - a.id);

  renderVehicles(result, true);
}

/* ===============================
   RENDER CARDS
================================ */
function renderVehicles(list, reset = true) {
  if (reset) {
    grid.innerHTML = "";
    displayed = 0;
    currentFiltered = list;
  }
  const nextBatch = currentFiltered.slice(displayed, displayed + BATCH_SIZE);

  nextBatch.forEach(vehicle => {
    const image = vehicle.photos?.[0] || vehicle.image || "img/no-image.png";
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.innerHTML = `
      <div class="image"><img src="${image}" alt="${vehicle.brand} ${vehicle.model}" loading="lazy"></div>
      <div class="info">
        <span class="brand">${vehicle.brand}</span>
        <h3>${vehicle.model}</h3>
        <div class="specs">
          <span>📅 ${vehicle.year || "-"}</span>
          <span>⚡ ${vehicle.power || "-"}</span>
        </div>
        <strong class="price">R$ ${Number(vehicle.price).toLocaleString("pt-BR")}</strong>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `vehicle-details.html?id=${vehicle.id}`;
    });
    grid.appendChild(card);
  });

  displayed += nextBatch.length;
  count.innerText = `${currentFiltered.length} veículos disponíveis`;
}
