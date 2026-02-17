import { User } from "../GameServer/User/user.js";

export type GameState = "waiting" | "playing" | "round_end" | "game_over";

export interface ChatMessage {
  id: string;
  user: User;
  message: string;
}

export interface Guess {
  user: User;
  isCorrectGuess: boolean;
}