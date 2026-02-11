import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { createRoom, getRoomByCode, joinRoom, removeUserFromRoom } from "./rooms";
import { Room } from "./types";
import { addMessageToRoom, createGuess, createMessage } from "./messages";

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
    room.word = "WORD";
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

  socket.on("send_message", ({  username, roomCode, message}) => {
    
    let chatMessage;
    try {
       chatMessage = createMessage(socket.id, roomCode, message);
    } catch (error) {
      socket.emit("error", error);
      console.log(error);
      return;
    }
    
    const room = getRoomByCode(roomCode);
    if (!room) return;

    addMessageToRoom(room, chatMessage);

    let guess;
    try {
      guess = createGuess(socket.id, roomCode, message);
      io.to(roomCode).emit("guess", guess);
    } catch (error) {
      socket.emit("error", error);
    }

    if(guess?.isCorrectGuess){
      // Only sender sees their correct guess
      socket.emit("message_sent", chatMessage);
    } else{
      // Everyone sees incorrect guesses
      io.to(roomCode).emit("message_sent", chatMessage);
    }
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
