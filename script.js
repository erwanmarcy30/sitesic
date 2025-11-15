// --- CONSTANTES DE STOCKAGE ---
const STORAGE_KEYS = {
    ACCUEIL_TEXT: "accueilText",
    ACCUEIL_IMAGE: "accueilImage",
    PHOTOS: "photosGallery",
    LINKS: "usefulLinks",
    DOCS: "docsList",
    RTH: "rthList",
    CHAT: "divsic_chat_messages",
    LOGGED: "divsic_logged",
    THEME: "divsic_theme",
    CHAT_LAST_OPEN: "divsic_chat_last_open",
    CHAT_NAME: "divsic_chat_name"
};

// Hash SHA-256 de "DIVSIC2025"
const STORED_PWD_HASH = "c033b721c06a6dc45c18792bbca63b0fc5a76acfa72e08f5762c6c5017820be8";

let isLoggedIn = false;
let currentPage = "accueil";

// --- RÉFÉRENCES DOM ---
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const dateTimeEl = document.getElementById("dateTime");
const themeToggle = document.getElementById("themeToggle");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const accueilText = document.getElementById("accueil-text");
const uploadBtn = document.getElementById("uploadBtn");
const deleteImgBtn = document.getElementById("deleteImgBtn");
const imageUpload = document.getElementById("imageUpload");
const accueilImage = document.getElementById("accueilImage");

const addDocBtn = document.getElementById("addDocBtn");
const docsContainer = document.getElementById("docs-container");

const addLinkBtn = document.getElementById("addLinkBtn");
const linksContainer = document.getElementById("links-container");

const rthTableBody = document.getElementById("rthTableBody");
const addRthBtn = document.getElementById("addRthBtn");
const rthSortSelect = document.getElementById("rthSortSelect");

const photosContainer = document.getElementById("photosContainer");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoUpload = document.getElementById("photoUpload");
const photoModal = document.getElementById("photoModal");
const photoModalImg = document.getElementById("photoModalImg");
const closePhotoModal = document.getElementById("closePhotoModal");

const chatBox = document.getElementById("chatBox");
const chatName = document.getElementById("chat-name");
const chatInput = document.getElementById("chat-message");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const onlineCount = document.getElementById("onlineCount");
const chatNotifDot = document.getElementById("chatNotifDot");

const loginModal = document.getElementById("loginModal");
const closeLoginModal = document.getElementById("closeLoginModal");
const validateLogin = document.getElementById("validateLogin");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");

const toastContainer = document.getElementById("toastContainer");

// --- UTILITAIRES ---

function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    if (type === "success") toast.classList.add("success");
    if (type === "error") toast.classList.add("error");
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 2200);
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function formatTimeWithDate(ts) {
    const d = ts ? new Date(ts) : new Date();
    const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}

function parseFrDate(str) {
    if (!str) return 0;
    const parts = str.split("/");
    if (parts.length !== 3) return 0;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!d || !m + 1 || !y) return 0;
    return new Date(y, m, d).getTime();
}

// --- THÈME ---

function applyStoredTheme() {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === "dark") {
        document.body.classList.add("dark");
    } else if (stored === "light") {
        document.body.classList.remove("dark");
    }
}
applyStoredTheme();

themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        STORAGE_KEYS.THEME,
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

// --- DATE / HEURE ---

function updateDateTime() {
    if (!dateTimeEl) return;
    const now = new Date();
    dateTimeEl.textContent = now.toLocaleString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
updateDateTime();
setInterval(updateDateTime, 30_000);

// --- NAVIGATION ---

function setPage(pageId) {
    currentPage = pageId;
    pages.forEach(p => p.classList.toggle("active", p.id === pageId));
    navLinks.forEach(link => {
        const lp = link.getAttribute("data-page");
        const active = lp === pageId;
        link.classList.toggle("active", active);
        if (active) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    if (pageId === "communication") {
        localStorage.setItem(STORAGE_KEYS.CHAT_LAST_OPEN, Date.now().toString());
        if (chatNotifDot) chatNotifDot.style.display = "none";
    }
}

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const pageId = link.getAttribute("data-page");
        if (pageId) setPage(pageId);
    });
});

// --- ACCUEIL (TEXTE + IMAGE) ---

function loadAccueil() {
    const savedText = localStorage.getItem(STORAGE_KEYS.ACCUEIL_TEXT);
    if (accueilText && savedText) accueilText.textContent = savedText;

    const imgData = localStorage.getItem(STORAGE_KEYS.ACCUEIL_IMAGE);
    if (accueilImage && imgData) {
        accueilImage.src = imgData;
    }
}
loadAccueil();

