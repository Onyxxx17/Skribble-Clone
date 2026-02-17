import { GameEngine } from "./gameEngine.js";
import { Room } from "./Rooms/room.js";
import { RoomManager } from "./Rooms/roomManager.js";
import { ChatMessage, Guess } from "../types/types.js";
import { User } from "./User/user.js";
import { Server } from "socket.io";

interface ChatResult {
  room: Room;
  user: User;
  chatMessage: ChatMessage;
  guess: Guess;
  isFirstCorrect: boolean;
}

export class GameManager {
  private activeTurnTimers = new Map<string, NodeJS.Timeout>();
  private activeDrawTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly roomManager: RoomManager,
    private readonly gameEngine: GameEngine,
    
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

  stopDrawTimer(roomCode: string) {
    const existingTimer = this.activeDrawTimers.get(roomCode);
    if (!existingTimer) return;
    clearTimeout(existingTimer);
    this.activeDrawTimers.delete(roomCode);
  }

  startDrawTimer(roomCode: string, durationMs: number, io: Server) {
    // Clear any existing timer for this room
    this.stopDrawTimer(roomCode);

    const timerId = setTimeout(() => {
      this.activeDrawTimers.delete(roomCode);
      console.log("Timer ended");
      this.advanceTurn(io, roomCode);
    }, durationMs);

    console.log("Timer started :" + durationMs);
    this.activeDrawTimers.set(roomCode, timerId);
  }

  setTurnTimer(socketId: string, timerId: NodeJS.Timeout) {
    this.activeTurnTimers.set(socketId, timerId);
  }

  clearTurnTimer(socketId: string) {
    const timerId = this.activeTurnTimers.get(socketId);
    if (timerId) {
      clearTimeout(timerId);
      this.activeTurnTimers.delete(socketId);
    }
  }

  advanceTurn(io: Server, roomCode: string) {
    const room = this.roomManager.getRoomByCode(roomCode);
    if (!room) return;

    this.stopDrawTimer(roomCode);

    console.log(`Advancing turn for room ${roomCode}, current drawer: ${room.users[room.drawerIndex].username}`);

    // Clear any choice timers for all users
    room.users.forEach(user => {
      const choiceTimer = this.activeTurnTimers.get(user.id);
      if (choiceTimer) {
        clearTimeout(choiceTimer);
        this.activeTurnTimers.delete(user.id);
      }
    });

    // Emit turn ended
    io.to(roomCode).emit("turn_ended");

    // Advance drawer index
    room.drawerIndex = (room.drawerIndex + 1) % room.users.length;
    console.log("Next drawer: " + room.users[room.drawerIndex].username);

    // Check if round is complete
    if (room.drawerIndex === 0 && room.currentRound && room.totalRounds) {
      room.currentRound += 1;
      if (room.currentRound > room.totalRounds) {
        room.gameState = "game_over";
        io.to(roomCode).emit("game_over");
        return;
      }
    }

    // Clear word and reset guesses for next turn
    room.word = undefined;
    room.resetGuesses();

    // Emit is_drawer to all users with new drawer
    const newDrawer = room.users[room.drawerIndex];
    room.users.forEach((user) => {
      console.log(`Sending is_drawer=${user.id === newDrawer.id} to ${user.username}`);
      io.to(user.id).emit("is_drawer", user.id === newDrawer.id);
    });
  }
}
