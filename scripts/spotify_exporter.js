document.querySelector("main").scrollTo(0,0);
result = [];
console.log("Indítás 3 másodpercen belül... Ne nyúlj az ablakhoz!");
document.body.style.pointerEvents = "none";

// Eltüntetjük a görgetősávot, hogy ne zavarjon
const scrollbar = document.querySelector(".main-view-container div.os-scrollbar.os-scrollbar-vertical");
if (scrollbar) scrollbar.style.display = "none";

setTimeout(() => {
  const listElement = document.querySelector("[data-testid$='list']:not([data-testid='recommended-track'] *):not(svg)");
  if (!listElement) {
    console.log("Nem találom a listát! Győződj meg róla, hogy a lejátszási listán belül vagy.");
    document.body.style.pointerEvents = "";
    return;
  }

  totalRows = parseInt(listElement.getAttribute("aria-rowcount"));

  if (totalRows > 0) {
    intervalId = setInterval(() => {
      const rows = document.querySelectorAll("[data-testid$='list']:not([data-testid='recommended-track'] *) > div:nth-of-type(2) [role='row']");
      const lastRow = rows[rows.length - 1];
      const firstRow = rows[0];

      if (lastRow != null && firstRow != null) {
        lastRowNr = parseInt(lastRow.getAttribute("aria-rowindex"));
        
        // Csak akkor dolgozunk, ha új sorokat látunk a memóriában
        rows.forEach(row => {
          const index = parseInt(row.getAttribute("aria-rowindex")) - 2;
          if (index >= 0 && !result[index]) {
            
            // Cím kinyerése
            const titleEl = row.querySelector("div[dir='auto']");
            // Előadók kinyerése (vesszővel elválasztva)
            const artistEls = row.querySelectorAll("span.standalone-ellipsis-one-line a[href*='/artist/']");
            const artists = Array.from(artistEls).map(a => a.textContent).join(", ");

            if (titleEl && artists) {
              console.log(`Dal mentése: ${index + 1}/${totalRows - 1} -> ${artists}: ${titleEl.textContent}`);
              result[index] = {
                title: titleEl.textContent.trim(),
                artist: artists.trim()
              };
            }
          }
        });

        lastRow.scrollIntoView();

        // Ha elértük az utolsó indexet
        if (lastRowNr >= totalRows) {
          clearInterval(intervalId);
          
          // Lyukak eltüntetése (ha a görgetés átugrott volna valamit)
          const finalResult = result.filter(item => item !== undefined);
          
          console.log("Kész! Fájl generálása...", finalResult);
          
          const blob = new Blob([JSON.stringify(finalResult, null, 2)], { type: "application/json" });
          const a = document.createElement('a');
          a.download = "spotify_export.json";
          a.href = URL.createObjectURL(blob);
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Takarítás
          document.body.style.pointerEvents = "";
          if (scrollbar) scrollbar.style.display = "";
          console.log(`Sikeresen exportálva: ${finalResult.length} dal.`);
        }
      }
    }, 100); // 100ms-onkénti ellenőrzés a stabilitásért
  } else {
    console.log("Nem találhatóak dalok!");
    document.body.style.pointerEvents = "";
  }
}, 3000);