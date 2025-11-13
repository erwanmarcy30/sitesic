// --- Constants & keys ---
const STORAGE_KEYS = {
    ACCUEIL_TEXT: "accueilText",
    ACCUEIL_IMAGE: "accueilImage",
    PHOTOS: "photosGallery",
    LINKS: "usefulLinks",
    DOCS: "docsList",
    CHAT: "divsic_chat_messages",
    LOGGED: "divsic_logged",
    THEME: "divsic_theme",
    CHAT_ONLINE: "divsic_chat_online"
};

// --- Password hash (SHA-256 of "DIVSIC2025") ---
const STORED_PWD_HASH = "c033b721c06a6dc45c18792bbca63b0fc5a76acfa72e08f5762c6c5017820be8";

// --- DOM references ---
const notifDot = document.getElementById("notifDot");
const dateTimeElement = document.getElementById("dateTime");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginModal = document.getElementById("loginModal");
const validateLogin = document.getElementById("validateLogin");
const cancelLogin = document.getElementById("cancelLogin");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");
const themeToggle = document.getElementById("themeToggle");
const accueilText = document.getElementById("accueil-text");
const uploadBtn = document.getElementById("uploadBtn");
const deleteImgBtn = document.getElementById("deleteImgBtn");
const imageUpload = document.getElementById("imageUpload");
const accueilImage = document.getElementById("accueilImage");
const addDocBtn = document.getElementById("addDocBtn");
const docsContainer = document.getElementById("docs-container");
const addLinkBtn = document.getElementById("addLinkBtn");
const linksContainer = document.getElementById("links-container");
const photosContainer = document.getElementById("photosContainer");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoUpload = document.getElementById("photoUpload");
const photoModal = document.getElementById("photoModal");
const photoModalImg = document.getElementById("photoModalImg");
const closePhotoModal = document.getElementById("closePhotoModal");
const chatBox = document.getElementById("chat-box");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const chatInput = document.getElementById("chat-message");
const chatName = document.getElementById("chat-name");
const onlineCount = document.getElementById("onlineCount");
const toastContainer = document.getElementById("toastContainer");

let isLoggedIn = false;

// --- Toast utility ---
function toast(message, type = "info", timeout = 3500) {
    const t = document.createElement("div");
    t.className = `toast ${type === "success" ? "success" : type === "error" ? "error" : ""}`;
    t.textContent = message;
    toastContainer.appendChild(t);
    setTimeout(() => t.classList.add("visible"), 50);
    setTimeout(() => {
        t.classList.remove("visible");
        t.addEventListener("transitionend", () => t.remove(), { once: true });
    }, timeout);
}

// --- Navigation ---
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        link.classList.add("active");
        const pageId = link.getAttribute("data-page");
        const page = document.getElementById(pageId);
        if (page) page.classList.add("active");
        if (pageId === "communication") notifDot.style.display = "none";
    });
});

