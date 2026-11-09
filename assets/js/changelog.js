/* Changelog — lists every release from GitHub with its notes.
   Uses REPO from main.js. GitHub renders the release notes Markdown
   to HTML for us (the "html" media type), so no Markdown library is needed. */
(function changelog() {
  const list = document.querySelector("[data-cl-list]");
  const index = document.querySelector("[data-cl-index]");
  if (!list) return;

  const repo = typeof REPO === "string" ? REPO : "CitizenRen/mobiDEX";
  const CACHE_KEY = "mobidex-changelog";
  const CACHE_MS = 30 * 60 * 1000;
  const releasesUrl = `https://github.com/${repo}/releases`;

  const esc = (t) =>
    String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (t) => "v-" + String(t).toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
  const ver = (tag) => (/^v/i.test(tag) ? tag : "v" + tag);

  function render(releases) {
    const shown = releases.filter((r) => !r.draft);
    if (!shown.length) {
      list.innerHTML = `<p class="cl-status">No releases published yet. Check <a href="${releasesUrl}" target="_blank" rel="noopener">GitHub</a> for updates.</p>`;
      return;
    }
    const latestId = (shown.find((r) => !r.prerelease) || shown[0]).id;

    list.innerHTML = shown
      .map((r) => {
        const id = slug(r.tag_name);
        const title = r.name && r.name !== r.tag_name ? `<span class="cl-name">${esc(r.name)}</span>` : "";
        const badges =
          (r.id === latestId ? '<span class="badge badge-latest">Latest</span>' : "") +
          (r.prerelease ? '<span class="badge badge-pre">Pre-release</span>' : "");
        const notes = r.body_html && r.body_html.trim()
          ? r.body_html
          : '<p class="cl-empty">No notes for this release.</p>';
        const assets = (r.assets || [])
          .map(
            (a) =>
              `<a class="asset" href="${esc(a.browser_download_url)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 19h16"/></svg>${esc(a.name)}<span>${fmtSize(a.size)}</span></a>`
          )
          .join("");
        return `
        <article class="release" id="${id}">
          <header class="release-head">
            <h2><a href="#${id}">${esc(ver(r.tag_name))}</a></h2>
            ${badges}
            <time datetime="${esc(r.published_at)}">${fmtDate(r.published_at)}</time>
          </header>
          ${title}
          <div class="release-notes">${notes}</div>
          ${assets ? `<div class="assets">${assets}</div>` : ""}
          <a class="cl-gh" href="${esc(r.html_url)}" target="_blank" rel="noopener">View on GitHub →</a>
        </article>`;
      })
      .join("");

    // Notes may contain relative links/images; make links open safely in a new tab
    list.querySelectorAll(".release-notes a[href]").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener";
    });

    if (index && shown.length > 1) {
      index.innerHTML =
        '<p class="cl-index-title">Versions</p>' +
        shown
          .map((r) => `<a href="#${slug(r.tag_name)}">${esc(ver(r.tag_name))}<small>${fmtDate(r.published_at)}</small></a>`)
          .join("");
      index.hidden = false;
    }

    // Jump to a version if the URL has one (e.g. changelog.html#v-0.7.0)
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) el.scrollIntoView();
    }
  }

  function fail() {
    list.innerHTML = `<p class="cl-status">Couldn't load the changelog right now. You can read it on <a href="${releasesUrl}" target="_blank" rel="noopener">GitHub Releases</a>.</p>`;
  }

  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (e) {}
  if (cached && cached.releases) render(cached.releases);
  if (cached && Date.now() - cached.at < CACHE_MS) return;

  fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
    headers: { Accept: "application/vnd.github.html+json" },
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((releases) => {
      const slim = releases.map((r) => ({
        id: r.id,
        tag_name: r.tag_name,
        name: r.name,
        draft: r.draft,
        prerelease: r.prerelease,
        published_at: r.published_at,
        html_url: r.html_url,
        body_html: r.body_html,
        assets: (r.assets || []).map((a) => ({ name: a.name, size: a.size, browser_download_url: a.browser_download_url })),
      }));
      render(slim);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), releases: slim })); } catch (e) {}
    })
    .catch(() => { if (!cached) fail(); });
})();
