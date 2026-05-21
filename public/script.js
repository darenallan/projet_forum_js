
// INSCRIPTION
// Gestion du formulaire d'inscription et stockage du nouvel utilisateur.
const registerForm = document.getElementById("form_register");

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm_password").value;

    if (password !== confirm) {
      alert("Les mots de passe ne correspondent pas ❌");
      return;
    }

    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (data.message) {
      alert(data.message || data.error || "Compte créé ✅ Veuillez vous connecter");
      window.location.href = "connexion.html";
      return;
    }

    alert(data.error);
  });
}


// LOGIN
// Gestion du formulaire de connexion et stockage de l'identité utilisateur.
const loginForm = document.getElementById("form_login");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;

    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.message) {
      localStorage.setItem("username", data.username || username);
      localStorage.setItem("userId", data.userId || data.id);
      localStorage.setItem("user_id", data.userId || data.id);
      window.location.href = "index.html";
      return;
    }

    alert(data.error || "Erreur lors de la connexion.");
  });
}


//  CREER UN  POSTE ET LA  CATEGORIE

async function createPost() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  // Lit l'ID de l'utilisateur stocké localement au moment de la connexion.
  const user_id = localStorage.getItem("user_id") || localStorage.getItem("userId");
  const category_id = parseInt(document.getElementById("category").value);

  if (!user_id) {
    alert("Vous devez être connecté(e) pour publier un post.");
    window.location.href = "connexion.html";
    return;
  }

  /*Condition en cas de poste vide */
  if (!title || !content) {
    alert("Ajouter un titre et une description pour publier votre post.");
    return;
  }

  const fileInput = document.getElementById("post-image-file");
  const file = fileInput ? fileInput.files[0] : null;

  const sendRequest = async (base64Image = null) => {
    try {
      const res = await fetch("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          title,
          content,
          category_id,
          image: base64Image
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Post créé ✅");
        window.location.href = "index.html";
      } else {
        alert(data.error || "Erreur lors de la publication.");
      }
    } catch (err) {
      console.error("Erreur publication:", err);
      alert("Une erreur est survenue lors de la publication.");
    }
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      sendRequest(event.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    sendRequest(null);
  }
}
``

function isLoggedIn() {
  return Boolean(localStorage.getItem("username"));
}

function requireLogin() {
  if (!isLoggedIn()) {
    alert("Vous devez être connecté(e) pour interagir avec les posts.\nVous allez être redirigé(e) vers l'inscription.");
    window.location.href = "inscription.html";
    return false;
  }
  return true;
}

function getPostInteractions() {
  try {
    return JSON.parse(localStorage.getItem("postInteractions")) || {};
  } catch {
    return {};
  }
}

function savePostInteractions(interactions) {
  localStorage.setItem("postInteractions", JSON.stringify(interactions));
}

function getPostState(postId) {
  const interactions = getPostInteractions();
  return interactions[postId] || { likes: 0, dislikes: 0, comments: [], liked: false, disliked: false };
}

function setPostState(postId, state) {
  const interactions = getPostInteractions();
  interactions[postId] = state;
  savePostInteractions(interactions);
}

function renderComments(postId) {
  const state = getPostState(postId);
  const list = document.querySelector(`#comments-${postId} .comments-list`);
  const headerTitle = document.querySelector(`#comments-${postId} .comment-count-title`);
  if (headerTitle) {
    headerTitle.innerText = `${state.comments.length} commentaire${state.comments.length > 1 ? 's' : ''}`;
  }

  if (!list) return;
  list.innerHTML = "";

  if (state.comments.length === 0) {
    return;
  }

  const currentUser = localStorage.getItem("username");
  state.comments.forEach((comment, index) => {
    const user = comment.user || comment.username || "Anonyme";
    const dateStr = comment.date || "";
    const likes = comment.likes || 0;
    const dislikes = comment.dislikes || 0;
    const netVotes = likes - dislikes;
    const canDeleteComment = currentUser && user === currentUser;
    const commentItem = document.createElement("div");
    commentItem.className = "reddit-comment-card";
    commentItem.innerHTML = `
      <div class="reddit-comment-header">
        <span class="reddit-comment-user">${user}</span> <span class="reddit-comment-date">${dateStr}</span>
        ${canDeleteComment ? `<button class="reddit-comment-delete-btn comment-delete-btn" data-post-id="${postId}" data-comment-index="${index}">🗑️</button>` : ""}
      </div>
      <div class="reddit-comment-body">
        <p>${comment.text}</p>
      </div>
      <div class="comment-actions post-actions" style="margin-top: 10px;">
        <button class="action-btn comment-like-btn ${comment.liked ? "active" : ""}" data-post-id="${postId}" data-comment-index="${index}">👍 <span>${likes}</span></button>
        <button class="action-btn comment-dislike-btn ${comment.disliked ? "active" : ""}" data-post-id="${postId}" data-comment-index="${index}">👎 <span>${dislikes}</span></button>
      </div>
    `;
    list.appendChild(commentItem);
  });
}

