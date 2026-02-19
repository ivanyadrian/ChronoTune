(async function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  console.log("Scrolling playlist...");

  const container = document.querySelector("ytd-playlist-video-list-renderer") || document.querySelector("ytd-playlist-panel-renderer");
  if (!container) return console.error("Playlist container not found");

  let lastHeight = 0;
  while (true) {
    window.scrollTo(0, document.documentElement.scrollHeight);
    await sleep(1200);
    if (document.documentElement.scrollHeight === lastHeight) break;
    lastHeight = document.documentElement.scrollHeight;
  }

  console.log("Collecting items...");
  let items = document.querySelectorAll("ytd-playlist-video-renderer");
  const result = [];
  const currentYear = new Date().getFullYear();

  items.forEach((item, index) => {
    const titleEl = item.querySelector("#video-title");
    const channelEl = item.querySelector("#channel-name a");
    const metaStats = item.querySelector("#video-info") || item.querySelector("#metadata-line");
    const relativeDateText = metaStats?.textContent || "";

    if (!titleEl) return;

    let youtubeId = new URL(titleEl.href).searchParams.get("v") || "";
    let rawTitle = titleEl.textContent.trim();
    let [artist, ...titleParts] = rawTitle.includes(" - ") ? rawTitle.split(" - ") : [channelEl?.textContent.trim() || "Ismeretlen", rawTitle];
    let title = titleParts.join(" - ").trim() || rawTitle;

    let year = 0;
    const yearMatch = relativeDateText.match(/(\d+)\s+éve/);
    const yearMatchEn = relativeDateText.match(/(\d+)\s+year/);
    
    if (yearMatch) year = currentYear - parseInt(yearMatch[1]);
    else if (yearMatchEn) year = currentYear - parseInt(yearMatchEn[1]);
    else if (relativeDateText.includes("hónapja") || relativeDateText.includes("month")) year = currentYear;

    result.push({
      id: index,
      title,
      artist,
      year: year || currentYear,
      rawTitle
    });
  });

  console.log("Exported items:", result.length);
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "youtube_chronotune_export.json";
  a.click();
})();