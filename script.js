//----------------------------------------------------------
// CONSTANTES
//----------------------------------------------------------
const PWD_HASH = "c033b721c06a6dc45c18792bbca63b0fc5a76acfa72e08f5762c6c5017820be8"; // DIVSIC2025


//----------------------------------------------------------
// LIENS PAR MATÉRIEL – 
//----------------------------------------------------------
const MATERIEL_LINKS = {
    "SHERPA": {
        ft:  "", 
        cmd: "", 
        doc: ""  
    },
    "CCPTA": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "KERAX 8x4": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "KERAX 6x6": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "K500 GM200-GIRAFFE": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE 45kW AG": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE 45kW NG": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE 20kW": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE 30kW SDMO": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE 15kW GROEL": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE HDTAC": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "GE DIVERS": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "Remorque ACTM": {
        ft:  "",
        cmd: "",
        doc: ""
    },
    "Rocher 1000L": {
        ft:  "",
        cmd: "",
        doc: ""
    }
};




//----------------------------------------------------------
// NAVIGATION
//----------------------------------------------------------
document.querySelectorAll(".nav-link").forEach(link => {
    link.onclick = e => {
        e.preventDefault();
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        document.getElementById(link.dataset.page).classList.add("active");
    };
});

//----------------------------------------------------------
// DATE
//----------------------------------------------------------
function tick() {
    document.getElementById("dateTime").textContent =
        new Date().toLocaleString("fr-FR");
}
setInterval(tick, 1000); tick();

//----------------------------------------------------------
// MODE SOMBRE
//----------------------------------------------------------
document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

//----------------------------------------------------------
// CONNEXION
//----------------------------------------------------------
async function hash(pwd) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

document.getElementById("loginBtn").onclick = () =>
    document.getElementById("loginModal").style.display="flex";

document.getElementById("closeLogin").onclick = () =>
    document.getElementById("loginModal").style.display="none";

document.getElementById("validateLogin").onclick = async () => {
    const val = document.getElementById("passwordInput").value;
    if (await hash(val) === PWD_HASH) {
        sessionStorage.setItem("admin","1");
        setAdmin(true);
        document.getElementById("loginModal").style.display="none";
    } else {
        document.getElementById("loginError").textContent = "Mot de passe incorrect";
    }
};

document.getElementById("logoutBtn").onclick = () => {
    sessionStorage.removeItem("admin");
    setAdmin(false);
};

function setAdmin(x) {
    document.getElementById("loginBtn").style.display = x?"none":"inline-block";
    document.getElementById("logoutBtn").style.display = x?"inline-block":"none";

    document.getElementById("accueilText").contentEditable = x;

    document.getElementById("uploadBtn").style.display = x?"inline-block":"none";
    document.getElementById("deleteImgBtn").style.display = x?"inline-block":"none";

    document.getElementById("addPhoto").style.display = x?"inline-block":"none";
    document.getElementById("addLink").style.display = x?"inline-block":"none";
    document.getElementById("addRth").style.display = x?"inline-block":"none";
}
setAdmin(sessionStorage.getItem("admin")==="1");




//----------------------------------------------------------
// MATERIEL : afficher le détail + liens FT / CMD / DOC
//----------------------------------------------------------
document.querySelectorAll(".doc-card").forEach(card => {
    // On ignore les sous-liens FT / Commandes / Documentations
    if (card.classList.contains("sublink")) return;

    card.onclick = () => {
        const name = card.dataset.name;

        // Met à jour le titre de la page détail
        const titleEl = document.getElementById("detailTitle");
        if (titleEl) {
            titleEl.textContent = name;
        }

        // Récupère les liens pour ce matériel
        const links = MATERIEL_LINKS[name] || {};

        const ftEl  = document.getElementById("ftLink");
        const cmdEl = document.getElementById("cmdLink");
        const docEl = document.getElementById("docLink");

        const applyLink = (el, url) => {
            if (!el) return;
            if (url) {
                el.href = url;
                el.style.pointerEvents = "auto";
                el.classList.remove("disabled");
            } else {
                el.removeAttribute("href");
                el.style.pointerEvents = "none";
                el.classList.add("disabled");
            }
        };

        applyLink(ftEl,  links.ft);
        applyLink(cmdEl, links.cmd);
        applyLink(docEl, links.doc);

        // Affiche la page "materielDetail" et masque les autres
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        const detailPage = document.getElementById("materielDetail");
        if (detailPage) {
            detailPage.classList.add("active");
        }
    };
});





