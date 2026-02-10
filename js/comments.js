const API_COMMENTS =
  location.hostname === "localhost"
    ? "http://localhost:3000/api/comments"
    : "https://gkmotors2.onrender.com/api/comments";


const form = document.getElementById("commentForm");
const list = document.getElementById("commentsList");

async function loadComments() {
  const res = await fetch(API_COMMENTS);
  const comments = await res.json();

  list.innerHTML = "";

  comments.reverse().forEach(c => {
    list.innerHTML += `
      <div class="comment">
        <strong>${c.nome}</strong>
        <p>${c.comentario}</p>
        <small>${c.data}</small><br>
        <button onclick="removeComment(${c.id})">🗑️ Apagar</button>
      </div>
    `;
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  await fetch(API_COMMENTS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: document.getElementById("nome").value,
      comentario: document.getElementById("comentario").value
    })
  });

  form.reset();
  loadComments();
});

async function removeComment(id) {
  await fetch(`${API_COMMENTS}/${id}`, { method: "DELETE" });
  loadComments();
}

loadComments();
