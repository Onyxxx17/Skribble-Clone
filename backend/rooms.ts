import { v4 as uuidv4 } from "uuid";
import { Room, User } from "./types";
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
  let user: User = { id: socketId, username };
  const room: Room = {
    id: uuidv4(),
    code,
    users: [user],
    drawerIndex: 0,
    messages: [],
    gameState: "waiting",
    creator: user
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
  const room = getRoomByCode(roomCode || "");
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

export function findUserBySocketIdAndRoom(socketId: string, roomCode?: string): User | null {
  const room = getRoomByCode(roomCode || "");
  console.log(room);
  if (!room) return null;

  const user = room.users.find(u => u.id === socketId);
  console.log(user);

  return user || null;
}
export function findUserInRoom(room: Room, socketId: string): User | null {
  return room.users.find(u => u.id === socketId) || null;
}