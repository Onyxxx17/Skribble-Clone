import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { createRoom, getRoomByCode, joinRoom, removeUserFromRoom, findUserBySocketIdAndRoom } from "./rooms";
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

    const user = findUserBySocketIdAndRoom(socket.id, roomCode);
    if(!user) return;
    let guess;
    try {
      guess = createGuess(socket.id, roomCode, message);
      
      // If correct guess, mark user as guessed and notify everyone
      if (guess.isCorrectGuess && !user.correctlyGuessed) {
        user.correctlyGuessed = true;
        io.to(roomCode).emit("guess", guess);
      }
    } catch (error) {
      socket.emit("error", error);
    }

    // Only the current message: if it's a correct guess or user already guessed, only sender sees it
    if(guess?.isCorrectGuess || user.correctlyGuessed){
      socket.emit("message_sent", chatMessage);
    } else{
      // Everyone sees incorrect guesses and regular messages
      io.to(roomCode).emit("message_sent", chatMessage);
    }
  });

  socket.on("start_game", ({ roomCode, totalRounds, roundTime }) => {
    const room = getRoomByCode(roomCode);
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    // Update room settings
    room.totalRounds = totalRounds;
    room.roundDuration = roundTime * 1000; // convert to milliseconds
    room.currentRound = 1;
    room.gameState = 'playing';

    console.log(`Game started in room ${roomCode}: ${totalRounds} rounds, ${roundTime}s each`);

    // Notify all players that game is starting
    io.to(roomCode).emit("game_started", {
      totalRounds,
      roundDuration: roundTime,
      currentRound: 1,
    });
  });

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
