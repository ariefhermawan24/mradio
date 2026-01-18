const serverList = [
    "https://de1.api.radio-browser.info/json/",
    "https://de2.api.radio-browser.info/json/",
    "https://fi1.api.radio-browser.info/json/"
];

const serverName = {
    "https://de1.api.radio-browser.info/json/": "Germany Server 1",
    "https://de2.api.radio-browser.info/json/": "Germany Server 2",
    "https://fi1.api.radio-browser.info/json/": "Finland Server"
};

let API = "";
let stationTagPool = [];
let officialTagsCache = [];

/* ---------------- DEBOUNCE ---------------- */
function debounce(func, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* ---------------- SERVER AUTO SELECT ---------------- */
async function getServer() {
    loadingText.innerHTML = "Connecting to radio server<span class='dots'></span>";
    loadingDetail.innerHTML = "Checking available nodes<span class='dots'></span>";

    for (let s of serverList) {
        try {
            loadingDetail.innerText = "Trying " + serverName[s];

            const r = await fetch(s + "stats");

            if (r.ok) {
                API = s;
                loadingDetail.innerText = "Connected to " + serverName[s];
                await sleep(1200);
                return true;
            }

        } catch (e) {
            loadingDetail.innerText = serverName[s] + " unavailable";
        }
    }

    loadingText.innerText = "Connection Failed";
    loadingDetail.innerText = "All radio servers cannot be reached right now.";

    loadingIcon.className = "broken-radio";
    loadingIcon.innerHTML = "";

    return false;
}

function finishLoading() {
  loadingText.innerText = "Setup complete";
  loadingDetail.innerText = "Radio service ready";

  setTimeout(() => {
    loadingOverlay.classList.add("loading-hide");

    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 500); // tunggu animasi selesai
  }, 600);
}

/* ---------------- TAG POOL DARI STATION ---------------- */
async function buildStationTagPool() {
    const r = await fetch(API + "stations/topvote/200");
    const data = await r.json();

    const raw = [];
    data.forEach(s => {
        if (!s.tags) return;
        s.tags.split(",").forEach(t => {
            const clean = t.trim().toLowerCase();
            if (clean.length > 2) raw.push(clean);
        });
    });

    stationTagPool = [...new Set(raw)];
}

/* ---------------- LOAD TAG RESMI ---------------- */
async function loadOfficialTags() {
    const r = await fetch(API + "tags");
    officialTagsCache = await r.json();
}

/* ---------------- OVERLAY ---------------- */
function openOverlay() {
    const ov = document.getElementById("searchOverlay");
    ov.classList.remove("hide");
    ov.style.display = "block";

    requestAnimationFrame(() => {
        ov.classList.add("show");
    });

    document.body.style.overflow = "hidden";
}

function closeOverlay() {
    const ov = document.getElementById("searchOverlay");
    ov.classList.remove("show");
    ov.classList.add("hide");

    setTimeout(() => {
        ov.style.display = "none";
    }, 350);

    document.body.style.overflow = "auto";
}


/* ---------------- KEYBOARD NAVIGATION FIX ---------------- */
function enableKeyboardNavigation(input, box) {
    let index = -1;

    input.addEventListener("keydown", e => {
        const items = [...box.querySelectorAll(".suggest-item:not(.disabled)")];
        if (!items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            index = (index + 1) % items.length;
            updateHighlight(items);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            index = (index - 1 + items.length) % items.length;
            updateHighlight(items);
        }

        if (e.key === "Enter" && index >= 0) {
            e.preventDefault();
            items[index].click();
            index = -1;
        }

        if (e.key === "Backspace" && !input.value) {
            box.innerHTML = "";
            index = -1;
        }
    });

    function updateHighlight(items) {
        items.forEach(i => i.classList.remove("active"));
        items[index].classList.add("active");
        items[index].scrollIntoView({
            block: "nearest"
        });
    }
}

