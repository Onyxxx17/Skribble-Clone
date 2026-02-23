import { v4 as uuidv4 } from "uuid";
import { ChatMessage, GameState } from "../../types/types.js";
import { User } from "../User/user.js";

export class Room {
  readonly id: string;
  readonly code: string;
  users: User[];
  creator: User;
  drawerIndex: number;
  word?: string;
  messages: ChatMessage[];
  totalRounds?: number;
  currentRound?: number;
  gameState: GameState;
  roundDuration?: number;
  category?: string;

  constructor(code: string, creator: User) {
    this.id = uuidv4();
    this.code = code;
    this.users = [creator];
    this.creator = creator;
    this.drawerIndex = 0;
    this.messages = [];
    this.gameState = "waiting";
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  removeUser(socketId: string): User | null {
    const index = this.users.findIndex(u => u.id === socketId);
    if (index === -1) return null;
    const [removed] = this.users.splice(index, 1);
    return removed;
  }

  findUser(socketId: string): User | null {
    return this.users.find(u => u.id === socketId) || null;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  isEmpty(): boolean {
    return this.users.length === 0;
  }

  setWord(word: string): void {
    this.word = word;
  }

  resetGuesses(): void {
    this.users.forEach(user => {
      user.correctlyGuessed = false;
    });
  }
}