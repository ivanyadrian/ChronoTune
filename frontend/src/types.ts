export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  fullDate: string;
  deezerId: string;
  cover: string;
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
}