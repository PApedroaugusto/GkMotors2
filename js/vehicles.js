const sb = window.supabaseClient;
const VEHICLE_TABLE = "vehicles";

const vehiclesGrid = document.getElementById("vehiclesGrid");
const vehicleCount = document.getElementById("vehicleCount");
const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");
const yearFilter = document.getElementById("yearFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");

let vehicles = [];
let currentFiltered = [];
let displayed = 0;
const BATCH_SIZE = 6;

document.addEventListener("DOMContentLoaded", async () => {
  await loadVehicles();
  populateFilters();
  applyUrlFilters(); // aplica filtro da marca via URL
  applyFilters();    // filtra os veículos
  setupFilters();
  setupSearch();
  setupInfiniteScroll();
});

// ===============================
// CARREGA VEÍCULOS DO SUPABASE
// ===============================
async function loadVehicles() {
  try {
    const { data, error } = await sb
      .from(VEHICLE_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    vehicles = data || [];
  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
    if (vehicleCount) vehicleCount.innerText = "Erro ao carregar veículos";
  }
}

// ===============================
// POPULAR FILTROS
// ===============================
function populateFilters() {
  const brands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort();
  const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a,b)=>b-a);
  const categories = [...new Set(vehicles.map(v=>v.category).filter(Boolean))].sort();

  if (brandFilter) brandFilter.innerHTML = `<option value="">Todas as marcas</option>`;
  if (yearFilter) yearFilter.innerHTML = `<option value="">Todos os anos</option>`;
  if (categoryFilter) categoryFilter.innerHTML = `<option value="">Todas categorias</option>`;

  brands.forEach(b => brandFilter?.insertAdjacentHTML("beforeend", `<option value="${b}">${b}</option>`));
  years.forEach(y => yearFilter?.insertAdjacentHTML("beforeend", `<option value="${y}">${y}</option>`));
  categories.forEach(c => categoryFilter?.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));
}

// ===============================
// APLICAR FILTRO DA URL
// ===============================
function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const brandFromUrl = params.get("brand");
  if (brandFromUrl && brandFilter) brandFilter.value = brandFromUrl;
}

// ===============================
// SETUP FILTROS
// ===============================
function setupFilters() {
  [brandFilter, yearFilter, categoryFilter, priceFilter, sortFilter].forEach(el => {
    el?.addEventListener("change", applyFilters);
  });
}

// ===============================
// SETUP BUSCA
// ===============================
function setupSearch() {
  searchInput?.addEventListener("input", applyFilters);
}

// ===============================
// SCROLL INFINITO
// ===============================
function setupInfiniteScroll() {
  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      if (displayed < currentFiltered.length) renderVehicles(currentFiltered, false);
    }
  });
}

// ===============================
// APLICAR FILTROS
// ===============================
function applyFilters() {
  let filtered = vehicles.filter(v => v.status?.toLowerCase() === "disponível");

  // Busca
  const search = searchInput?.value.toLowerCase();
  if (search) filtered = filtered.filter(v => `${v.brand} ${v.model}`.toLowerCase().includes(search));

  // Marca
  if (brandFilter.value) filtered = filtered.filter(v => v.brand === brandFilter.value);

  // Ano
  if (yearFilter.value) filtered = filtered.filter(v => String(v.year) === yearFilter.value);

  // Categoria
  if (categoryFilter.value) filtered = filtered.filter(v => v.category === categoryFilter.value);

  // Preço
  if (priceFilter.value) {
    if (priceFilter.value.includes("-")) {
      const [min,max] = priceFilter.value.split("-").map(Number);
      filtered = filtered.filter(v => v.price >= min && v.price <= max);
    } else if (priceFilter.value === "200000") {
      filtered = filtered.filter(v => v.price >= 200000);
    }
  }

  // Ordenação
  if (sortFilter.value === "price_asc") filtered.sort((a,b)=>a.price-b.price);
  else if (sortFilter.value === "price_desc") filtered.sort((a,b)=>b.price-a.price);
  else filtered.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

  currentFiltered = filtered;
  displayed = 0;
  renderVehicles(currentFiltered, true);
}

// ===============================
// RENDER CARDS
// ===============================
function renderVehicles(list, reset = true) {
  if (!vehiclesGrid) return;

  if (reset) vehiclesGrid.innerHTML = "";

  const nextBatch = list.slice(displayed, displayed + BATCH_SIZE);

  nextBatch.forEach(v => {
    const image = v.photos?.[0] || v.image || "img/no-image.png";

    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.innerHTML = `
      <div class="image"><img src="${image}" alt="${v.brand} ${v.model}" loading="lazy"></div>
      <div class="info">
        <span class="brand">${v.brand}</span>
        <h3>${v.model}</h3>
        <div class="specs">
          <span>📅 ${v.year || "-"}</span>
          <span>⚡ ${v.power || "-"}</span>
        </div>
        <strong class="price">R$ ${Number(v.price).toLocaleString("pt-BR")}</strong>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `vehicle-details.html?id=${v.id}`;
    });

    vehiclesGrid.appendChild(card);
  });

  displayed += nextBatch.length;
  if (vehicleCount) vehicleCount.innerText = `${currentFiltered.length} veículos disponíveis`;
}

// ===============================
// FUNÇÕES PARA BOTÕES
// ===============================
function clearFilters() {
  if (!brandFilter || !yearFilter || !categoryFilter || !priceFilter || !sortFilter || !searchInput) return;

  brandFilter.value = "";
  yearFilter.value = "";
  categoryFilter.value = "";
  priceFilter.value = "";
  sortFilter.value = "newest";
  searchInput.value = "";
  applyFilters();
}

function toggleFilters() {
  const filters = document.getElementById("filtersHidden");
  if (!filters) return;
  filters.style.display = filters.style.display === "block" ? "none" : "block";
}
