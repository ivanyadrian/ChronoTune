import type { ReactNode } from "react";

export interface ToastMessage {
  message: string;
  type: "success" | "info" | "leave" | "error";
  icon?: ReactNode;
}

export interface GameMessage {
  text: string;
  isSuccess: boolean;
  pointsEarned?: number;
  bonusPoints?: number; // Added
}
