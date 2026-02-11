export interface User {
  id: string;
  username: string;
  correctlyGuessed?: boolean;
}

export interface Room {
  id: string;      
  code: string;      
  users: User[];
  drawerIndex: number;
  word?: string;
  messages: ChatMessage[];
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