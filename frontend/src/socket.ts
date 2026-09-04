import { io } from "socket.io-client";
import { API_BASE } from "./utils/apiUtils";

export const socket = io(API_BASE);