//----------------------------------------------------------
// ACCUEIL : IMAGE
//----------------------------------------------------------
document.getElementById("uploadBtn").onclick = () =>
    document.getElementById("imageUpload").click();

document.getElementById("imageUpload").onchange = e => {
    const f = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
        localStorage.setItem("accueilIMG", ev.target.result);
        document.getElementById("accueilImage").src = ev.target.result;
    };
    reader.readAsDataURL(f);
};

document.getElementById("deleteImgBtn").onclick = () => {
    localStorage.removeItem("accueilIMG");
    document.getElementById("accueilImage").src = "";
};

document.getElementById("accueilImage").src =
    localStorage.getItem("accueilIMG") || "";

//----------------------------------------------------------
// ACCUEIL : TEXTE
//----------------------------------------------------------
const txt = document.getElementById("accueilText");
txt.innerHTML = localStorage.getItem("accueilTXT") || txt.innerHTML;
txt.onblur = () => {
    if (sessionStorage.getItem("admin")==="1")
        localStorage.setItem("accueilTXT", txt.innerHTML);
};

//----------------------------------------------------------
// RTH
//----------------------------------------------------------
function loadRTH() {
    return JSON.parse(localStorage.getItem("rth") || "[]");
}
function saveRTH(list) {
    localStorage.setItem("rth", JSON.stringify(list));
}
function renderRth() {
    const tb = document.getElementById("rthBody");
    tb.innerHTML="";
    loadRTH().forEach(r=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${r.date}</td><td>${r.mat}</td><td>${r.lieu}</td><td>${r.obs}</td>`;
        tb.appendChild(tr);
    });
}
renderRth();

document.getElementById("addRth").onclick = () => {
    const date = prompt("Date ?");
    const mat = prompt("Matériel ?");
    const lieu = prompt("Lieu ?");
    const obs = prompt("Observation ?");
    const list = loadRTH();
    list.push({date,mat,lieu,obs});
    saveRTH(list);
    renderRth();
};

//----------------------------------------------------------
// PHOTOS
//----------------------------------------------------------
function loadPhotos() {
    return JSON.parse(localStorage.getItem("photos")||"[]");
}
function savePhotos(p) {
    localStorage.setItem("photos", JSON.stringify(p));
}
function renderPhotos() {
    const grid = document.getElementById("photoGrid");
    grid.innerHTML="";
    loadPhotos().forEach(src=>{
        const img=document.createElement("img");
        img.src = src;
        grid.appendChild(img);
    });
}
renderPhotos();

document.getElementById("addPhoto").onclick = () =>
    document.getElementById("photoInput").click();

document.getElementById("photoInput").onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
        const list = loadPhotos();
        list.push(ev.target.result);
        savePhotos(list);
        renderPhotos();
    };
    reader.readAsDataURL(file);
};

//----------------------------------------------------------
// LIENS UTILES
//----------------------------------------------------------
function loadLinks() {
    return JSON.parse(localStorage.getItem("links")||"[]");
}
function saveLinks(x) {
    localStorage.setItem("links", JSON.stringify(x));
}
function renderLinks() {
    const ul = document.getElementById("linksList");
    ul.innerHTML="";
    loadLinks().forEach(l=>{
        const li=document.createElement("li");
        li.innerHTML=`<a href="${l.url}" target="_blank">${l.text}</a>`;
        ul.appendChild(li);
    });
}
renderLinks();

document.getElementById("addLink").onclick = () => {
    const text=prompt("Nom du lien ?");
    const url=prompt("URL ?");
    if (!text||!url) return;
    const list=loadLinks();
    list.push({text,url});
    saveLinks(list);
    renderLinks();
};

//----------------------------------------------------------
// BOUTON RETOUR VERS MATÉRIELS
//----------------------------------------------------------
const backBtn = document.getElementById("backToMateriels");

if (backBtn) {
    backBtn.onclick = () => {
        // Cache toutes les pages
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

        // Ré-affiche la page Matériels
        const matPage = document.getElementById("materiels");
        if (matPage) {
            matPage.classList.add("active");
        }
    };
}