accueilText?.addEventListener("input", () => {
    if (!isLoggedIn) return;
    localStorage.setItem(STORAGE_KEYS.ACCUEIL_TEXT, accueilText.textContent || "");
});

uploadBtn?.addEventListener("click", () => {
    if (!isLoggedIn) return;
    imageUpload?.click();
});

imageUpload?.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast("Fichier trop volumineux (max 2 Mo).", "error");
        return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
        const dataUrl = ev.target.result;
        accueilImage.src = dataUrl;
        localStorage.setItem(STORAGE_KEYS.ACCUEIL_IMAGE, dataUrl);
        showToast("Image d’accueil mise à jour.", "success");
    };
    reader.readAsDataURL(file);
});

deleteImgBtn?.addEventListener("click", () => {
    if (!accueilImage) return;
    if (!confirm("Supprimer l’image d’accueil ?")) return;
    accueilImage.src = "";
    localStorage.removeItem(STORAGE_KEYS.ACCUEIL_IMAGE);
    showToast("Image d’accueil supprimée.", "success");
});



// --- DOCUMENTATIONS ---

// mêmes docs par défaut que ton premier site
const defaultDocs = [
  { name: "GE 45kW AG",     link: "https://example.com/GE45AG" },
  { name: "GE 45kW NG",     link: "https://example.com/GE45NG" },
  { name: "GE 20kW",        link: "https://example.com/GE20" },
  { name: "SHERPA",         link: "https://example.com/SHERPA" },
  { name: "CCPTA",          link: "https://example.com/CCPTA" },
  { name: "KERAX 8x4",      link: "https://example.com/KERAX8x4" },
  { name: "KERAX 6x6",      link: "https://example.com/KERAX6x6" },
  { name: "Remorque CLIM",  link: "https://example.com/RC" }
];

function getDocsData() {
    let raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    let data = null;

    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch {
            data = null;
        }
    }

    // si pas de données valides ou tableau vide → on réinitialise avec les docs par défaut
    if (!Array.isArray(data) || data.length === 0) {
        data = defaultDocs.slice();
        localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(data));
    }
    return data;
}

function loadDocs() {
    if (!docsContainer) return;
    const saved = getDocsData();
    docsContainer.innerHTML = "";

    saved.forEach((d, i) => {
        const card = document.createElement("div");
        card.className = "doc-card";

        const label = d.name || d.title || d.label || "Sans titre";
        const link  = d.link || d.url || d.href || "#";

        card.textContent = label;

        if (link && link !== "#") {
            card.onclick = () => window.open(link, "_blank");
        }

        if (isLoggedIn) {
            const del = document.createElement("button");
            del.textContent = "X";
            del.className = "delete-btn";
            del.onclick = (e) => {
                e.stopPropagation();
                const all = getDocsData();
                if (confirm("Supprimer cette documentation ?")) {
                    all.splice(i, 1);
                    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(all));
                    loadDocs();
                }
            };
            card.appendChild(del);
        }

        docsContainer.appendChild(card);
    });
}
loadDocs();

if (addDocBtn) {
    addDocBtn.onclick = () => {
        if (!isLoggedIn) return;
        const name = prompt("Nom de la nouvelle documentation :");
        const link = prompt("Lien (URL) de la documentation :");
        if (name && link) {
            const saved = getDocsData();
            saved.push({ name, link });
            localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(saved));
            loadDocs();
            showToast("Documentation ajoutée.", "success");
        }
    };
}





// --- LIENS UTILES ---

function loadLinks() {
    if (!linksContainer) return;
    const savedLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS)) || [];
    linksContainer.innerHTML = "";
    savedLinks.forEach((l, i) => {
        const card = document.createElement("div");
        card.className = "doc-card";
        card.textContent = l.name;
        card.onclick = () => window.open(l.link, "_blank");

        if (isLoggedIn) {
            const del = document.createElement("button");
            del.textContent = "X";
            del.className = "delete-btn";
            del.onclick = (e) => {
                e.stopPropagation();
                if (confirm("Supprimer ce lien ?")) {
                    savedLinks.splice(i, 1);
                    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(savedLinks));
                    loadLinks();
                }
            };
            card.appendChild(del);
        }
        linksContainer.appendChild(card);
    });
}
loadLinks();

