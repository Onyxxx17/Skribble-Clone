import { ChatMessage, Room } from "./types";
import { v4 as uuidv4 } from "uuid";
import { getRoomByCode } from "./rooms";
import { Guess } from "./types";
import { findUserBySocketIdAndRoom } from "./rooms";

export function addMessageToRoom(room: Room, message: ChatMessage): void {
    room.messages.push(message);
}
export function createMessage(socketId: string, roomCode: string, message: string): ChatMessage{
    const user = findUserBySocketIdAndRoom(socketId, roomCode);
    if (!user) {
        throw new Error("User not found");
    }

    return {
        id: generateMessageId(),
        user: user,
        message,
    };
}

export function createGuess(socketId: string, roomCode: string, guess: string): Guess {
    const user = findUserBySocketIdAndRoom(socketId, roomCode);
    if (!user) {
      throw new Error("User not found");
    }
  
    const room = getRoomByCode(roomCode);
    if(!room) {
      throw new Error("Room not found");
    }
    
    const word = room?.word;
    if(!word) {
      throw new Error("No word found");
    }

    const isCorrectGuess = checkCorrectGuess(word, guess);
  
    return {
      user: user,
      isCorrectGuess: isCorrectGuess,
    };
  }

function generateMessageId(): string {
    return uuidv4();
}

function checkCorrectGuess(word: string, guess: string): boolean {
    return word.toUpperCase() === guess.trim().toUpperCase();
}