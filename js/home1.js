// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
const API = window.API_VEHICLES;
let vehicles = [];

// ===============================
// LOAD INICIAL
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadVehicles();     // carrega veículos
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

  // limpa antes de popular
  grid.innerHTML = "";
  select.innerHTML = `<option value="">Todas as marcas</option>`;

  BRANDS.forEach(b => {
    // Grid de marcas
    grid.innerHTML += `
      <a href="vehicles.html?brand=${encodeURIComponent(b.name)}" class="brand">
        <img src="${b.logo}" alt="${b.name}">
        <span class="brand-name">${b.name}</span>
      </a>
    `;

    // Select
    select.innerHTML += `<option value="${b.name}">${b.name}</option>`;
  });
}

// ===============================
// MARCAS DISPONÍVEIS NO ESTOQUE
// ===============================
function loadBrandsFromStock() {
  const select = document.getElementById("brandSelect");
  if (!select) return;

  // limpa select antes de popular
  select.innerHTML = `<option value="">Todas as marcas</option>`;

  const availableVehicles = vehicles.filter(v => v.status === "disponivel");

  // marcas únicas no estoque
  const brandsInStock = [...new Set(availableVehicles.map(v => v.brand).filter(Boolean))];

  // ordena alfabeticamente
  brandsInStock.sort();

  brandsInStock.forEach(brand => {
    select.innerHTML += `<option value="${brand}">${brand}</option>`;
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
    if (brand) {
      url += `?brand=${encodeURIComponent(brand)}`;
    }
    window.location.href = url;
  });
}

// ===============================
// CARREGAR VEÍCULOS
// ===============================
async function loadVehicles() {
  try {
    const res = await fetch(API);
    vehicles = await res.json();
  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
  }
}

// ===============================
// RENDERIZA DESTAQUES
// ===============================
function renderFeatured() {
  const container = document.getElementById("featuredVehicles");
  if (!container) return;

  // filtra veículos destacados e disponíveis
  const featured = vehicles.filter(v => v.status === "disponivel" && v.featured);

  container.innerHTML = "";

  // mostra no máximo 6 veículos
  featured.slice(0, 6).forEach(v => {
    const image = v.photos?.[0] || v.image || "img/no-image.png";

    container.innerHTML += `
      <div class="card">
        <img src="${image}" alt="${v.brand} ${v.model}" loading="lazy">
        <h3>${v.brand} ${v.model}</h3>
        <div class="card-specs">
          <span>📅 ${v.year || "-"}</span>
          <span>⚡ ${v.power || "-"}</span>
        </div>
        <strong>R$ ${Number(v.price).toLocaleString("pt-BR")}</strong>
        <a href="vehicle-details.html?id=${v.id}" class="details-btn">Ver detalhes</a>
      </div>
    `;
  });
}
