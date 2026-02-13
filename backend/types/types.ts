import { User } from "../GameServer/User/user.js";

export type GameState = "waiting" | "playing" | "round_end" | "game_end";

export interface ChatMessage {
  id: string;
  user: User;
  message: string;
}

export interface Guess {
  user: User;
  isCorrectGuess: boolean;
}