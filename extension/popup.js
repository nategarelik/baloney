// Animated count-up
function animateCount(el, target) {
  if (target === 0) {
    el.textContent = "0";
    return;
  }
  const duration = 600;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Master toggle ──
const masterToggle = document.querySelector("#master-toggle input");
const statusLight = document.getElementById("status-light");
const bodyContent = document.getElementById("body-content");

chrome.storage.local.get("extensionEnabled", (data) => {
  const enabled = data.extensionEnabled !== false;
  masterToggle.checked = enabled;
  statusLight.className = `status-light ${enabled ? "on" : "off"}`;
  bodyContent.classList.toggle("disabled", !enabled);
});

masterToggle.addEventListener("change", () => {
  const enabled = masterToggle.checked;
  chrome.storage.local.set({ extensionEnabled: enabled });
  statusLight.className = `status-light ${enabled ? "on" : "off"}`;
  bodyContent.classList.toggle("disabled", !enabled);
});

// ── Auto-scan toggles ──
const toggleMap = {
  "toggle-text": "autoScanText",
  "toggle-images": "autoScanImages",
  "toggle-videos": "autoScanVideos",
};

chrome.storage.local.get(
  ["autoScanText", "autoScanImages", "autoScanVideos"],
  (data) => {
    document.querySelector("#toggle-text input").checked =
      data.autoScanText === true;
    document.querySelector("#toggle-images input").checked =
      data.autoScanImages !== false;
    document.querySelector("#toggle-videos input").checked =
      data.autoScanVideos !== false;
  },
);

Object.entries(toggleMap).forEach(([elId, storageKey]) => {
  const input = document.querySelector(`#${elId} input`);
  input.addEventListener("change", () => {
    chrome.storage.local.set({ [storageKey]: input.checked });
  });
});

// ── Content mode segmented control ──
const segmentBtns = document.querySelectorAll(".segment-btn");

chrome.storage.local.get("contentMode", (data) => {
  const current = data.contentMode || "scan";
  segmentBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === current);
  });
});

segmentBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    chrome.storage.local.set({ contentMode: mode });
    segmentBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ── Load stats ──
chrome.storage.local.get("sessionStats", (data) => {
  const stats = data.sessionStats || {
    scanned: 0,
    flaggedAI: 0,
    textScanned: 0,
    textFlagged: 0,
  };
  const totalScanned = stats.scanned + (stats.textScanned || 0);
  const totalFlagged = stats.flaggedAI + (stats.textFlagged || 0);

  animateCount(document.getElementById("scanned"), totalScanned);
  animateCount(document.getElementById("flagged"), totalFlagged);
});

// ── Page stats toggle + render ──
const pageStatsToggle = document.getElementById("page-stats-toggle");
const pageStatsArrow = document.getElementById("page-stats-arrow");
const pageStatsContent = document.getElementById("page-stats-content");

pageStatsToggle.addEventListener("click", () => {
  const isOpen = pageStatsContent.classList.toggle("open");
  pageStatsArrow.classList.toggle("open", isOpen);
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentUrl = tabs[0]?.url || "";
  let currentHostname = "";
  try {
    currentHostname = new URL(currentUrl).hostname;
  } catch {}

  chrome.storage.local.get("pageStats", (data) => {
    const pageStats = data.pageStats || {};
    let html = "";

    // Current page stats
    const current = pageStats[currentHostname];
    if (currentHostname && current) {
      html += `<div class="page-stats-current">
        <div class="page-stats-hostname">${currentHostname}</div>
        <div class="page-stats-row">
          <span>${current.images || 0} images</span>
          <span>${current.text || 0} text</span>
          <span>${current.flagged || 0} flagged</span>
        </div>
      </div>`;
    } else if (currentHostname) {
      html += `<div class="page-stats-current">
        <div class="page-stats-hostname">${currentHostname}</div>
        <div class="page-stats-row"><span>No scan data yet</span></div>
      </div>`;
    }

    // Top 3 sites by total scans
    const sites = Object.entries(pageStats)
      .map(([host, s]) => ({ host, total: (s.images || 0) + (s.text || 0) }))
      .filter((s) => s.host !== currentHostname && s.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    if (sites.length > 0) {
      html += `<div class="page-stats-divider">Top Sites</div>`;
      sites.forEach((s) => {
        html += `<div class="page-stats-site">
          <span class="page-stats-site-name">${s.host}</span>
          <span class="page-stats-site-count">${s.total} scans</span>
        </div>`;
      });
    }

    if (!html) {
      html = `<div class="page-stats-empty">No scan data yet</div>`;
    }

    pageStatsContent.innerHTML = html;
  });
});

// ── Edit allowed websites link ──
document.getElementById("edit-sites").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://baloney.app/allowed-sites" });
});
