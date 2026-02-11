export interface User {
  id: string;
  username: string;
}

export interface ChatMessage {
  id: string;
  user: User;
  message: string;
}

export interface Guess {
  user: User;
  isCorrectGuess?: boolean;
}

// Combined type for displaying in the UI
export type DisplayMessage = 
  | { type: 'message'; data: ChatMessage }
  | { type: 'guess'; data: Guess };