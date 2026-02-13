import { Room } from "./room.js";
import { User } from "../User/user.js";

function generateRoomCode(length = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export class RoomManager {
  private roomsByCode = new Map<string, Room>();

  createRoom(username: string, socketId: string): Room {
    const code = this.generateUniqueCode();
    const creator = new User(socketId, username);
    const room = new Room(code, creator);
    this.roomsByCode.set(room.code, room);
    return room;
  }

  joinRoom(code: string, username: string, socketId: string): Room | null {
    const room = this.roomsByCode.get(code);
    if (!room) return null;
    const user = new User(socketId, username);
    room.addUser(user);
    return room;
  }

  removeUserFromRoom(socketId: string, roomCode?: string): { room: Room; user: User } | null {
    const room = roomCode ? this.roomsByCode.get(roomCode) : this.findRoomByUser(socketId);
    if (!room) return null;
    const user = room.removeUser(socketId);
    if (!user) return null;
    if (room.isEmpty()) {
      this.deleteRoom(room);
    }
    return { room, user };
  }

  getRoomByCode(code: string): Room | null {
    return this.roomsByCode.get(code) || null;
  }

  findUserBySocketIdAndRoom(socketId: string, roomCode?: string): User | null {
    const room = roomCode ? this.roomsByCode.get(roomCode) : this.findRoomByUser(socketId);
    if (!room) return null;
    return room.findUser(socketId);
  }

  private generateUniqueCode(length = 5): string {
    let code = generateRoomCode(length);
    while (this.roomsByCode.has(code)) {
      code = generateRoomCode(length);
    }
    return code;
  }

  private findRoomByUser(socketId: string): Room | null {
    for (const room of this.roomsByCode.values()) {
      if (room.findUser(socketId)) {
        return room;
      }
    }
    return null;
  }

  private deleteRoom(room: Room): void {
    this.roomsByCode.delete(room.code);
  }
}
