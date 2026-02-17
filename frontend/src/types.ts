export interface Card {
  id: string;
  title: string;
  artist: string;
  year: number;
  youtubeId?: string;
  previewUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  timeline: Card[];
}