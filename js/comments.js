// Configurar URL da API
const API_COMMENTS =
  location.hostname === "localhost"
    ? "http://localhost:3000/api/comments"
    : "https://gkmotors2.onrender.com/api/comments";

const form = document.getElementById("commentForm");
const list = document.getElementById("commentsList");

// ===============================
// Carregar comentários
// ===============================
async function loadComments() {
  try {
    const res = await fetch(API_COMMENTS);
    const comments = await res.json();

    list.innerHTML = "";

    comments.reverse().forEach((c) => {
      list.innerHTML += `
        <div class="comment">
          <strong>${c.nome}</strong>
          <p>${c.comentario}</p>
          <small>${c.data}</small><br>
          <button onclick="removeComment(${c.id})">🗑️ Apagar</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Erro ao carregar comentários:", err);
    list.innerHTML = "<p>Não foi possível carregar os comentários.</p>";
  }
}

// ===============================
// Adicionar comentário
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const comentario = document.getElementById("comentario").value.trim();

  if (!nome || !comentario) return alert("Preencha todos os campos!");

  try {
    await fetch(API_COMMENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, comentario }),
    });

    form.reset();
    loadComments();
  } catch (err) {
    console.error("Erro ao enviar comentário:", err);
    alert("Erro ao enviar comentário.");
  }
});

// ===============================
// Remover comentário
// ===============================
async function removeComment(id) {
  if (!confirm("Tem certeza que quer apagar este comentário?")) return;

  try {
    await fetch(`${API_COMMENTS}/${id}`, { method: "DELETE" });
    loadComments();
  } catch (err) {
    console.error("Erro ao apagar comentário:", err);
    alert("Erro ao apagar comentário.");
  }
}

// ===============================
// Inicializar
// ===============================
loadComments();
