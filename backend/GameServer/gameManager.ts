import { GameEngine } from "./gameEngine.js";
import { Room } from "./Rooms/room.js";
import { RoomManager } from "./Rooms/roomManager.js";
import { ChatMessage, Guess } from "../types/types.js";
import { User } from "./User/user.js";

interface ChatResult {
  room: Room;
  user: User;
  chatMessage: ChatMessage;
  guess: Guess;
  isFirstCorrect: boolean;
}

export class GameManager {
  constructor(
    private readonly roomManager: RoomManager,
    private readonly gameEngine: GameEngine
  ) {}

  createRoom(username: string, socketId: string): Room {
    return this.roomManager.createRoom(username, socketId);
  }

  joinRoom(code: string, username: string, socketId: string): Room | null {
    return this.roomManager.joinRoom(code, username, socketId);
  }

  leaveRoom(socketId: string, roomCode?: string): { room: Room; user: User } | null {
    return this.roomManager.removeUserFromRoom(socketId, roomCode);
  }

  getRoomByCode(code: string): Room | null {
    return this.roomManager.getRoomByCode(code);
  }

  handleChatMessage(socketId: string, roomCode: string, message: string): ChatResult {
    const { room, user, chatMessage } = this.gameEngine.createChatMessage(socketId, roomCode, message);
    room.addMessage(chatMessage);

    const wasCorrect = user.correctlyGuessed;
    const guess = this.gameEngine.createGuess(room, user, message);

    let isFirstCorrect = false;
    if (guess.isCorrectGuess && !wasCorrect) {
      user.correctlyGuessed = true;
      isFirstCorrect = true;
    }

    return { room, user, chatMessage, guess, isFirstCorrect };
  }

  startGame(roomCode: string, totalRounds: number, roundTime: number): { room: Room; currentDrawer: User } {
    return this.gameEngine.startGame(roomCode, totalRounds, roundTime);
  }
}
