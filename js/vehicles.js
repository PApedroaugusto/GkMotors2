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

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadVehicles();
  setupFilters();
  setupSearch();
});

// ===============================
// LOAD VEÍCULOS
// ===============================
async function loadVehicles() {
  try {
    const { data, error } = await sb
      .from(VEHICLE_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    vehicles = data || [];

    renderVehicles(vehicles);
    updateVehicleCount();
    populateFilterOptions();
  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
    if (vehicleCount) vehicleCount.innerText = "Erro ao carregar veículos";
  }
}

// ===============================
// RENDER VEÍCULOS
// ===============================
function renderVehicles(list) {
  if (!vehiclesGrid) return;
  vehiclesGrid.innerHTML = "";

  if (!list.length) {
    vehiclesGrid.innerHTML = "<p>Nenhum veículo encontrado.</p>";
    return;
  }

  list.forEach(v => {
    const img = v.photos?.[0] || "img/no-image.png";

    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.innerHTML = `
      <img src="${img}" alt="${v.brand || ''} ${v.model || ''}">
      <h3>${v.brand || '-'} ${v.model || '-'}</h3>
      <p>📅 ${v.year || '-'}</p>
      <p>⚡ ${v.power || '-'}</p>
      <p>💰 R$ ${Number(v.price || 0).toLocaleString("pt-BR")}</p>
    `;

    // REDIRECIONAR AO CLICAR
    card.addEventListener("click", () => {
      window.location.href = `vehicle-details.html?id=${v.id}`;
    });

    vehiclesGrid.appendChild(card);
  });
}

// ===============================
// COUNT
// ===============================
function updateVehicleCount() {
  if (!vehicleCount) return;
  vehicleCount.innerText = `Total de veículos: ${vehicles.length}`;
}

// ===============================
// FILTROS
// ===============================
function populateFilterOptions() {
  if (!vehicles.length) return;

  const brands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort();
  brands.forEach(b => {
    if (!Array.from(brandFilter.options).some(o => o.value === b)) {
      const option = document.createElement("option");
      option.value = b;
      option.textContent = b;
      brandFilter.appendChild(option);
    }
  });

  const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a,b)=>b-a);
  years.forEach(y => {
    if (!Array.from(yearFilter.options).some(o => o.value == y)) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      yearFilter.appendChild(option);
    }
  });

  const categories = [...new Set(vehicles.map(v => v.category).filter(Boolean))].sort();
  categories.forEach(c => {
    if (!Array.from(categoryFilter.options).some(o => o.value === c)) {
      const option = document.createElement("option");
      option.value = c;
      option.textContent = c;
      categoryFilter.appendChild(option);
    }
  });
}

function setupFilters() {
  brandFilter?.addEventListener("change", applyFilters);
  yearFilter?.addEventListener("change", applyFilters);
  categoryFilter?.addEventListener("change", applyFilters);
  priceFilter?.addEventListener("change", applyFilters);
  sortFilter?.addEventListener("change", applyFilters);
}

function clearFilters() {
  brandFilter.value = "";
  yearFilter.value = "";
  categoryFilter.value = "";
  priceFilter.value = "";
  sortFilter.value = "newest";
  searchInput.value = "";
  renderVehicles(vehicles);
}

// ===============================
// SEARCH
// ===============================
function setupSearch() {
  searchInput?.addEventListener("input", () => applyFilters());
}

// ===============================
// APLICAR FILTROS
// ===============================
function applyFilters() {
  let filtered = [...vehicles];

  const brandVal = brandFilter?.value;
  const yearVal = yearFilter?.value;
  const categoryVal = categoryFilter?.value;
  const priceVal = priceFilter?.value;
  const searchVal = searchInput?.value.toLowerCase();

  if (brandVal) filtered = filtered.filter(v => v.brand === brandVal);
  if (yearVal) filtered = filtered.filter(v => String(v.year) === String(yearVal));
  if (categoryVal) filtered = filtered.filter(v => v.category === categoryVal);

  if (priceVal) {
    if (priceVal.includes("-")) {
      const [min,max] = priceVal.split("-").map(Number);
      filtered = filtered.filter(v => v.price >= min && v.price <= max);
    } else if (priceVal === "200000") {
      filtered = filtered.filter(v => v.price >= 200000);
    }
  }

  if (searchVal) {
    filtered = filtered.filter(v => `${v.brand || ''} ${v.model || ''}`.toLowerCase().includes(searchVal));
  }

  // SORT
  if (sortFilter?.value === "price_asc") filtered.sort((a,b)=>a.price-b.price);
  else if (sortFilter?.value === "price_desc") filtered.sort((a,b)=>b.price-a.price);
  else filtered.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

  renderVehicles(filtered);
}

// ===============================
// TOGGLE FILTROS
// ===============================
function toggleFilters() {
  const filters = document.getElementById("filtersHidden");
  if (!filters) return;
  filters.style.display = filters.style.display === "block" ? "none" : "block";
}
