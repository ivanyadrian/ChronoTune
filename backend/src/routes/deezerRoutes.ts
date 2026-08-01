import { Router } from "express";

const router = Router();

/**
 * DEEZER PROXY ENDPOINT
 * Browsers often block direct API calls from the frontend due to CORS.
 * This server-side proxy intercepts the request,
 * fetches the data from Deezer, and forwards it to the client.
 */
router.get("/:trackId", async (req, res) => {
  const { trackId } = req.params;

  if (!/^\d+$/.test(trackId)) {
    return res.status(400).json({ error: "Érvénytelen track ID formátum" });
  }

  try {
    const response = await fetch(`https://api.deezer.com/track/${trackId}`);

    if (!response.ok) {
      console.error(
        `Deezer API hiba: ${response.status} - ${response.statusText}`,
      );
      return res.status(response.status).json({
        error: "Deezer API hiba",
        status: response.status,
      });
    }

    let data = await response.json();

    // If Deezer track data is missing preview URL or returned an error,
    // perform an automatic fallback search by artist and track title to find a working release.
    if (!data.preview && data.title && data.artist?.name) {
      console.warn(
        `[Deezer Proxy] Missing preview for track ID ${trackId} ("${data.artist.name} - ${data.title}"). Attempting fallback search...`,
      );

      const cleanArtist = data.artist.name.split(",")[0].trim();
      const cleanTitle = data.title.replace(/\(.*?\)|\[.*?\]/g, "").trim();
      const query = `artist:"${cleanArtist}" track:"${cleanTitle}"`;
      const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;

      try {
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.data && searchData.data.length > 0) {
          const matchWithPreview = searchData.data.find(
            (item: any) => item.preview && item.preview.length > 0,
          );

          if (matchWithPreview) {
            console.log(
              `[Deezer Proxy Fallback] Successfully found fresh preview URL for "${cleanArtist} - ${cleanTitle}" (New ID: ${matchWithPreview.id})`,
            );
            data.preview = matchWithPreview.preview;
          }
        }
      } catch (fallbackError) {
        console.error("[Deezer Proxy Fallback] Search failed:", fallbackError);
      }
    }

    res.json(data);
  } catch (error) {
    console.error("Proxy hiba:", error);
    res.status(500).json({ error: "Nem sikerült elérni a Deezert" });
  }
});

export default router;
