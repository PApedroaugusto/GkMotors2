// ===============================
// CONFIGURAÇÃO SUPABASE
// ===============================
const sb = window.supabaseClient; // Supabase Client deve estar definido no HTML
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
const Cancelbtn = document.getElementById("btnCancel");
const saveBtn = document.getElementById("Save");

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
  Cancelbtn.addEventListener("click", closeForm);
  imageInput.addEventListener("change", handleImageUpload);
  saveBtn.addEventListener("click", saveVehicle);
  searchInput.addEventListener("input", e => filterVehicles(e.target.value));
});

// ===============================
// CARREGAR VEÍCULOS
// ===============================
async function loadVehicles() {
  try {
    const { data, error } = await sb
      .from(VEHICLE_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    vehicles = data;
    renderTable();
  } catch (err) {
    alert("Erro ao carregar veículos: " + err.message);
  }
}

// ===============================
// RENDER TABLE
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
          <button onclick="editVehicle(${v.id})">Editar</button>
          <button onclick="deleteVehicle(${v.id})">Excluir</button>
        </td>
      </tr>
    `;
  });

  updateStats();
}

// ===============================
// ESTATÍSTICAS
// ===============================
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
  currentPhotos = [];
  vehicleModal.style.display = "none";
  previewContainer.innerHTML = "";
  imageInput.value = "";
  featured.checked = false;

  document.querySelectorAll("#vehicleModal input, textarea").forEach(i => i.value = "");
}

// ===============================
// UPLOAD FOTOS SUPABASE
// ===============================
async function handleImageUpload() {
  if (!sb) return alert("Supabase não carregado");

  for (const file of imageInput.files) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await sb.storage
      .from(VEHICLE_STORAGE)
      .upload(fileName, file);

    if (error) return alert("Erro ao enviar imagem: " + error.message);

    const { data } = sb.storage
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
// CRUD SUPABASE
// ===============================
async function saveVehicle(e) {
  e.preventDefault();

  if (!brand.value || !model.value || !year.value || !price.value || currentPhotos.length === 0)
    return alert("Preencha os campos obrigatórios e envie pelo menos uma foto");

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

  try {
    let res;
    if (editingId) {
      res = await sb
        .from(VEHICLE_TABLE)
        .update(vehicle)
        .eq("id", editingId)
        .select()
        .single();
      if (res.error) throw res.error;
    } else {
      res = await sb
        .from(VEHICLE_TABLE)
        .insert(vehicle)
        .select()
        .single();
      if (res.error) throw res.error;
    }

    closeForm();
    loadVehicles();
  } catch (err) {
    alert("Erro ao salvar veículo: " + err.message);
  }
}

function editVehicle(id) {
  id = Number(id); // garantir que seja number
  const v = vehicles.find(v => Number(v.id) === id);
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
  status.value = v.status || "Disponível";
  featured.checked = v.featured;

  renderPreview();
  openForm();
}

async function deleteVehicle(id) {
  id = Number(id); // garantir que seja number
  if (!confirm("Excluir veículo?")) return;

  try {
    const { error } = await sb
      .from(VEHICLE_TABLE)
      .delete()
      .eq("id", id);

    if (error) throw error;
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
window.removePhoto = removePhoto;