/* ---------------- COUNTRY ---------------- */
async function loadCountries() {
    const r = await fetch(API + "countries");
    const data = await r.json();
    countrySelect.innerHTML = `<option value="">All Countries</option>`;
    data.sort((a, b) => b.stationcount - a.stationcount);
    data.forEach(c => {
        countrySelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
}

/* ---------------- CARD ---------------- */
function card(s) {
    return `
  <div class="card-radio text-white">
    <b>${s.name}</b><br>
    <small>${s.country} • ${s.tags}</small><br>
    <audio controls src="${s.url_resolved}" style="width:100%"></audio>
  </div>`;
}

/* ---------------- SEARCH ---------------- */
async function searchRadio() {
    const r = await fetch(API + `stations/search?name=${radioInput.value}&country=${countrySelect.value}&tag=${tagInput.value}&limit=20`);
    const data = await r.json();
    topStations.innerHTML = data.map(card).join("");
}

/* ---------------- TOP ---------------- */
async function loadTopTags() {
    const r = await fetch(API + "tags");
    const data = await r.json();
    data.sort((a, b) => b.stationcount - a.stationcount);
    topTags.innerHTML = data.slice(0, 20).map(t => `<div class="card-radio">${t.name}<br><small>${t.stationcount} stations</small></div>`).join("");
}
async function loadTopStations() {
    const r = await fetch(API + "stations/topvote/20");
    const data = await r.json();
    topStations.innerHTML = data.map(card).join("");
}

/* ---------------- CLICK OUTSIDE ---------------- */
document.addEventListener("click", e => {
    if (!radioInput.contains(e.target)) radioSuggest.innerHTML = "";
    if (!tagInput.contains(e.target)) tagSuggest.innerHTML = "";
});

/* ---------------- INIT ---------------- */
window.addEventListener("DOMContentLoaded", async () => {

    const ok = await getServer();
    if (!ok) return;

    loadingText.innerHTML = "Preparing radio content<span class='dots'></span>";
    loadingDetail.innerText = "Initializing resources";

    try {

        loadingDetail.innerText = "Collecting popular station genres";
        await buildStationTagPool();

        loadingDetail.innerText = "Syncing global radio categories";
        await loadOfficialTags();

        loadingDetail.innerText = "Loading country database";
        await loadCountries();

        loadingDetail.innerText = "Analyzing most listened genres";
        await loadTopTags();

        loadingDetail.innerText = "Fetching trending radio stations";
        await loadTopStations();

    } catch (e) {
        loadingIcon.className = "broken-radio";
        loadingIcon.innerHTML = "";

        loadingText.innerText = "Setup failed";
        loadingDetail.innerText = "Unable to load radio data.";
        return;
    }

    finishLoading();

    enableKeyboardNavigation(radioInput, radioSuggest);
    enableKeyboardNavigation(tagInput, tagSuggest);

    const radioSearch = debounce(async val => {
        const r = await fetch(API + `stations/search?name=${val}&limit=20`);
        const data = await r.json();
        if (!data.length) {
            radioSuggest.innerHTML = `<div class="suggest-item disabled">No radio found</div>`;
            return;
        }
        radioSuggest.innerHTML = data.map(d => `
   <div class="suggest-item" onclick="radioInput.value='${d.name.replace(/'/g,"")}'; radioSuggest.innerHTML=''">${d.name}</div>
  `).join("");
    });

    radioInput.oninput = e => {
        const val = e.target.value.trim();
        if (!val) return radioSuggest.innerHTML = "";
        radioSearch(val);
    };

    const tagSearch = debounce(val => {
        const keyword = val.toLowerCase();

        const official = officialTagsCache.map(t => t.name.toLowerCase());
        const combined = [...new Set([...official, ...stationTagPool])];

        const filtered = combined.filter(t => t.includes(keyword)).slice(0, 20);
        if (!filtered.length) {
            tagSuggest.innerHTML = `<div class="suggest-item disabled">No matching tags found</div>`;
            return;
        }

        tagSuggest.innerHTML = filtered.map(t => `
   <div class="suggest-item" onclick="tagInput.value='${t}'; tagSuggest.innerHTML=''">${t}</div>
  `).join("");
    });

    tagInput.oninput = e => {
        const val = e.target.value.trim();
        if (!val) return tagSuggest.innerHTML = "";
        tagSearch(val);
    };

});