// ===============================
// CONFIGURAÇÃO DA API
// ===============================
const API = window.API_VEHICLES || "https://gkmotors.onrender.com/api/vehicles";
const UPLOAD_API = "https://gkmotors.onrender.com/api/vehicles/upload";

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
const Cancelbtn = document.getElementById("btnCancel");
const saveBtn = document.getElementById("Save");

// ===============================
// STATE
// ===============================
let vehicles = [];
let editingId = null;
let currentFiles = [];   // arquivos selecionados
let currentPhotos = [];  // URLs públicas

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadVehicles();

  newVehicleBtn.addEventListener("click", openForm);
  Cancelbtn.addEventListener("click", closeForm);
  imageInput.addEventListener("change", handleImageSelect);
  saveBtn.addEventListener("click", saveVehicle);
  searchInput.addEventListener("input", e => filterVehicles(e.target.value));
});

// ===============================
// CARREGAR VEÍCULOS
// ===============================
async function loadVehicles() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Erro ao carregar veículos");
    vehicles = await res.json();
    renderTable();
  } catch (err) {
    alert(err.message);
  }
}

// ===============================
// RENDER TABELA
// ===============================
function renderTable(list = vehicles) {
  vehicleTable.innerHTML = "";

  list.forEach(v => {
    const img = v.photos?.[0] || "";

    vehicleTable.innerHTML += `
      <tr>
        <td>
          <img src="${img}" style="width:80px;height:60px;object-fit:cover">
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
          <button onclick="editVehicle('${v.id}')">Editar</button>
          <button onclick="deleteVehicle('${v.id}')">Excluir</button>
        </td>
      </tr>
    `;
  });

  updateStats();
}

function updateStats() {
  totalVehicles.innerText = vehicles.length;
  availableVehicles.innerText = vehicles.filter(v => v.status.toLowerCase() === "disponível").length;
  soldVehicles.innerText = vehicles.filter(v => v.status.toLowerCase() === "vendido").length;

  const total = vehicles.reduce((s, v) =>
    v.status.toLowerCase() === "disponível" ? s + Number(v.price) : s, 0
  );

  totalValue.innerText = `R$ ${total.toLocaleString("pt-BR")}`;
}

function filterVehicles(text) {
  renderTable(
    vehicles.filter(v =>
      `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(text.toLowerCase())
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
  currentFiles = [];
  currentPhotos = [];
  vehicleModal.style.display = "none";
  previewContainer.innerHTML = "";
  imageInput.value = "";
  featured.checked = false;

  document.querySelectorAll("#vehicleModal input, textarea").forEach(i => i.value = "");
}

// ===============================
// SELEÇÃO DE IMAGENS
// ===============================
function handleImageSelect() {
  currentFiles = Array.from(imageInput.files);
  renderPreviewFiles();
}

function renderPreviewFiles() {
  previewContainer.innerHTML = "";
  currentFiles.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    previewContainer.innerHTML += `
      <img src="${url}" style="width:100px;height:80px;cursor:pointer"
        onclick="removeFile(${i})">
    `;
  });
}

function removeFile(i) {
  currentFiles.splice(i, 1);
  renderPreviewFiles();
}

// ===============================
// SAVE VEHICLE
// ===============================
async function saveVehicle(e) {
  e.preventDefault();

  if (!brand.value || !model.value || !year.value || !price.value || currentFiles.length === 0)
    return alert("Preencha os campos obrigatórios e envie pelo menos uma foto");

  try {
    // 1️⃣ Upload das fotos para backend
    const formData = new FormData();
    currentFiles.forEach(file => formData.append("photos", file));

    const uploadRes = await fetch(UPLOAD_API, { method: "POST", body: formData });
    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      throw new Error(err.error || "Erro ao enviar fotos");
    }

    const { uploadedUrls } = await uploadRes.json();
    currentPhotos = uploadedUrls;

    // 2️⃣ Montar objeto veículo
    const vehicle = {
      brand: brand.value,
      model: model.value,
      year: Number(year.value),
      price: Number(price.value),
      power: power.value || null,
      category: category.value || null,
      fuel: fuel.value || null,
      transmission: transmission.value || null,
      color: color.value || null,
      description: description.value || null,
      photos: currentPhotos,
      image: currentPhotos[0],
      status: status.value || "Disponível",
      featured: featured.checked
    };

    // 3️⃣ Enviar POST para backend
    const res = await fetch(editingId ? `${API}/${editingId}` : API, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar veículo");

    alert("Veículo salvo com sucesso!");
    closeForm();
    loadVehicles();

  } catch (err) {
    alert("Erro ao salvar veículo: " + err.message);
  }
}

// ===============================
// EDIT / DELETE
// ===============================
function editVehicle(id) {
  const v = vehicles.find(v => v.id === id);
  if (!v) return;

  editingId = id;
  currentPhotos = [...(v.photos || [])];
  currentFiles = []; // resetar arquivos, só URLs já existentes

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
  status.value = v.status || "Disponível";
  featured.checked = v.featured;

  renderPreviewUrls();
  openForm();
}

function renderPreviewUrls() {
  previewContainer.innerHTML = "";
  currentPhotos.forEach((url, i) => {
    previewContainer.innerHTML += `
      <img src="${url}" style="width:100px;height:80px;cursor:pointer"
        onclick="removePhotoUrl(${i})">
    `;
  });
}

function removePhotoUrl(i) {
  currentPhotos.splice(i, 1);
  renderPreviewUrls();
}

async function deleteVehicle(id) {
  if (!confirm("Excluir veículo?")) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      return alert("Erro ao excluir veículo: " + err.error);
    }
    loadVehicles();
  } catch (err) {
    alert("Erro ao excluir veículo: " + err.message);
  }
}

// ===============================
// EXPORT
// ===============================
window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;
window.saveVehicle = saveVehicle;
window.removeFile = removeFile;
window.removePhotoUrl = removePhotoUrl;
