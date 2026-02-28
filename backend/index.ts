import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { GameEngine } from "./GameServer/gameEngine.js";
import { GameManager } from "./GameServer/gameManager.js";
import { RoomManager } from "./GameServer/Rooms/roomManager.js";
import { Room } from "./GameServer/Rooms/room.js";
import { pickRandomWords } from "./GameServer/words.js";
import 'dotenv/config';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  },
  path: "/socket"
});

app.use(cors());

const roomManager = new RoomManager();
const gameEngine = new GameEngine(roomManager);
const gameManager = new GameManager(roomManager, gameEngine);

app.get('/', (_req, res) => {
  res.send('Hello world');
});

app.get('/health', (req, res) => res.sendStatus(200));
//Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('create_room', ({ username }) => {
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

    const newUser = room.findUser(socket.id);

    socket.emit("room_joined", {
      code: roomCode,
      username: newUser?.username,
      users: room.users.map(u => ({ id: u.id, username: u.username, score: u.score }))
    })
    
    socket.to(room.code).emit("user_joined", newUser);
  });

  socket.on("leave_room", (roomCode: string) => {
    const result = gameManager.leaveRoom(socket.id, roomCode);
    if (result) {
      socket.leave(result.room.code);
      console.log(`${result.user.username} left ${result.room.code}`);
      socket.to(result.room.code).emit("user_left", result.user.username);
    }
  });

  socket.on("send_message", ({ username, roomCode, message }) => {
    try {
      const { chatMessage, guess, user, room, isFirstCorrect } = gameManager.handleChatMessage(socket.id, roomCode, message);

      if (guess.isCorrectGuess && isFirstCorrect) {
        io.to(roomCode).emit("guess", guess);
        user.score += gameEngine.calculateScore(roomCode,socket.id,gameManager.getTimeElapsed(roomCode));
        io.to(roomCode).emit("score_updated", user);
        console.log(user.username + " gets " + user.score + " points");
        
        // Give drawer 400 points for each correct guess
        const drawer = room.users[room.drawerIndex];
        drawer.score += 400;
        io.to(roomCode).emit("score_updated", drawer);
        console.log(drawer.username + " (drawer) gets 400 points");
      }

      if (guess.isCorrectGuess || user.correctlyGuessed) {
        socket.emit("message_sent", chatMessage);
      } else {
        io.to(roomCode).emit("message_sent", chatMessage);
      }

      if (roomManager.allCorrectGuesses(room)) {
        gameManager.stopDrawTimer(roomCode);
        io.to(roomCode).emit("all_correct_guesses");
        gameManager.advanceTurn(io, roomCode);
      }
    } catch (error) {
      socket.emit("error", (error as Error).message);
    }
  });

  socket.on("start_game", ({ roomCode, totalRounds, roundTime, category }) => {
    try {
      const { room, currentDrawer } = gameManager.startGame(roomCode, totalRounds, roundTime, category ?? "Random");

      if (!roomManager.enoughPlayers(room)) {
        socket.emit("start_error", "Not enough players");
        return;
      }
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

  socket.on("start_turn", (drawer, roomCode) => {
    console.log(`start_turn received from socket ${socket.id} for room ${roomCode}`);

    const room: Room | null = gameManager.getRoomByCode(roomCode);
    const category = room?.category ?? "Random";
    const wordChoices: Array<string> = pickRandomWords(category, 3);

    socket.emit("turn_started", {
      wordChoices
    })

    const timerId = setTimeout(() => {
      console.log(`Auto-selecting word for ${socket.id}`);
      gameManager.clearTurnTimer(socket.id);

      const currentRoom: Room | null = gameManager.getRoomByCode(roomCode);
      if (!currentRoom) {
        return socket.emit("error", { message: "Room not found" });
      }

      const word: string = wordChoices[Math.floor(Math.random() * wordChoices.length)];
      currentRoom?.setWord(word);
      socket.emit("word_finalized", {
        word
      })

      // Start drawing timer
      const drawDuration = currentRoom.roundDuration || 60000;
      gameManager.startDrawTimer(roomCode, drawDuration, io);
    }, 15000);

    gameManager.setTurnTimer(socket.id, timerId);
  })

  socket.on("word_chosen", ({ word, roomCode }) => {
    console.log(`word_chosen received: ${word} from ${socket.id} for room ${roomCode}`);

    gameManager.clearTurnTimer(socket.id);
    console.log("Choice timer cleared. Word chosen:", word);

    // Save / broadcast the chosen word
    const room: Room | null = gameManager.getRoomByCode(roomCode);
    if (!room) {
      return socket.emit("error", { message: "Room not found" });
    }
    room?.setWord(word);
    socket.emit("word_finalized", { word });

    // Start drawing timer
    const drawDuration = room.roundDuration || 60000;
    console.log(`Starting draw timer for ${drawDuration}ms`);
    gameManager.startDrawTimer(roomCode, drawDuration, io);
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

    if (result?.room?.users.length == 1 ){
      gameManager.gameOver(result.room, io)
    }
  });
});


server.listen(3001, "0.0.0.0", () => {
  console.log("Server started on port 3001");
});
