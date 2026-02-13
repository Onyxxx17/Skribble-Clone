export interface User {
  id: string;
  username: string;
  correctlyGuessed?: boolean;
}

export interface Room {
  id: string;      
  code: string;      
  users: User[];
  creator: User;
  drawerIndex: number;
  word?: string;
  messages: ChatMessage[];
  totalRounds?: number;
  currentRound?: number;
  gameState : GameState;
  roundDuration?: number;
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

type GameState = 'waiting' | 'playing' | 'round_end' | 'game_end';