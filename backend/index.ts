import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { GameEngine } from "./GameServer/gameEngine.js";
import { GameManager } from "./GameServer/gameManager.js";
import { RoomManager } from "./GameServer/Rooms/roomManager.js";
import { Room } from "./GameServer/Rooms/room.js";
import { error } from "console";

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
const activeTurnTimers = new Map();
const activeDrawTimers = new Map();

app.get('/', (_req, res) => {
  res.send('Hello world');
});

// Helper function to start drawing phase timer
function startDrawTimer(roomCode: string, durationMs: number) {
  // Clear any existing timer for this room
  const existingTimer = activeDrawTimers.get(roomCode);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timerId = setTimeout(() => {
    activeDrawTimers.delete(roomCode);
    console.log("Timer ended")
    advanceTurn(roomCode);
  }, durationMs);

  console.log("Timer started :" + durationMs);

  activeDrawTimers.set(roomCode, timerId);
}

// Helper function to advance to next turn
function advanceTurn(roomCode: string) {
  const room = gameManager.getRoomByCode(roomCode);
  if (!room) return;

  console.log(`Advancing turn for room ${roomCode}, current drawer: ${room.users[room.drawerIndex].username}`);

  // Clear anyg choice timers for all users
  room.users.forEach(user => {
    const choiceTimer = activeTurnTimers.get(user.id);
    if (choiceTimer) {
      clearTimeout(choiceTimer);
      activeTurnTimers.delete(user.id);
    }
  });

  // Emit turn ended
  io.to(roomCode).emit("turn_ended");

  // Advance drawer index
  room.drawerIndex = (room.drawerIndex + 1) % room.users.length;
  console.log("Next drawer: " + room.users[room.drawerIndex].username);

  // Check if round is complete
  if (room.drawerIndex === 0 && room.currentRound && room.totalRounds) {
    room.currentRound += 1;
    if (room.currentRound > room.totalRounds) {
      io.to(roomCode).emit("game_over");
      return;
    }
  }

  // Clear word and reset guesses for next turn
  room.word = undefined;
  room.resetGuesses();

  // Emit is_drawer to all users with new drawer
  const newDrawer = room.users[room.drawerIndex];
  room.users.forEach((user) => {
    console.log(`Sending is_drawer=${user.id === newDrawer.id} to ${user.username}`);
    io.to(user.id).emit("is_drawer", user.id === newDrawer.id);
  });
}

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

    socket.emit("room_joined", {
      code: roomCode,
      users: room.users.map(u => u.username)
    })
    socket.to(room.code).emit("user_joined", username);
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
      }

      if (guess.isCorrectGuess || user.correctlyGuessed) {
        socket.emit("message_sent", chatMessage);
      } else {
        io.to(roomCode).emit("message_sent", chatMessage);
      }

      if (roomManager.allCorrectGuesses(room)) {
        activeDrawTimers.delete(roomCode);
        io.to(roomCode).emit("all_correct_guesses");
        advanceTurn(roomCode);
      }
    } catch (error) {
      socket.emit("error", (error as Error).message);
    }
  });

  socket.on("start_game", ({ roomCode, totalRounds, roundTime }) => {
    try {
      const { room, currentDrawer } = gameManager.startGame(roomCode, totalRounds, roundTime);

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

    const wordChoices: Array<string> = ['Banana', 'Apple', 'Cherry'];

    socket.emit("turn_started", {
      wordChoices
    })

    const timerId = setTimeout(() => {
      console.log(`Auto-selecting word for ${socket.id}`);
      activeTurnTimers.delete(socket.id);

      const room: Room | null = gameManager.getRoomByCode(roomCode);
      if (!room) {
        return socket.emit("error", { message: "Room not found" });
      }

      const word: string = wordChoices[Math.floor(Math.random() * wordChoices.length)];
      room?.setWord(word);
      socket.emit("word_finalized", {
        word
      })

      // Start drawing timer
      const drawDuration = room.roundDuration || 60000;
      startDrawTimer(roomCode, drawDuration);
    }, 15000);

    activeTurnTimers.set(socket.id, timerId);
  })

  socket.on("word_chosen", ({ word, roomCode }) => {
    console.log(`word_chosen received: ${word} from ${socket.id} for room ${roomCode}`);

    const timerId = activeTurnTimers.get(socket.id);

    if (timerId) {
      clearTimeout(timerId);
      activeTurnTimers.delete(socket.id);
      console.log("Choice timer cleared. Word chosen:", word);
    }

    // Save / broadcast the chosen word
    const room: Room | null = gameManager.getRoomByCode(roomCode);
    if (!room) {
      return socket.emit("error", { message: "Room not found" });
    }
    room?.setWord(word);
    socket.emit("word_finalized", { word });

    // Start 60-second drawing timer
    const drawDuration = room.roundDuration || 60000;
    console.log(`Starting draw timer for ${drawDuration}ms`);
    startDrawTimer(roomCode, drawDuration);
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
