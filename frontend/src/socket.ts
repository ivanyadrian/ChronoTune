import { io } from "socket.io-client";
export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3001");

// // global variable to access the socket instance from anywhere in the application
// (window as any).socket = socket;