// --- Date & Time ---
function updateDateTime() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const date = now.toLocaleDateString("fr-FR", options);
    const time = now.toLocaleTimeString("fr-FR");
    dateTimeElement.textContent = `${date} — ${time}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// --- Theme ---
function loadTheme() {
    const t = localStorage.getItem(STORAGE_KEYS.THEME);
    if (t === "dark") document.body.classList.add("dark");
}
loadTheme();
themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(STORAGE_KEYS.THEME, document.body.classList.contains("dark") ? "dark" : "light");
    toast(`Thème ${document.body.classList.contains("dark") ? "sombre" : "clair"} activé`, "success");
};

// --- Authentification ---
if (sessionStorage.getItem(STORAGE_KEYS.LOGGED) === "1") {
    isLoggedIn = true;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    enableEditing(true);
}

loginBtn.onclick = () => {
    loginModal.style.display = "flex";
    passwordInput.value = "";
    passwordInput.focus();
};
cancelLogin.onclick = () => loginModal.style.display = "none";
window.addEventListener("click", e => {
    if (e.target === loginModal) loginModal.style.display = "none";
});

async function sha256Hex(str) {
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(str));
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

validateLogin.onclick = async () => {
    const input = passwordInput.value || "";
    const hash = await sha256Hex(input);
    if (hash === STORED_PWD_HASH) {
        isLoggedIn = true;
        sessionStorage.setItem(STORAGE_KEYS.LOGGED, "1");
        loginModal.style.display = "none";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        enableEditing(true);
        renderMessages();
        toast("Connexion réussie", "success");
    } else {
        loginError.textContent = "Mot de passe incorrect.";
        toast("Échec de la connexion", "error");
    }
};

logoutBtn.onclick = () => {
    isLoggedIn = false;
    sessionStorage.removeItem(STORAGE_KEYS.LOGGED);
    enableEditing(false);
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    renderMessages();
    toast("Déconnecté", "success");
};

// --- Accueil ---
function loadAccueilText() {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCUEIL_TEXT);
    if (saved && accueilText) accueilText.textContent = saved;
}
loadAccueilText();

uploadBtn && (uploadBtn.onclick = () => imageUpload.click());
imageUpload && imageUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        localStorage.setItem(STORAGE_KEYS.ACCUEIL_IMAGE, ev.target.result);
        displayImage();
        toast("Image d'accueil enregistrée", "success");
    };
    reader.readAsDataURL(file);
});
function displayImage() {
    const imgData = localStorage.getItem(STORAGE_KEYS.ACCUEIL_IMAGE);
    if (imgData && accueilImage) {
        accueilImage.src = imgData;
        accueilImage.style.display = "block";
    } else if (accueilImage) accueilImage.style.display = "none";
}
displayImage();

deleteImgBtn && (deleteImgBtn.onclick = () => {
    if (confirm("Supprimer cette image ?")) {
        localStorage.removeItem(STORAGE_KEYS.ACCUEIL_IMAGE);
        displayImage();
        toast("Image supprimée", "success");
    }
});

if (accueilText) {
    accueilText.addEventListener("input", () => {
        if (isLoggedIn) localStorage.setItem(STORAGE_KEYS.ACCUEIL_TEXT, accueilText.textContent);
    });
}

// --- DOCUMENTS ---
const defaultDocs = [
  { name: "GE 45kW AG", link: "https://example.com/GE45AG" },
  { name: "GE 45kW NG", link: "https://example.com/GE45NG" },
  { name: "SHERPA", link: "https://example.com/SHERPA" },
  { name: "KERAX 8x4", link: "https://example.com/KERAX8x4" },
  { name: "KERAX 6x6", link: "https://example.com/KERAX6x6" }
];
if (!localStorage.getItem(STORAGE_KEYS.DOCS)) {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(defaultDocs));
}

function loadDocs() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS)) || [];
    docsContainer.innerHTML = "";
    saved.forEach((d, i) => {
        const card = document.createElement("div");
        card.className = "doc-card";
        card.textContent = d.name;
        card.onclick = () => window.open(d.link, "_blank");
        if (isLoggedIn) {
            const del = document.createElement("button");
            del.textContent = "X";
            del.className = "delete-btn";
            del.onclick = (e) => {
                e.stopPropagation();
                if (confirm("Supprimer cette documentation ?")) {
                    saved.splice(i,1);
                    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(saved));
                    loadDocs();
                    toast("Documentation supprimée", "success");
                }
            };
            card.appendChild(del);
        }
        docsContainer.appendChild(card);
    });
}
loadDocs();

addDocBtn && (addDocBtn.onclick = () => {
    const name = prompt("Nom de la nouvelle documentation :");
    const link = prompt("Lien (URL) de la documentation :");
    if (name && link) {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS)) || [];
        saved.push({ name, link });
        localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(saved));
        loadDocs();
        toast("Documentation ajoutée", "success");
    }
});

// --- LIENS ---
function loadLinks() {
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
                    toast("Lien supprimé", "success");
                }
            };
            card.appendChild(del);
        }
        linksContainer.appendChild(card);
    });
}
loadLinks();

addLinkBtn && (addLinkBtn.onclick = () => {
    const name = prompt("Nom du lien utile :");
    const link = prompt("URL du lien :");
    if (name && link) {
        const savedLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS)) || [];
        savedLinks.push({ name, link });
        localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(savedLinks));
        loadLinks();
        toast("Lien ajouté", "success");
    }
});

// --- PHOTOS ---
function loadPhotos() {
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS)) || [];
    photosContainer.innerHTML = "";
    photos.forEach((src, index) => {
        const div = document.createElement("div");
        div.className = "photo-item";
        const img = document.createElement("img");
        img.src = src;
        img.alt = `photo-${index}`;
        img.onclick = () => {
            photoModal.style.display = "flex";
            photoModalImg.src = src;
        };
        const del = document.createElement("button");
        del.textContent = "🗑️";
        del.className = "photo-delete";
        del.onclick = () => {
            if (confirm("Supprimer cette photo ?")) {
                photos.splice(index, 1);
                localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
                loadPhotos();
                toast("Photo supprimée", "success");
            }
        };
        div.appendChild(img);
        if (isLoggedIn) div.appendChild(del);
        photosContainer.appendChild(div);
    });
}
loadPhotos();

addPhotoBtn && (addPhotoBtn.onclick = () => photoUpload.click());
photoUpload && photoUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS)) || [];
        photos.push(ev.target.result);
        localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
        loadPhotos();
        toast("Photo ajoutée", "success");
    };
    reader.readAsDataURL(file);
});

closePhotoModal && (closePhotoModal.onclick = () => photoModal.style.display = "none");
window.addEventListener("click", e => {
    if (e.target === photoModal) photoModal.style.display = "none";
});

// --- CHAT ---
function renderMessages() {
    if (!chatBox) return;
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT)) || [];
    chatBox.innerHTML = "";
    messages.forEach((m, i) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message";
        msgDiv.innerHTML = `<strong>${escapeHtml(m.name)}</strong> <span style="color:var(--muted);font-size:12px">(${m.time})</span><br>${escapeHtml(m.text)}`;
        if (isLoggedIn) {
            const del = document.createElement("button");
            del.textContent = "🗑️";
            del.className = "delete-btn";
            del.style.cssText = "margin-top:6px;padding:2px 6px;font-size:12px;";
            del.onclick = () => {
                if (confirm("Supprimer ce message ?")) {
                    messages.splice(i, 1);
                    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
                    renderMessages();
                    toast("Message supprimé", "success");
                }
            };
            msgDiv.appendChild(del);
        }
        chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendMessageBtn?.addEventListener("click", () => {
    const name = (chatName.value || "Anonyme").trim();
    const text = chatInput.value.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT)) || [];
    messages.push({ name, text, time });
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
    const activePage = document.querySelector(".page.active");
    if (!activePage || activePage.id !== "communication") notifDot.style.display = "inline-block";
    chatInput.value = "";
    renderMessages();
    try { localStorage.setItem(STORAGE_KEYS.CHAT + "_updated_at", Date.now()); } catch(e) {}
});

window.addEventListener("storage", e => {
    if (e.key === STORAGE_KEYS.CHAT || e.key === STORAGE_KEYS.CHAT + "_updated_at") renderMessages();
    if (e.key === STORAGE_KEYS.CHAT_ONLINE) onlineCount.textContent = e.newValue || "0";
});

let userCount = parseInt(localStorage.getItem(STORAGE_KEYS.CHAT_ONLINE) || "0", 10);
userCount++;
localStorage.setItem(STORAGE_KEYS.CHAT_ONLINE, userCount);
onlineCount && (onlineCount.textContent = userCount);
window.addEventListener("beforeunload", () => {
    let count = parseInt(localStorage.getItem(STORAGE_KEYS.CHAT_ONLINE) || "1", 10);
    count = Math.max(0, count - 1);
    localStorage.setItem(STORAGE_KEYS.CHAT_ONLINE, count);
});

renderMessages();

// --- Helpers ---
function enableEditing(enable) {
    if (accueilText) accueilText.contentEditable = enable;
    addDocBtn && (addDocBtn.style.display = enable ? "inline-block" : "none");
    uploadBtn && (uploadBtn.style.display = enable ? "inline-block" : "none");
    deleteImgBtn && (deleteImgBtn.style.display = enable ? "inline-block" : "none");
    addPhotoBtn && (addPhotoBtn.style.display = enable ? "inline-block" : "none");
    addLinkBtn && (addLinkBtn.style.display = enable ? "inline-block" : "none");
    loadPhotos();
    loadLinks();
    loadDocs();
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"'`]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
    })[c]);
}

enableEditing(isLoggedIn);

document.addEventListener("keydown", e => {
    if (e.key === "Enter" && document.activeElement && document.activeElement.id === "chat-message") {
        e.preventDefault();
        sendMessageBtn.click();
    }
    if (e.key === "Escape") {
        if (loginModal) loginModal.style.display = "none";
        if (photoModal) photoModal.style.display = "none";
    }
});