addLinkBtn && (addLinkBtn.onclick = () => {
    if (!isLoggedIn) return;
    const name = prompt("Nom du lien :");
    const link = prompt("URL du lien :");
    if (name && link) {
        const savedLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS)) || [];
        savedLinks.push({ name, link });
        localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(savedLinks));
        loadLinks();
        showToast("Lien ajouté.", "success");
    }
});





// --- RTH ---

function getRthData() {
    const stored = localStorage.getItem(STORAGE_KEYS.RTH);
    if (stored) return JSON.parse(stored);

    const defaults = [
        {
            date: "12/11/2025",
            materiel: "GE 45kW AG",
            lieu: "ESME",
            obs: "RAS",
            url: "https://ton-lien-ou-ta-fiche/GE45kWAG"
        },
        {
            date: "15/11/2025",
            materiel: "Fiches de commande",
            lieu: "ESME",
            obs: "RAS",
            url: "https://ton-lien-ou-ta-fiche/Routeur1"
        }
    ];
    localStorage.setItem(STORAGE_KEYS.RTH, JSON.stringify(defaults));
    return defaults;
}

function saveRthData(data) {
    localStorage.setItem(STORAGE_KEYS.RTH, JSON.stringify(data));
}

function loadRth() {
    if (!rthTableBody) return;
    const base = getRthData();
    const rows = base.slice();
    const order = rthSortSelect ? rthSortSelect.value : "desc";

    rows.sort((a, b) => {
        const ta = parseFrDate(a.date);
        const tb = parseFrDate(b.date);
        return order === "asc" ? ta - tb : tb - ta;
    });

    rthTableBody.innerHTML = "";

    rows.forEach((row, idx) => {
        const tr = document.createElement("tr");

        const tdDate = document.createElement("td");
        tdDate.textContent = row.date || "";
        tr.appendChild(tdDate);

        const tdMat = document.createElement("td");
        if (row.url) {
            const a = document.createElement("a");
            a.href = row.url;
            a.target = "_blank";
            a.className = "rth-link";
            a.textContent = row.materiel || "";
            tdMat.appendChild(a);
        } else {
            tdMat.textContent = row.materiel || "";
        }
        tr.appendChild(tdMat);

        const tdLieu = document.createElement("td");
        tdLieu.textContent = row.lieu || "";
        tr.appendChild(tdLieu);

        const tdObs = document.createElement("td");
        tdObs.textContent = row.obs || "";

        if (isLoggedIn) {
            const storedAll = getRthData();

            const del = document.createElement("button");
            del.textContent = "🗑";
            del.className = "delete-btn";
            del.style.marginLeft = "8px";
            del.addEventListener("click", e => {
                e.stopPropagation();
                const all = getRthData();
                const realIndex = all.findIndex(
                    r => r.date === row.date && r.materiel === row.materiel && r.lieu === row.lieu && r.obs === row.obs
                );
                if (!confirm("Supprimer cette entrée RTH ?")) return;
                if (realIndex !== -1) {
                    all.splice(realIndex, 1);
                    saveRthData(all);
                    loadRth();
                    showToast("Entrée RTH supprimée.", "success");
                }
            });

            tdObs.appendChild(del);

            tr.style.cursor = "pointer";
            tr.title = "Double-cliquez pour modifier cette ligne";
            tr.addEventListener("dblclick", () => {
                const all = getRthData();
                const realIndex = all.findIndex(
                    r => r.date === row.date && r.materiel === row.materiel && r.lieu === row.lieu && r.obs === row.obs
                );
                if (realIndex === -1) return;

                const current = all[realIndex];
                const date = prompt("Date :", current.date || "") || "";
                const materiel = prompt("Matériel :", current.materiel || "") || "";
                const lieu = prompt("Lieu :", current.lieu || "") || "";
                const obs = prompt("Observation :", current.obs || "") || "";
                const url = prompt("Lien (URL) du matériel :", current.url || "") || "";

                if (!date && !materiel && !lieu && !obs) {
                    if (confirm("Tous les champs sont vides. Supprimer cette entrée ?")) {
                        all.splice(realIndex, 1);
                        saveRthData(all);
                        loadRth();
                        showToast("Entrée RTH supprimée.", "success");
                    }
                    return;
                }

                all[realIndex] = { date, materiel, lieu, obs, url };
                saveRthData(all);
                loadRth();
                showToast("Entrée RTH mise à jour.", "success");
            });
        }

        tr.appendChild(tdObs);
        rthTableBody.appendChild(tr);
    });
}
loadRth();

