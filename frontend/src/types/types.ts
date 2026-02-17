export interface User {
  id: string;
  username: string;
  score?: number;
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

// Drawing/Canvas types
export interface Line {
  tool: string;
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface PopupMessage {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export type ToolType = "pen" | "eraser";

export type DrawingColor = "#000000" | "#FFFFFF" | "#EF4444" | "#F59E0B" | "#FBBF24" | "#10B981" | "#06B6D4" | "#3B82F6" | "#8B5CF6" | "#EC4899" | "#92400E" | "#6B7280";
export type StrokeWidth = 2 | 5 | 10 | 15 | 20;