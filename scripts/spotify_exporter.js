/**
 * spotify_exporter.js
 * ---------------------------------------------------------------------
 * Browser Console Scraper Script for Spotify Web Player.
 *
 * How to use:
 *   1. Open Spotify Web Player (open.spotify.com) in your browser.
 *   2. Navigate to the desired public or personal playlist.
 *   3. Open Developer Tools (F12) -> Console tab.
 *   4. Paste this entire script into the console and press Enter.
 *   5. The script automatically scrolls through the playlist, extracts
 *      artist and track titles, and prompts a JSON download: spotify_export.json.
 * ---------------------------------------------------------------------
 */

(() => {
  document.querySelector("main")?.scrollTo(0, 0);
  const result = [];
  console.log(
    "[Spotify Exporter] Starting in 3 seconds... Do not interact with the window.",
  );
  document.body.style.pointerEvents = "none";

  // Hide scrollbar to prevent visual interference during auto-scroll
  const scrollbar = document.querySelector(
    ".main-view-container div.os-scrollbar.os-scrollbar-vertical",
  );
  if (scrollbar) scrollbar.style.display = "none";

  setTimeout(() => {
    const listElement = document.querySelector(
      "[data-testid$='list']:not([data-testid='recommended-track'] *):not(svg)",
    );

    if (!listElement) {
      console.error(
        "[Spotify Exporter] Playlist container not found. Ensure you are on an active playlist page.",
      );
      document.body.style.pointerEvents = "";
      return;
    }

    const totalRows = parseInt(
      listElement.getAttribute("aria-rowcount") || "0",
      10,
    );

    if (totalRows > 0) {
      const intervalId = setInterval(() => {
        const rows = document.querySelectorAll(
          "[data-testid$='list']:not([data-testid='recommended-track'] *) > div:nth-of-type(2) [role='row']",
        );
        const lastRow = rows[rows.length - 1];
        const firstRow = rows[0];

        if (lastRow != null && firstRow != null) {
          const lastRowNr = parseInt(
            lastRow.getAttribute("aria-rowindex") || "0",
            10,
          );

          // Process and extract visible row items
          rows.forEach((row) => {
            const index =
              parseInt(row.getAttribute("aria-rowindex") || "0", 10) - 2;
            if (index >= 0 && !result[index]) {
              const titleEl = row.querySelector("div[dir='auto']");
              const artistEls = row.querySelectorAll(
                "span.standalone-ellipsis-one-line a[href*='/artist/']",
              );
              const artists = Array.from(artistEls)
                .map((a) => a.textContent)
                .join(", ");

              if (titleEl && artists) {
                console.log(
                  `[Spotify Exporter] Saving track: ${index + 1}/${totalRows - 1} -> ${artists}: ${titleEl.textContent}`,
                );
                result[index] = {
                  title: titleEl.textContent?.trim() || "",
                  artist: artists.trim(),
                };
              }
            }
          });

          lastRow.scrollIntoView();

          // Check if end of list has been reached
          if (lastRowNr >= totalRows) {
            clearInterval(intervalId);

            // Filter out any potential sparse array gaps
            const finalResult = result.filter((item) => item !== undefined);

            console.log(
              "[Spotify Exporter] Extraction complete! Generating JSON file...",
              finalResult,
            );

            const blob = new Blob([JSON.stringify(finalResult, null, 2)], {
              type: "application/json",
            });
            const a = document.createElement("a");
            a.download = "spotify_export.json";
            a.href = URL.createObjectURL(blob);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Cleanup DOM modifications
            document.body.style.pointerEvents = "";
            if (scrollbar) scrollbar.style.display = "";
            console.log(
              `[Spotify Exporter] Successfully exported ${finalResult.length} tracks.`,
            );
          }
        }
      }, 100);
    } else {
      console.error("[Spotify Exporter] No tracks found in the playlist.");
      document.body.style.pointerEvents = "";
    }
  }, 3000);
})();
