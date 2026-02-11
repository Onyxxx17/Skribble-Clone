import { ChatMessage, Room } from "./types";
import { v4 as uuidv4 } from "uuid";
import { getRoomByCode } from "./rooms";
export function createMessage(message: string, username: string, roomCode: string): ChatMessage {

    const room = getRoomByCode(roomCode);

    if (room && room.word) {
        const isCorrectGuess = checkCorrectGuess(room.word, message);
        return {
            id: generateMessageId(),
            username,
            message,
            isCorrectGuess,
        };
    }
    
    return {
        id: generateMessageId(),
        username,
        message,
    };
}

function generateMessageId(): string {
    return uuidv4();
}

function checkCorrectGuess(word: string, guess: string): boolean {
    return word === guess;
}