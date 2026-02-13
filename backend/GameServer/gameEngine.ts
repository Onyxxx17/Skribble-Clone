import { v4 as uuidv4 } from "uuid";
import { Room } from "./Rooms/room.js";
import { RoomManager } from "./Rooms/roomManager.js";
import { ChatMessage, Guess } from "../types/types.js";
import { User } from "./User/user.js";

export class GameEngine {
  constructor(private readonly roomManager: RoomManager) {}

  createChatMessage(socketId: string, roomCode: string, message: string): { room: Room; user: User; chatMessage: ChatMessage } {
    const room = this.roomManager.getRoomByCode(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    const user = room.findUser(socketId);
    if (!user) {
      throw new Error("User not found");
    }

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      user,
      message,
    };

    return { room, user, chatMessage };
  }

  createGuess(room: Room, user: User, guess: string): Guess {
    if (!room.word) {
      throw new Error("No word found");
    }

    const isCorrectGuess = room.word.toUpperCase() === guess.trim().toUpperCase();
    return { user, isCorrectGuess };
  }

  startGame(roomCode: string, totalRounds: number, roundTime: number): { room: Room; currentDrawer: User } {
    const room = this.roomManager.getRoomByCode(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    room.totalRounds = totalRounds;
    room.roundDuration = roundTime * 1000;
    room.currentRound = 1;
    room.gameState = "playing";
    room.drawerIndex = this.pickDrawerIndex(room);
    room.resetGuesses();

    const currentDrawer = room.users[room.drawerIndex];
    return { room, currentDrawer };
  }

  private pickDrawerIndex(room: Room): number {
    return Math.floor(Math.random() * room.users.length);
  }
}
