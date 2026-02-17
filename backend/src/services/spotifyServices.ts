import axios from 'axios';
import dotenv from 'dotenv';
import { Song } from '../types.js';
import { Buffer } from 'buffer';
import process from 'process';

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken(): Promise<string> {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'grant_type=client_credentials'
  };

  const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
  return response.data.access_token;
}

export async function getHungarianSongs(): Promise<Song[]> {
  try {
    const token = await getAccessToken();
    
    // Ez egy hivatalos Spotify lista: "Magyar Pop"
    // Később több ID-t is betehetünk ide
    const playlistId = '37i9dQZF1DX6L7Y9S0sK0f'; 

    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

    return response.data.items
      .filter((item: any) => item.track) // Csak olyat, aminek van hangmintája
      .map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists[0].name,
        year: parseInt(item.track.album.release_date.split('-')[0]),
        spotifyId: item.track.id,
        previewUrl: item.track.preview_url // Ez az MP3 link!
      }));
  } catch (error) {
    console.error("Spotify hiba:", error);
    return [];
  }
}