rthSortSelect?.addEventListener("change", loadRth);

addRthBtn?.addEventListener("click", () => {
    if (!isLoggedIn) return;

    const date = prompt("Date :") || "";
    const materiel = prompt("Matériel :") || "";
    const lieu = prompt("Lieu :") || "";
    const obs = prompt("Observation :") || "";
    const url = prompt("Lien (URL) du matériel (facultatif) :") || "";

    if (!date && !materiel && !lieu && !obs) {
        showToast("Entrée RTH annulée (aucune donnée).", "error");
        return;
    }

    const rows = getRthData();
    rows.push({ date, materiel, lieu, obs, url });
    saveRthData(rows);
    loadRth();
    showToast("Entrée RTH ajoutée.", "success");
});





// --- PHOTOS ---

function loadPhotos() {
    if (!photosContainer) return;
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS) || "[]");
    photosContainer.innerHTML = "";

    photos.forEach((p, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "photo-item";

        const img = document.createElement("img");
        img.src = p;
        img.alt = "Photo";

        img.addEventListener("click", () => {
            if (!photoModal || !photoModalImg) return;
            photoModalImg.src = p;
            photoModal.style.display = "flex";
        });

        wrap.appendChild(img);

        if (isLoggedIn) {
            const del = document.createElement("button");
            del.className = "photo-delete";
            del.textContent = "✕";
            del.addEventListener("click", e => {
                e.stopPropagation();
                if (!confirm("Supprimer cette photo ?")) return;
                const allPhotos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS) || "[]");
                allPhotos.splice(idx, 1);
                localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(allPhotos));
                loadPhotos();
            });
            wrap.appendChild(del);
        }

        photosContainer.appendChild(wrap);
    });
}
loadPhotos();

addPhotoBtn?.addEventListener("click", () => {
    if (!isLoggedIn) return;
    photoUpload?.click();
});

photoUpload?.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast("Fichier trop volumineux (max 2 Mo).", "error");
        return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
        const dataUrl = ev.target.result;
        const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS) || "[]");
        if (photos.length >= 30) {
            showToast("Limite de 30 photos atteinte.", "error");
            return;
        }
        photos.push(dataUrl);
        localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
        loadPhotos();
        showToast("Photo ajoutée.", "success");
    };
    reader.readAsDataURL(file);
});

closePhotoModal?.addEventListener("click", () => {
    if (photoModal) photoModal.style.display = "none";
});
window.addEventListener("click", e => {
    if (e.target === photoModal) photoModal.style.display = "none";
});

// --- CHAT ---

function renderMessages() {
    if (!chatBox) return;
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT) || "[]");
    const currentName =
        (chatName?.value || localStorage.getItem(STORAGE_KEYS.CHAT_NAME) || "").trim();

    chatBox.innerHTML = "";

    messages.forEach((m, idx) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message";
        if (currentName && m.name === currentName) msgDiv.classList.add("me");

        const header = document.createElement("div");
        header.className = "chat-message-header";

        const nameSpan = document.createElement("span");
        nameSpan.className = "chat-message-name";
        nameSpan.textContent = m.name || "Anonyme";

        const timeSpan = document.createElement("span");
        timeSpan.className = "chat-message-time";
        timeSpan.textContent = m.time || "";

        header.appendChild(nameSpan);
        header.appendChild(timeSpan);

        const textDiv = document.createElement("div");
        textDiv.className = "chat-message-text";
        textDiv.textContent = m.text || "";

        msgDiv.appendChild(header);
        msgDiv.appendChild(textDiv);

        if (isLoggedIn) {
            const del = document.createElement("button");
            del.textContent = "🗑️";
            del.className = "delete-btn";
            del.style.marginTop = "6px";
            del.addEventListener("click", () => {
                if (!confirm("Supprimer ce message ?")) return;
                const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT) || "[]");
                all.splice(idx, 1);
                localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(all));
                renderMessages();
            });
            msgDiv.appendChild(del);
        }

        chatBox.appendChild(msgDiv);
    });

    chatBox.scrollTop = chatBox.scrollHeight;

    const lastOpen = parseInt(localStorage.getItem(STORAGE_KEYS.CHAT_LAST_OPEN) || "0", 10);
    const hasNew = messages.some(m => m.ts && m.ts > lastOpen);
    if (chatNotifDot) {
        chatNotifDot.style.display =
            hasNew && currentPage !== "communication" ? "inline-block" : "none";
    }
}

