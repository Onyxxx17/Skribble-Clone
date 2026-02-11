export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: string;      
  code: string;      
  users: User[];
  drawerIndex: number;
  word?: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  isCorrectGuess?: boolean;
}