// ===============================
// CONFIGURAÇÃO
// ===============================
const VEHICLE_TABLE = "vehicles";
const VEHICLE_STORAGE = "vehicle-images";

// ===============================
// ELEMENTOS DOM
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
const power = document.getElementById("power");
const category = document.getElementById("category");
const fuel = document.getElementById("fuel");
const transmission = document.getElementById("transmission");
const color = document.getElementById("color");
const description = document.getElementById("description");
const status = document.getElementById("status");
const featured = document.getElementById("featured");

const totalVehicles = document.getElementById("totalVehicles");
const availableVehicles = document.getElementById("availableVehicles");
const soldVehicles = document.getElementById("soldVehicles");
const totalValue = document.getElementById("totalValue");

const newVehicleBtn = document.getElementById("NewVehicle");
const cancelBtn = document.getElementById("btnCancel");
const saveBtn = document.getElementById("Save");
const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// STATE
// ===============================
let vehicles = [];
let editingId = null;
let currentPhotos = [];

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadVehicles();

  newVehicleBtn.addEventListener("click", openForm);
  cancelBtn.addEventListener("click", closeForm);
  imageInput.addEventListener("change", handleImageUpload);
  saveBtn.addEventListener("click", saveVehicle);
  searchInput.addEventListener("input", e =>
    filterVehicles(e.target.value)
  );

  logoutBtn.addEventListener("click", logout);
});

// ===============================
// AUTH
// ===============================
async function logout() {
  await window.supabaseClient.auth.signOut();
  window.location.replace("login.html");
}

// ===============================
// LOAD VEHICLES
// ===============================
async function loadVehicles() {
  const { data, error } = await window.supabaseClient
    .from(VEHICLE_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert("Erro ao carregar veículos");
    return;
  }

  vehicles = data;
  renderTable();
}

// ===============================
// RENDER TABLE
// ===============================
function renderTable(list = vehicles) {
  vehicleTable.innerHTML = "";

  list.forEach(v => {
    vehicleTable.innerHTML += `
      <tr>
        <td>
          <img src="${v.photos?.[0] || ""}" style="width:80px;height:60px;object-fit:cover">
          <strong>${v.brand} ${v.model}</strong>
        </td>
        <td>${v.year}</td>
        <td>${v.category || "-"}</td>
        <td>${v.fuel || "-"}</td>
        <td>${v.transmission || "-"}</td>
        <td>R$ ${Number(v.price).toLocaleString("pt-BR")}</td>
        <td>${v.status}</td>
        <td>${v.featured ? "⭐" : "-"}</td>
        <td>
          <button onclick="editVehicle(${v.id})">Editar</button>
          <button onclick="deleteVehicle(${v.id})">Excluir</button>
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
  availableVehicles.innerText =
    vehicles.filter(v => v.status === "disponível").length;
  soldVehicles.innerText =
    vehicles.filter(v => v.status === "vendido").length;

  const total = vehicles.reduce(
    (sum, v) =>
      v.status === "disponível" ? sum + Number(v.price) : sum,
    0
  );

  totalValue.innerText = `R$ ${total.toLocaleString("pt-BR")}`;
}

function filterVehicles(text) {
  renderTable(
    vehicles.filter(v =>
      `${v.brand} ${v.model} ${v.year}`
        .toLowerCase()
        .includes(text.toLowerCase())
    )
  );
}

// ===============================
// MODAL
// ===============================
function openForm() {
  vehicleModal.style.display = "flex";
}

function closeForm() {
  editingId = null;
  currentPhotos = [];
  vehicleModal.style.display = "none";
  previewContainer.innerHTML = "";
  imageInput.value = "";
  featured.checked = false;

  document
    .querySelectorAll("#vehicleModal input, textarea")
    .forEach(i => (i.value = ""));
}

// ===============================
// UPLOAD IMAGES
// ===============================
async function handleImageUpload() {
  for (const file of imageInput.files) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await window.supabaseClient.storage
      .from(VEHICLE_STORAGE)
      .upload(fileName, file);

    if (error) {
      alert("Erro ao enviar imagem");
      return;
    }

    const { data } = window.supabaseClient.storage
      .from(VEHICLE_STORAGE)
      .getPublicUrl(fileName);

    currentPhotos.push(data.publicUrl);
  }

  renderPreview();
  imageInput.value = "";
}

function renderPreview() {
  previewContainer.innerHTML = "";
  currentPhotos.forEach((p, i) => {
    previewContainer.innerHTML += `
      <img src="${p}" style="width:100px;height:80px;cursor:pointer"
        onclick="removePhoto(${i})">
    `;
  });
}

function removePhoto(i) {
  currentPhotos.splice(i, 1);
  renderPreview();
}

// ===============================
// SAVE VEHICLE
// ===============================
async function saveVehicle(e) {
  e.preventDefault();

  const vehicle = {
    brand: brand.value,
    model: model.value,
    year: year.value,
    price: Number(price.value),
    power: power.value || null,
    category: category.value || null,
    fuel: fuel.value || null,
    transmission: transmission.value || null,
    color: color.value || null,
    description: description.value || null,
    photos: currentPhotos,
    image: currentPhotos[0],
    status: status.value,
    featured: featured.checked
  };

  if (editingId) {
    await window.supabaseClient
      .from(VEHICLE_TABLE)
      .update(vehicle)
      .eq("id", editingId);
  } else {
    await window.supabaseClient
      .from(VEHICLE_TABLE)
      .insert(vehicle);
  }

  closeForm();
  loadVehicles();
}

// ===============================
// EDIT / DELETE
// ===============================
function editVehicle(id) {
  const v = vehicles.find(v => v.id === id);
  if (!v) return;

  editingId = id;
  currentPhotos = [...(v.photos || [])];

  brand.value = v.brand;
  model.value = v.model;
  year.value = v.year;
  price.value = v.price;
  power.value = v.power || "";
  category.value = v.category || "";
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

  await window.supabaseClient
    .from(VEHICLE_TABLE)
    .delete()
    .eq("id", id);

  loadVehicles();
}

window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;
window.removePhoto = removePhoto;
