import { v4 as uuidv4 } from "uuid";
import { Room } from "./types";
const rooms: Record<string, Room> = {};

function generateRoomCode(length = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function createRoom(username: string, socketId: string): Room {
  let code: string;

  code = generateRoomCode();

  const room: Room = {
    id: uuidv4(),
    code,
    users: [{ id: socketId, username }],
    drawerIndex: 0,
  };

  rooms[room.id] = room;
  return room;
}

export function joinRoom(
  code: string,
  username: string,
  socketId: string
): Room | null {
  const room = Object.values(rooms).find(r => r.code === code);
  if (!room) return null;

  room.users.push({ id: socketId, username });
  return room;
}

export function removeUserFromRoom(
  socketId: string,
  roomCode?: string
): { room: Room; username: string } | null {
  let room: Room | null = null;
  
  if (roomCode) {
    room = getRoomByCode(roomCode);
  } else {
    // Search all rooms for the socket
    room = Object.values(rooms).find(r => 
      r.users.some(u => u.id === socketId)
    ) || null;
  }
  
  if (!room) return null;
  
  const user = room.users.find(u => u.id === socketId);
  if (!user) return null;
  
  room.users = room.users.filter(u => u.id !== socketId);
  
  // Delete room if empty
  if (room.users.length === 0) {
    delete rooms[room.id];
  }
  
  return { room, username: user.username };
}

export function getRoomByCode(code: string): Room | null {
  return Object.values(rooms).find(r => r.code === code) || null;
}