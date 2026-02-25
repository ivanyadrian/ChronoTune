export interface Song {
  id: number;
  deezerId: string;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  fullDate: string;
  cover: string;
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
  mistakes: number; 
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