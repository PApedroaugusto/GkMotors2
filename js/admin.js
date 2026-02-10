const API = "https://seu-backend.onrender.com/vehicles";


// ===============================
// ELEMENTOS
// ===============================
const vehicleTable = document.getElementById("vehicleTable");
const vehicleModal = document.getElementById("vehicleModal");
const previewContainer = document.getElementById("previewContainer");
const imageInput = document.getElementById("imageInput");
const searchInput = document.getElementById("searchInput");

const brand = document.getElementById("brand");
const model = document.getElementById("model");
const year = document.getElementById("year");
const price = document.getElementById("price");
const category = document.getElementById("category");
const rating = document.getElementById("rating");
const fuel = document.getElementById("fuel");
const transmission = document.getElementById("transmission");
const color = document.getElementById("color");
const description = document.getElementById("description");
const status = document.getElementById("status");
const featured = document.getElementById("featured");
const power = document.getElementById("power");

const totalVehicles = document.getElementById("totalVehicles");
const availableVehicles = document.getElementById("availableVehicles");
const soldVehicles = document.getElementById("soldVehicles");
const totalValue = document.getElementById("totalValue");

// ===============================
// STATE
// ===============================
let vehicles = [];
let editingId = null;
let currentPhotos = [];

// ===============================
// LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadVehicles();

  searchInput.addEventListener("input", e => {
    filterVehicles(e.target.value);
  });
});

// ===============================
// FUNÇÕES DE VEÍCULOS
// ===============================
async function loadVehicles() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Erro ao carregar veículos");
    vehicles = await res.json();
    renderTable();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function renderTable(list = vehicles) {
  vehicleTable.innerHTML = "";

  list.forEach(v => {
    const id = v._id || v.id;

    vehicleTable.innerHTML += `
      <tr>
        <td><strong>${v.brand} ${v.model}</strong></td>
        <td>${v.year}</td>
        <td>${v.category || "-"}</td>
        <td>${v.fuel || "-"}</td>
        <td>${v.transmission || "-"}</td>
        <td>R$ ${Number(v.price || 0).toLocaleString("pt-BR")}</td>
        <td>${v.status}</td>
        <td>${v.featured ? "⭐" : "-"}</td>
        <td>
          <button onclick="editVehicle('${id}')">Editar</button>
          <button onclick="deleteVehicle('${id}')">Excluir</button>
        </td>
      </tr>
    `;
  });

  updateStats();
}

function updateStats() {
  totalVehicles.innerText = vehicles.length;
  availableVehicles.innerText = vehicles.filter(v => v.status === "disponivel").length;
  soldVehicles.innerText = vehicles.filter(v => v.status === "vendido").length;

  const total = vehicles.reduce((sum, v) => {
    return v.status === "disponivel" ? sum + Number(v.price || 0) : sum;
  }, 0);

  totalValue.innerText = `R$ ${total.toLocaleString("pt-BR")}`;
}

function filterVehicles(text) {
  const search = text.toLowerCase();

  const filtered = vehicles.filter(v =>
    v.brand?.toLowerCase().includes(search) ||
    v.model?.toLowerCase().includes(search) ||
    v.year?.toString().includes(search) ||
    v.category?.toLowerCase().includes(search) ||
    v.fuel?.toLowerCase().includes(search) ||
    v.transmission?.toLowerCase().includes(search)
  );

  renderTable(filtered);
}

function openForm() {
  vehicleModal.style.display = "flex";
}

function closeForm() {
  editingId = null;
  currentPhotos = [];
  vehicleModal.style.display = "none";

  document.querySelectorAll("#vehicleModal input, textarea, select").forEach(el => el.value = "");
  previewContainer.innerHTML = "";
  imageInput.value = "";
  featured.checked = false;
}

imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      currentPhotos.push(reader.result);
      renderPreview();
    };
    reader.readAsDataURL(file);
  });
  imageInput.value = "";
});

function renderPreview() {
  previewContainer.innerHTML = "";

  currentPhotos.forEach((photo, index) => {
    const img = document.createElement("img");
    img.src = photo;
    img.style.width = "100px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.cursor = "pointer";
    img.onclick = () => {
      currentPhotos.splice(index, 1);
      renderPreview();
    };
    previewContainer.appendChild(img);
  });
}

async function saveVehicle() {
  if (!brand.value || !model.value || !year.value || !price.value) {
    alert("Preencha marca, modelo, ano e preço");
    return;
  }

  if (!currentPhotos.length) {
    alert("Adicione pelo menos uma foto");
    return;
  }

  const token = localStorage.getItem("adminToken") || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const vehicle = {
    brand: brand.value.trim(),
    model: model.value.trim(),
    year: Number(year.value),
    price: Number(price.value),
    power: power.value ? Number(power.value) : null,
    category: category.value || null,
    rating: rating.value ? Number(rating.value) : null,
    fuel: fuel.value || null,
    transmission: transmission.value || null,
    color: color.value || null,
    description: description.value || null,
    photos: currentPhotos,
    image: currentPhotos[0],
    status: status.value,
    featured: featured.checked
  };

  try {
    let res;
    if (editingId) {
      res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(vehicle)
      });
    } else {
      res = await fetch(API, {
        method: "POST",
        headers,
        body: JSON.stringify(vehicle)
      });
    }

    if (!res.ok) throw new Error("Erro ao salvar veículo");

    loadVehicles();
    closeForm();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function editVehicle(id) {
  const v = vehicles.find(v => String(v._id || v.id) === String(id));
  if (!v) return;

  editingId = v._id || v.id;
  currentPhotos = [...(v.photos || [])];

  brand.value = v.brand;
  model.value = v.model;
  year.value = v.year;
  price.value = v.price;
  power.value = v.power || "";
  category.value = v.category || "";
  rating.value = v.rating || "";
  fuel.value = v.fuel || "";
  transmission.value = v.transmission || "";
  color.value = v.color || "";
  description.value = v.description || "";
  status.value = v.status;
  featured.checked = v.featured;

  renderPreview();
  openForm();
}

async function deleteVehicle(id) {
  if (!confirm("Excluir veículo?")) return;

  const token = localStorage.getItem("adminToken") || "";
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erro ao excluir veículo");
    loadVehicles();
  } catch (err) {
    alert(err.message);
  }
}