function sendChatMessage() {
    if (!chatInput) return;
    const name = (chatName?.value || "Anonyme").trim();
    const text = chatInput.value.trim();
    if (!text) return;

    localStorage.setItem(STORAGE_KEYS.CHAT_NAME, name);
    if (chatName) chatName.value = name;

    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT) || "[]");
    const ts = Date.now();
    messages.push({
        name,
        text,
        time: formatTimeWithDate(ts),
        ts
    });
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
    chatInput.value = "";
    renderMessages();
}

sendMessageBtn?.addEventListener("click", sendChatMessage);

chatInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendChatMessage();
    }
});

// préremplir le nom si déjà enregistré
const savedChatName = localStorage.getItem(STORAGE_KEYS.CHAT_NAME);
if (savedChatName && chatName) {
    chatName.value = savedChatName;
}

// bouton vider le chat (admin)
clearChatBtn?.addEventListener("click", () => {
    if (!confirm("Supprimer tous les messages du chat ?")) return;
    localStorage.removeItem(STORAGE_KEYS.CHAT);
    renderMessages();
    showToast("Chat vidé.", "success");
});

// compteur online symbolique
if (onlineCount) onlineCount.textContent = "1";





// --- AUTHENTIFICATION ---

async function doLogin() {
    loginError.textContent = "";
    const pwd = passwordInput.value;
    if (!pwd) {
        loginError.textContent = "Veuillez saisir le mot de passe.";
        return;
    }
    try {
        const hash = await hashPassword(pwd);
        if (hash === STORED_PWD_HASH) {
            isLoggedIn = true;
            sessionStorage.setItem(STORAGE_KEYS.LOGGED, "1");
            loginModal.style.display = "none";
            loginBtn.style.display = "none";
            logoutBtn.style.display = "inline-block";
            enableEditing(true);
            showToast("Connexion réussie.", "success");
        } else {
            loginError.textContent = "Mot de passe incorrect.";
            showToast("Mot de passe incorrect.", "error");
        }
    } catch {
        loginError.textContent = "Erreur de chiffrement (navigateur non supporté).";
    }
}

loginBtn?.addEventListener("click", () => {
    loginModal.style.display = "flex";
    loginError.textContent = "";
    passwordInput.value = "";
    passwordInput.focus();
});

closeLoginModal?.addEventListener("click", () => {
    loginModal.style.display = "none";
});

validateLogin?.addEventListener("click", doLogin);
passwordInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        doLogin();
    }
});

window.addEventListener("click", e => {
    if (e.target === loginModal) loginModal.style.display = "none";
});

logoutBtn?.addEventListener("click", () => {
    isLoggedIn = false;
    sessionStorage.removeItem(STORAGE_KEYS.LOGGED);
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    enableEditing(false);
    showToast("Déconnecté.", "success");
});

// --- ACTIVATION ÉDITION ---

function enableEditing(enable) {
    isLoggedIn = enable;

    if (accueilText) accueilText.contentEditable = enable ? "true" : "false";

    if (uploadBtn) uploadBtn.style.display = enable ? "inline-block" : "none";
    if (deleteImgBtn) deleteImgBtn.style.display = enable ? "inline-block" : "none";
    if (addDocBtn) addDocBtn.style.display = enable ? "inline-block" : "none";
    if (addLinkBtn) addLinkBtn.style.display = enable ? "inline-block" : "none";
    if (addPhotoBtn) addPhotoBtn.style.display = enable ? "inline-block" : "none";
    if (clearChatBtn) clearChatBtn.style.display = enable ? "inline-block" : "none";
    if (addRthBtn) addRthBtn.style.display = enable ? "inline-block" : "none";

    loadDocs();
    loadLinks();
    loadRth();
    loadPhotos();
    renderMessages();
}

// au chargement, vérifier si déjà connecté
if (sessionStorage.getItem(STORAGE_KEYS.LOGGED) === "1") {
    isLoggedIn = true;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    enableEditing(true);
} else {
    enableEditing(false);
}

// --- INIT ---

renderMessages();

// mémoriser dernière ouverture du chat si non présent
if (!localStorage.getItem(STORAGE_KEYS.CHAT_LAST_OPEN)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_LAST_OPEN, Date.now().toString());
}

// ESC pour fermer les modales
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        if (loginModal) loginModal.style.display = "none";
        if (photoModal) photoModal.style.display = "none";
    }
});
