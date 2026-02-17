// backend/src/data/songs.ts
import { Song } from "../types.js";

// Kiterjesztjük a Song típust, hogy kezelje a youtubeId-t
export interface YouTubeJSong extends Song {
  youtubeId: string;
}

export const hungarianSongs: YouTubeJSong[] = [
  { id: "h1", title: "Reptér", artist: "Korda György", year: 1981, youtubeId: "wDQ6pU5re-0" },
  { id: "h2", title: "Az éjjel soha nem érhet véget", artist: "Soho Party", year: 1998, youtubeId: "H49RAnhN9K8" },
  { id: "h3", title: "Gyöngyhajú lány", artist: "Omega", year: 1969, youtubeId: "CGt-rTDkMcM" },
  { id: "h4", title: "67-es út", artist: "Republic", year: 1994, youtubeId: "HE4aAQCghGs" },
];