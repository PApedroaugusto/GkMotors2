// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
const sb = window.supabaseClient; // Supabase já inicializado no HTML
const VEHICLE_TABLE = "vehicles";
let vehicles = [];

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadVehicles();     // carrega veículos do Supabase
  loadBrands();             // carrega marcas fixas
  loadBrandsFromStock();    // carrega marcas disponíveis no estoque
  renderFeatured();         // mostra destaques
  setupSearch();            // configura busca por marca
});

// ===============================
// MARCAS FIXAS
// ===============================
const BRANDS = [
  { name: "Chevrolet", logo: "assets/brands/chevrolet.png" },
  { name: "Fiat", logo: "assets/brands/fiat.png" },
  { name: "Ford", logo: "assets/brands/ford.png" },
  { name: "Honda", logo: "assets/brands/honda.png" },
  { name: "Hyundai", logo: "assets/brands/hyundai.png" },
  { name: "Jeep", logo: "assets/brands/jeep.png" },
  { name: "Toyota", logo: "assets/brands/toyota.png" },
  { name: "Volkswagen", logo: "assets/brands/volkswagen.png" },
];

function loadBrands() {
  const grid = document.getElementById("brandsGrid");
  const select = document.getElementById("brandSelect");
  if (!grid || !select) return;

  grid.innerHTML = "";
  select.innerHTML = `<option value="">Todas as marcas</option>`;

  BRANDS.forEach(b => {
    grid.innerHTML += `
      <a href="vehicles.html?brand=${encodeURIComponent(b.name)}" class="brand">
        <img src="${b.logo}" alt="${b.name}">
        <span class="brand-name">${b.name}</span>
      </a>
    `;
    select.innerHTML += `<option value="${b.name}">${b.name}</option>`;
  });
}

// ===============================
// MARCAS DISPONÍVEIS NO ESTOQUE
// ===============================
function loadBrandsFromStock() {
  const select = document.getElementById("brandSelect");
  if (!select || !vehicles.length) return;

  const availableVehicles = vehicles.filter(v => v.status?.toLowerCase() === "disponível");

  const brandsInStock = [...new Set(availableVehicles.map(v => v.brand).filter(Boolean))].sort();

  brandsInStock.forEach(brand => {
    if (!Array.from(select.options).some(o => o.value === brand)) {
      select.innerHTML += `<option value="${brand}">${brand}</option>`;
    }
  });
}

// ===============================
// CONFIGURA BUSCA
// ===============================
function setupSearch() {
  const button = document.getElementById("searchBtn");
  const brandSelect = document.getElementById("brandSelect");
  if (!button || !brandSelect) return;

  button.addEventListener("click", () => {
    const brand = brandSelect.value;
    let url = "vehicles.html";
    if (brand) url += `?brand=${encodeURIComponent(brand)}`;
    window.location.href = url;
  });
}

// ===============================
// CARREGAR VEÍCULOS DO SUPABASE
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
    console.error("Erro ao carregar veículos do Supabase:", err);
  }
}

// ===============================
// RENDERIZA DESTAQUES
// ===============================
function renderFeatured() {
  const container = document.getElementById("featuredVehicles");
  if (!container || !vehicles.length) return;

  const featuredVehicles = vehicles.filter(v => v.status?.toLowerCase() === "disponível" && v.featured);

  container.innerHTML = "";

  featuredVehicles.slice(0, 6).forEach(v => {
    const image = v.photos?.[0] || v.image || "img/no-image.png";

    container.innerHTML += `
      <div class="card" onclick="window.location.href='vehicle-details.html?id=${v.id}'">
        <img src="${image}" alt="${v.brand} ${v.model}" loading="lazy">
        <h3>${v.brand} ${v.model}</h3>
        <div class="card-specs">
          <span>📅 ${v.year || "-"}</span>
          <span>⚡ ${v.power || "-"}</span>
        </div>
        <strong>R$ ${Number(v.price).toLocaleString("pt-BR")}</strong>
      </div>
    `;
  });
}
