import { io } from "socket.io-client";
import { API_BASE } from "./utils/apiUtils";

export const socket = io(API_BASE);

// // global variable to access the socket instance from anywhere in the application
(window as any).socket = socket;