function updatePostStateUI(postId) {
  const state = getPostState(postId);
  const likeButton = document.querySelector(`button.like-btn[data-post-id="${postId}"] span`);
  const dislikeButton = document.querySelector(`button.dislike-btn[data-post-id="${postId}"] span`);

  if (likeButton) likeButton.innerText = state.likes;
  if (dislikeButton) dislikeButton.innerText = state.dislikes;
}

function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  if (!section) return;
  section.classList.toggle("visible");
  if (section.classList.contains("visible")) {
    renderComments(postId);
  }
}

function showCommentForm(postId) {
  if (!requireLogin()) return;
  const section = document.getElementById(`comments-${postId}`);
  const form = document.querySelector(`.reddit-comment-form-container[data-post-id="${postId}"]`);
  if (!section || !form) return;
  section.classList.add("visible");
  form.classList.add("visible");
  renderComments(postId);
}

function closeCommentSection(postId) {
  const section = document.getElementById(`comments-${postId}`);
  if (!section) return;
  section.classList.remove("visible");
}

function addComment(postId) {
  if (!requireLogin()) return;

  const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
  if (!input || !input.value.trim()) return;

  const username = localStorage.getItem("username") || "Anonyme";
  const state = getPostState(postId);

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const commentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  state.comments.unshift({ id: commentId, user: username, text: input.value.trim(), likes: 0, dislikes: 0, date: dateStr });
  setPostState(postId, state);

  input.value = "";
  renderComments(postId);
  const section = document.getElementById(`comments-${postId}`);
  if (section) section.classList.add("visible");
}

/*LILE AND DISLIKE*/
function changeReaction(postId, type, commentIndex = null) {
  if (!requireLogin()) return;

  const state = getPostState(postId);
  const isComment = commentIndex !== null && commentIndex !== undefined;
  const target = isComment ? state.comments[commentIndex] : state;
  if (!target) return;

  if (type === "like") {
    if (target.liked) {
      target.likes = Math.max(0, (target.likes || 1) - 1);
      target.liked = false;
    } else {
      target.likes = (target.likes || 0) + 1;
      target.liked = true;
      if (target.disliked) {
        target.disliked = false;
        target.dislikes = Math.max(0, (target.dislikes || 1) - 1);
      }
    }
  } else if (type === "dislike") {
    if (target.disliked) {
      target.dislikes = Math.max(0, (target.dislikes || 1) - 1);
      target.disliked = false;
    } else {
      target.dislikes = (target.dislikes || 0) + 1;
      target.disliked = true;
      if (target.liked) {
        target.liked = false;
        target.likes = Math.max(0, (target.likes || 1) - 1);
      }
    }
  }

  setPostState(postId, state);

  if (isComment) {
    renderComments(postId);
  } else {
    updatePostStateUI(postId);
  }
}

// Supprime un commentaire local si l'utilisateur connecté en est l'auteur.
function deleteComment(postId, commentIndex) {
  const state = getPostState(postId);
  if (commentIndex < 0 || commentIndex >= state.comments.length) return;

  const comment = state.comments[commentIndex];
  const currentUser = localStorage.getItem("username");
  if (!currentUser || comment.user !== currentUser) {
    alert("Vous ne pouvez supprimer que vos propres commentaires.");
    return;
  }

  state.comments.splice(commentIndex, 1);
  setPostState(postId, state);
  renderComments(postId);
}

