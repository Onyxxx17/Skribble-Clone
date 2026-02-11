import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRoom, joinRoom, removeUserFromRoom } from "./rooms";
import { Room } from "./types";
import { createMessage } from "./messages";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

app.get('/', (_req, res) => {
  res.send('Hello world');
});

//Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('create_room', ({username})=>{
    const room : Room = createRoom(username,socket.id);
    socket.join(room.code);
    socket.emit('room_created', {
      room,  
      username
    });
  })

  socket.on("join_room", ({ roomCode, username }) => {
    const room = joinRoom(roomCode, username, socket.id);
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }
    socket.join(room.code);

    socket.emit("room_joined", {
      code:roomCode,
      users: room.users.map(u=> u.username)
    })
    socket.to(room.code).emit("user_joined", username);
  });

  socket.on("leave_room", (roomCode : string) => {
    const result = removeUserFromRoom(socket.id, roomCode);
    if (result) {
      socket.leave(result.room.code);
      console.log(`${result.username} left ${result.room.code}`);
      socket.to(result.room.code).emit("user_left", result.username);
    }
  });

  socket.on("send_message", ({ message, username, roomCode }) => {
    const chatMessage = createMessage(message, username, roomCode);
    socket.to(roomCode).emit("message_sent", chatMessage);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const result = removeUserFromRoom(socket.id);
    if (result) {
      console.log(`${result.username} disconnected from ${result.room.code}`);
      socket.to(result.room.code).emit("user_left", result.username);
    }
  });
});


server.listen(3001, () => {
    console.log("Server started on port 3001");
});
