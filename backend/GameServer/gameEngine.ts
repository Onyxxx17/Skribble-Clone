import { v4 as uuidv4 } from "uuid";
import { Room } from "./Rooms/room.js";
import { RoomManager } from "./Rooms/roomManager.js";
import { ChatMessage, Guess } from "../types/types.js";
import { User } from "./User/user.js";
export class GameEngine {
  constructor(private readonly roomManager: RoomManager) { }

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
    room.drawerIndex = 0;
    room.resetGuesses();

    const currentDrawer = room.users[room.drawerIndex];
    return { room, currentDrawer };
  }
  calculateScore(roomCode: string, socketId: string, timeElpased: number): number {
    const room = this.roomManager.getRoomByCode(roomCode);
    console.log(room);
    if (!room || !room.roundDuration) return 0;

    const user = room.findUser(socketId);
    console.log(user);
    if (!user) return 0;

    const reduceScorePerSecond = 900 / (room.roundDuration / 1000);

    const rawScore = 1000 - (timeElpased * reduceScorePerSecond);

    // Clamp between 100 and 1000
    console.log(rawScore);
    return Math.max(99, Math.min(1000, Math.ceil(rawScore)));
  }
}