// Envoie une requête de suppression de post au serveur.
// Le serveur vérifie que l'utilisateur courant est bien le propriétaire.
async function deletePost(postId) {
  if (!requireLogin()) return;

  const user_id = localStorage.getItem("userId") || localStorage.getItem("user_id");
  const res = await fetch(`/posts/${postId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id })
  });

  const data = await res.json();
  if (res.ok) {
    alert(data.message || "Post supprimé.");
    loadPosts();
  } else {
    alert(data.error || "Impossible de supprimer ce post.");
  }
}

// Charge tous les posts depuis le serveur et les affiche dans la page.
async function loadPosts(filter = "all", searchQuery = "") {
  const query = new URLSearchParams();
  if (filter && filter !== "all") query.set("filter", filter);
  if (searchQuery) query.set("search", searchQuery);
  const res = await fetch(`/posts?${query.toString()}`);
  let posts = await res.json();

  const currentUserId = localStorage.getItem("userId") || localStorage.getItem("user_id");

  if (searchQuery) {
    const queryText = searchQuery.toLowerCase();
    posts = posts.filter(post =>
      post.title.toLowerCase().includes(queryText) ||
      post.content.toLowerCase().includes(queryText) ||
      (post.category && post.category.toLowerCase().includes(queryText)) ||
      (post.username && post.username.toLowerCase().includes(queryText))
    );
  }

  if (filter && filter !== "all") {
    if (filter === "created") {
      posts = posts.filter(post => currentUserId && String(post.user_id) === String(currentUserId));
    } else if (filter === "liked") {
      posts = posts.filter(post => getPostState(post.id).liked);
    } else {
      posts = posts.filter(post => post.category === filter);
    }
  }

  const container = document.getElementById("posts");

  if (!container) return;

  container.innerHTML = "";

  posts.forEach(post => {
    const state = getPostState(post.id);
    const currentUserId = localStorage.getItem("userId") || localStorage.getItem("user_id");
    const isPostOwner = currentUserId && String(currentUserId) === String(post.user_id);
    const isLoggedIn = Boolean(currentUserId);
    const div = document.createElement("div");
    div.className = "post-card";

    // Formatage de la date de création
    const createdDate = new Date(post.created_at);
    const dateStr = createdDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }) + " à " + createdDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    div.innerHTML = `
      <div class="post-meta">
        <span>👤 ${post.username}</span>
        <span>🔗 ${post.category || "Sans catégorie"}</span>
        <span>📅 ${dateStr}</span>
      </div>
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      ${post.image_url ? `<div class="post-image-container"><img src="${post.image_url}" alt="Image du post" class="post-image" /></div>` : ""}
      <div class="post-actions">
        <button class="action-btn like-btn ${state.liked ? "active" : ""}" data-post-id="${post.id}">👍 <span>${state.likes}</span></button>
        <button class="action-btn dislike-btn ${state.disliked ? "active" : ""}" data-post-id="${post.id}">👎 <span>${state.dislikes}</span></button>
        <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">💬 Commenter</button>
        ${isPostOwner ? `<button class="action-btn delete-post-btn" data-post-id="${post.id}">🗑️ Supprimer</button>` : ""}
      </div>
      <div class="comment-section reddit-comment-section" id="comments-${post.id}">
        <div class="reddit-comment-header-row">
          <h4 class="comment-count-title">${state.comments.length} commentaire${state.comments.length > 1 ? 's' : ''}</h4>
        </div>
        ${isLoggedIn ? `
          <div class="reddit-comment-form-container" data-post-id="${post.id}">
            <textarea class="reddit-comment-input comment-input" placeholder="Ajoute un commentaire public..." data-post-id="${post.id}"></textarea>
            <div class="reddit-comment-form-actions">
              <button type="button" class="reddit-post-comment-btn post-comment-btn" data-post-id="${post.id}">Commenter</button>
            </div>
          </div>
        ` : `
          <div class="reddit-comment-form-container comment-login-prompt" data-post-id="${post.id}">
            <p style="color: #999; text-align: center; padding: 15px;">Connectez-vous pour participer à la conversation</p>
          </div>
        `}
        <div class="comments-list"></div>
      </div>
    `;

    container.appendChild(div);
    renderComments(post.id);
  });
}

let currentFilter = "all";
let currentSearch = "";
let searchTimeout = null;
const categoryNames = {
  1: "Technologie",
  2: "Études",
  3: "Vacances",
  4: "Musique",
  5: "Danse",
  6: "Voyage"
};

const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    currentSearch = e.target.value.trim();
    searchTimeout = setTimeout(() => {
      loadPosts(currentFilter, currentSearch);
    }, 300);
  });
}

const categoryFilter = document.getElementById("category-filter");
if (categoryFilter) {
  categoryFilter.addEventListener("change", (e) => {
    const selected = e.target.value;
    currentFilter = selected === "all" ? "all" : categoryNames[selected];
    document.querySelectorAll("button.filter-btn").forEach(btn => btn.classList.remove("active"));
    loadPosts(currentFilter, currentSearch);
  });
}

const filterBar = document.getElementById("post-filter-bar");
if (filterBar) {
  filterBar.addEventListener("click", (event) => {
    const button = event.target.closest("button.filter-btn");
    if (!button) return;
    currentFilter = button.dataset.filter || "all";
    filterBar.querySelectorAll("button.filter-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    if (categoryFilter) categoryFilter.value = "all";
    loadPosts(currentFilter, currentSearch);
  });
}

const postsContainer = document.getElementById("posts");
if (postsContainer) {
  postsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const postId = button.dataset.postId;
    if (!postId) return;

    if (button.classList.contains("like-btn")) {
      changeReaction(postId, "like");
    }
    if (button.classList.contains("dislike-btn")) {
      changeReaction(postId, "dislike");
    }
    if (button.classList.contains("comment-toggle-btn")) {
      toggleComments(postId);
    }
    if (button.classList.contains("close-comment-section-btn")) {
      closeCommentSection(postId);
    }
    if (button.classList.contains("open-comment-form-btn")) {
      showCommentForm(postId);
    }
    if (button.classList.contains("post-comment-btn")) {
      addComment(postId);
    }
    if (button.classList.contains("comment-like-btn")) {
      changeReaction(postId, "like", button.dataset.commentIndex);
    }
    if (button.classList.contains("comment-dislike-btn")) {
      changeReaction(postId, "dislike", button.dataset.commentIndex);
    }
    if (button.classList.contains("comment-delete-btn")) {
      deleteComment(postId, Number(button.dataset.commentIndex));
    }
    if (button.classList.contains("delete-post-btn")) {
      deletePost(postId);
    }
  });

  // Supprime le comportement de validation au clavier pour éviter les duplications
  // de champs lors de la saisie. L'utilisateur doit cliquer sur Publier.
}
``


// 💜 MESSAGE ACCUEIL

window.onload = async function () {
  try {
    const res = await fetch("/auth/me");
    const data = await res.json();
    if (data.loggedIn) {
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("user_id", data.userId);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("user_id");
    }
  } catch (err) {
    console.error("Erreur lors de la synchronisation de session :", err);
  }

  const username = localStorage.getItem("username");
  const welcome = document.getElementById("welcomeMessage");

  if (welcome) {
    welcome.innerText = username
      ? "Bienvenue sur notre forum " + username + " 💜"
      : "Bienvenue sur notre forum 💜";
  }

  //Affichage dynamique des boutons selon l'état de connexion
  const navInscription = document.getElementById("nav-inscription");
  const navConnexion = document.getElementById("nav-connexion");
  const navLogout = document.getElementById("nav-logout");

  if (username) {
    if (navInscription) navInscription.style.display = "none";
    if (navConnexion) navConnexion.style.display = "none";
    if (navLogout) navLogout.style.display = "";
  } else {
    if (navInscription) navInscription.style.display = "";
    if (navConnexion) navConnexion.style.display = "";
    if (navLogout) navLogout.style.display = "none";
  }

  loadPosts(); //charger posts automatiquement
};



// NAVIGATION
async function logout() {
  try {
    await fetch("/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Erreur lors de la déconnexion :", err);
  }
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
  localStorage.removeItem("user_id");
  localStorage.removeItem("postInteractions");
  window.location.href = "index.html";
}

function goToPost() {
  window.location.href = "post.html";
}

function goHome() {
  window.location.href = "index.html";
}

// ✅ Gestion de la session active et redirection des pages protégées
const userId = localStorage.getItem("user_id") || localStorage.getItem("userId");

// On vérifie si on est sur une page protégée (comme post.html, dashboard.html, profil.html)
const protectedPages = ["post.html", "dashboard.html", "profil.html"];
const currentPage = window.location.pathname.split("/").pop();

if (protectedPages.includes(currentPage) && !userId) {
  window.location.href = "connexion.html";
}

// Si connecté, on lance le timer de 4 minutes pour la déconnexion automatique
if (userId) {
  setTimeout(() => {
    logout();
  }, 240000);
}

/*
//Fonction pour une session active on autorise un temps de connexion de 1 mn puis on le deconnecte automatiquement
const userId = localStorage.getItem("user_id") || localStorage.getItem("userId");

if (!userId) {
  window.location.href = "connexion.html";
  return;
}

// Si un utilisateur est connecté, on lance le timer
setTimeout(() => {
  logout();
}, 60000);

*/
(function () {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'girly-theme'; // light | dark

  // Applique le thème choisi
  function applyTheme(mode) {
    if (mode === 'dark') {
      html.classList.add('dark');
      btn.textContent = '☀️';
    } else {
      html.classList.remove('dark');
      btn.textContent = '🌙';
    }
  }

  // Initialisation avec le thème sauvegardé
  const saved = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(saved);

  // Toggle: light ↔ dark
  btn.addEventListener('click', () => {
    const current = localStorage.getItem(STORAGE_KEY) || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });
})();