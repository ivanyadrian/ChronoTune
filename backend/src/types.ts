export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  youtubeId?: string;
  rawTitle?: string;
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
}

export interface Room {
  players: Player[];
  deck: Song[];
  gameStarted: boolean;
  turnIndex: number;
  turnLocked: boolean;
  activeCard?: Song;
  targetLength: number;
}