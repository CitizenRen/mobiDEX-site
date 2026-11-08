/* ------------------------------------------------------------------
   SETTINGS — change this to your GitHub "username/repo".
   The site looks up the latest release and points every Download
   button at it. If the lookup fails, buttons go to the releases page.
------------------------------------------------------------------- */
const REPO = "CitizenRen/mobiDEX";

/* ---------- Download links + version from GitHub Releases ---------- */
(function releases() {
  const releasesPage = `https://github.com/${REPO}/releases/latest`;
  const CACHE_KEY = "mobidex-latest-release";
  const CACHE_MS = 30 * 60 * 1000; // re-check GitHub at most every 30 min per visitor

  document.querySelectorAll("[data-download]").forEach((a) => (a.href = releasesPage));

  function apply(rel) {
    const raw = rel.tag || rel.name || "";
    if (raw) {
      const v = /^v/i.test(raw) ? raw : "v" + raw;
      document.querySelectorAll("[data-version]").forEach((el) => (el.textContent = v));
    }
    if (rel.date) {
      const d = new Date(rel.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
      document.querySelectorAll("[data-release-date]").forEach((el) => (el.textContent = " · released " + d));
    }
    if (rel.asset) {
      document.querySelectorAll(".btn[data-download]").forEach((a) => (a.href = rel.asset));
    }
  }

  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (e) {}
  if (cached) apply(cached);
  if (cached && Date.now() - cached.at < CACHE_MS) return;

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      // Prefer a Windows .zip / .exe / .msi / .7z asset for the main buttons
      const asset = (rel.assets || []).find((a) => /\.(zip|exe|msi|7z)$/i.test(a.name));
      const info = {
        tag: rel.tag_name,
        name: rel.name,
        date: rel.published_at,
        asset: asset ? asset.browser_download_url : null,
        at: Date.now(),
      };
      apply(info);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(info)); } catch (e) {}
    })
    .catch(() => {});
})();

/* ---------- Tour: sidebar tabs + category chips ---------- */
(function tour() {
  const root = document.querySelector("[data-tour]");
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll("[data-panel]")];
  const stage = root.querySelector("[data-stage]");
  const cap = root.querySelector("[data-stage-cap]");
  const SHOT = (name) => `assets/img/shots/${name}.webp`;

  // Preload thumbnails-sized hints aren't needed; preload full shots on idle
  const preload = () =>
    root.querySelectorAll("[data-shot]").forEach((b) => {
      const i = new Image();
      i.src = SHOT(b.dataset.shot);
    });
  ("requestIdleCallback" in window ? requestIdleCallback : setTimeout)(preload);

  function show(chip) {
    const src = SHOT(chip.dataset.shot);
    if (stage.getAttribute("src") === src) return;
    stage.classList.add("is-loading");
    const img = new Image();
    img.onload = () => {
      stage.src = src;
      stage.alt = chip.dataset.cap;
      stage.classList.remove("is-loading");
    };
    img.src = src;
    cap.textContent = chip.dataset.cap;
  }

  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
    const panel = panels.find((p) => p.dataset.panel === tab.dataset.tab);
    show(panel.querySelector(".chip.is-on"));
    if (focus) tab.focus();
  }

  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      const k = e.key;
      let n = null;
      if (k === "ArrowDown" || k === "ArrowRight") n = (i + 1) % tabs.length;
      if (k === "ArrowUp" || k === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      if (k === "Home") n = 0;
      if (k === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
    });
  });

  root.querySelectorAll(".chips").forEach((group) => {
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-on", c === chip));
      show(chip);
    });
  });
})();

/* ---------- Lightbox ---------- */
(function lightbox() {
  const dlg = document.querySelector("[data-lightbox]");
  if (!dlg || typeof dlg.showModal !== "function") return;
  const img = dlg.querySelector("[data-lightbox-img]");
  const open = (src, alt) => { img.src = src; img.alt = alt || ""; dlg.showModal(); };

  document.querySelector(".stage-btn")?.addEventListener("click", (e) => {
    const s = e.currentTarget.querySelector("img");
    open(s.src, s.alt);
  });
  document.querySelectorAll(".window > img").forEach((s) => {
    s.style.cursor = "zoom-in";
    s.addEventListener("click", () => open(s.src, s.alt));
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target === img) dlg.close(); });
})();
