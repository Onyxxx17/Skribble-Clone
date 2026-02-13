import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { GameEngine } from "./GameServer/gameEngine.js";
import { GameManager } from "./GameServer/gameManager.js";
import { RoomManager } from "./GameServer/Rooms/roomManager.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const roomManager = new RoomManager();
const gameEngine = new GameEngine(roomManager);
const gameManager = new GameManager(roomManager, gameEngine);

app.get('/', (_req, res) => {
  res.send('Hello world');
});

//Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('create_room', ({username})=>{
    const room = gameManager.createRoom(username, socket.id);
    room.setWord("WORD");
    socket.join(room.code);
    socket.emit('room_created', {
      room,  
      username
    });
  })

  socket.on("join_room", ({ roomCode, username }) => {
    const room = gameManager.joinRoom(roomCode, username, socket.id);
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
    const result = gameManager.leaveRoom(socket.id, roomCode);
    if (result) {
      socket.leave(result.room.code);
      console.log(`${result.user.username} left ${result.room.code}`);
      socket.to(result.room.code).emit("user_left", result.user.username);
    }
  });

  socket.on("send_message", ({  username, roomCode, message}) => {
    try {
      const { chatMessage, guess, user, room, isFirstCorrect } = gameManager.handleChatMessage(socket.id, roomCode, message);

      if (guess.isCorrectGuess && isFirstCorrect) {
        io.to(roomCode).emit("guess", guess);
      }

      if (guess.isCorrectGuess || user.correctlyGuessed) {
        socket.emit("message_sent", chatMessage);
      } else {
        io.to(roomCode).emit("message_sent", chatMessage);
      }
    } catch (error) {
      socket.emit("error", (error as Error).message);
    }
  });

  socket.on("start_game", ({ roomCode, totalRounds, roundTime }) => {
    try {
      const { room, currentDrawer } = gameManager.startGame(roomCode, totalRounds, roundTime);

      room.users.forEach((user) => {
        const userSocket = io.sockets.sockets.get(user.id);
        if (userSocket) {
          userSocket.emit("is_drawer", user.id === currentDrawer.id);
        }
      });

      io.to(roomCode).emit("game_started", {
        totalRounds,
        roundDuration: roundTime,
        currentRound: room.currentRound,
        currentDrawer: currentDrawer.username,
      });
    } catch (error) {
      socket.emit("error", (error as Error).message);
    }
  });

  socket.on("send_line", ({ line, roomCode, newLine }) => {
    socket.to(roomCode).emit("receive_line", line, newLine);
  });

  socket.on("clear_canvas", ({ roomCode }) => {
    socket.to(roomCode).emit("clear_canvas");
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    const result = gameManager.leaveRoom(socket.id);
    if (result) {
      console.log(`${result.user.username} disconnected from ${result.room.code}`);
      socket.to(result.room.code).emit("user_left", result.user.username);
    }
  });
});


server.listen(3001, () => {
    console.log("Server started on port 3001");
});
