// ===============================
// API
// ===============================
const API = window.API_VEHICLES;

if (!API) {
  console.error("API_VEHICLES não definida");
}

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

async function loadVehicles() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Erro ao buscar veículos");
    vehicles = await res.json();
    renderTable();
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar veículos");
  }
}

// ===============================
// TABELA
// ===============================
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
        <td>R$ ${Number(v.price).toLocaleString("pt-BR")}</td>
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

// ===============================
// STATS
// ===============================
function updateStats() {
  totalVehicles.innerText = vehicles.length;
  availableVehicles.innerText = vehicles.filter(v => v.status === "disponivel").length;
  soldVehicles.innerText = vehicles.filter(v => v.status === "vendido").length;

  const total = vehicles.reduce((sum, v) => {
    return v.status === "disponivel" ? sum + Number(v.price || 0) : sum;
  }, 0);

  totalValue.innerText = `R$ ${total.toLocaleString("pt-BR")}`;
}

// ===============================
// BUSCA
// ===============================
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

// ===============================
// MODAL
// ===============================
function openForm() {
  vehicleModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeForm() {
  editingId = null;
  currentPhotos = [];
  vehicleModal.style.display = "none";
  document.body.style.overflow = "auto";

  document
    .querySelectorAll("#vehicleModal input, textarea, select")
    .forEach(el => (el.value = ""));

  previewContainer.innerHTML = "";
  imageInput.value = "";
  featured.checked = false;
}

// ===============================
// UPLOAD DE IMAGENS
// ===============================
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

// ===============================
// SAVE
// ===============================
async function saveVehicle() {
  if (!brand.value || !model.value || !year.value || !price.value) {
    alert("Preencha marca, modelo, ano e preço");
    return;
  }

  if (!currentPhotos.length) {
    alert("Adicione pelo menos uma foto");
    return;
  }

  const vehicle = {
    brand: brand.value.trim(),
    model: model.value.trim(),
    year: year.value.trim(),
    price: Number(price.value),
    power: power.value ? Number(power.value) : null,
    category: category.value,
    rating: rating.value ? Number(rating.value) : null,
    fuel: fuel.value,
    transmission: transmission.value,
    color: color.value,
    description: description.value,
    photos: currentPhotos,
    image: currentPhotos[0],
    status: status.value,
    featured: featured.checked
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("adminToken")
  };

  try {
    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(vehicle)
      });
    } else {
      await fetch(API, {
        method: "POST",
        headers,
        body: JSON.stringify(vehicle)
      });
    }

    closeForm();
    loadVehicles();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar veículo");
  }
}

// ===============================
// EDIT
// ===============================
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

// ===============================
// DELETE
// ===============================
async function deleteVehicle(id) {
  if (!confirm("Excluir veículo?")) return;

  try {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("adminToken")
      }
    });

    loadVehicles();
  } catch (err) {
    alert("Erro ao excluir veículo");
  }
}

// ===============================
// COMENTÁRIOS (ADMIN)
// ===============================
async function loadCommentsAdmin() {
  const token = document.getElementById("token").value;
  localStorage.setItem("adminToken", token);

  const res = await fetch("/api/comments");
  const comments = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  comments.forEach(c => {
    list.innerHTML += `
      <div style="margin-bottom:15px; padding:10px; border:1px solid #ccc">
        <strong>${c.nome}</strong>
        <p>${c.comentario}</p>
        <small>${c.data}</small><br>
        <button onclick="removeComment('${c._id || c.id}')">❌ Excluir</button>
      </div>
    `;
  });
}

async function removeComment(id) {
  await fetch(`/api/admin/comments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: localStorage.getItem("adminToken")
    }
  });

  loadCommentsAdmin();
}
