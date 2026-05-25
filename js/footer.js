// footer.js

// Load GNH chatbot widget
(function () {
  var s = document.createElement('script');
  s.src = 'https://chatbot.gnhindia.com/widget';
  s.defer = true;
  document.head.appendChild(s);
})();
document.addEventListener("DOMContentLoaded", async function () {
  const wrapper = document.getElementById("footer-menu-columns");
  if (!wrapper) return;

  // Always fetch from site root (adjust if your site lives under a subfolder)
  const CANDIDATES = [
    new URL("/footer-menu.json", window.location.origin).toString(), // absolute (recommended)
    // fallback(s) in case you host it elsewhere:
    // new URL("/assets/footer/footer-menu.json", window.location.origin).toString(),
  ];

  // helper: fetch with timeout + no-cache
  const fetchJSON = async (url) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  };

  // try candidates in order
  let data = null, lastErr = null;
  for (const url of CANDIDATES) {
    try { data = await fetchJSON(url); break; }
    catch (e) { lastErr = e; }
  }
  if (!data) {
    console.warn("Footer menu failed to load:", lastErr);
    return; // quietly skip if it can't be loaded
  }

  const sectionTitles = {
    company: "Company",
    services: "Our Services",
    resources: "Resources",
    quickLinks: "Quick Links"
  };

  // build HTML in fixed order
  const order = ["company", "services", "resources", "quickLinks"];
  let html = "";
  for (const key of order) {
    const items = Array.isArray(data[key]) ? data[key] : [];
    if (!items.length) continue;
    html += `
      <div class="col-lg-2 col-md-6 col-6">
        <nav aria-label="${sectionTitles[key]}">
          <div class="footer-links">
            <p class="footer-col-heading">${sectionTitles[key]}</p>
            <ul>
              ${items.map(link => `<li><a href="${link.url}">${link.label}</a></li>`).join("")}
            </ul>
          </div>
        </nav>
      </div>`;
  }

  // inject before the Contact column
  wrapper.insertAdjacentHTML("afterbegin", html);

  // Countries section — separate row between columns and social bar
  const countries = Array.isArray(data.countries) ? data.countries : [];
  if (countries.length) {
    const strip = `
      <div class="row" style="border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; margin-top:10px;">
        <div class="col-12">
          <div class="footer-links" style="display:flex; align-items:center; flex-wrap:wrap; gap:8px 0;">
            <p class="footer-col-heading" style="margin:0 28px 0 0; white-space:nowrap; font-size:13px; color:#fff;">GNH Worldwide</p>
            ${countries.map(c => `<a href="${c.url}"${c.external ? ' target="_blank" rel="noopener noreferrer"' : ''} style="margin-right:28px; color:#fff; text-decoration:none;">${c.label}</a>`).join("")}
          </div>
        </div>
      </div>`;
    wrapper.insertAdjacentHTML("afterend", strip);
  }
});
