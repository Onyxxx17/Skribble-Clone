# Skribble-Clone

A real-time multiplayer drawing and guessing game built with React, TypeScript, Socket.IO, and Express. Players take turns drawing while others race to guess the word!

## � Live Demo

**Play now at: [skribbl-clone.site](https://skribbl-clone.site)** (currently down since I stopped the AWS ECS task)

## �🎮 Features

- **Real-time Multiplayer** - Play with friends using room codes
- **Drawing Canvas** - Interactive canvas with color picker and brush tools
- **Live Chat** - Real-time messaging and guess submission
- **Smart Scoring System** 
  - Time-based points (100-1000) for correct guesses
  - 400 points per correct guess for the drawer
- **Game Settings** - Customizable rounds, time limits, and categories
- **Round Management** - Automatic turn progression and round tracking
- **Leaderboard** - Final scores display with game-over music
- **Word Selection** - Random word generation by category
- **Visual Feedback** - Popups for game events and player actions

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Socket.IO Client** - Real-time communication
- **Konva & React-Konva** - Canvas drawing

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **Socket.IO** - WebSocket communication
- **TypeScript** - Type safety
- **UUID** - Unique identifiers

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker (optional)

### Installation

#### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Skribble-Clone
```

2. Start with Docker Compose:
```bash
docker-compose up
```

3. Open your browser:
- Frontend: http://localhost
- Backend: http://localhost:3001

#### Option 2: Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Skribble-Clone
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Start the backend server:
```bash
cd backend
npm run dev
```

5. Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

6. Open your browser:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎯 How to Play

1. **Create or Join Room**
   - Enter your username
   - Create a new room or join with a room code

2. **Start Game**
   - Room creator configures:
     - Number of rounds
     - Time per round
     - Word category

3. **Drawing Turn**
   - Select one of three random words
   - Draw on the canvas
   - Earn 400 points for each player who guesses correctly

4. **Guessing Turn**
   - Type your guesses in the chat
   - Faster guesses = more points (100-1000)
   - Correct guesses appear as announcements

5. **Win**
   - Player with the highest score after all rounds wins!

## 📁 Project Structure

```
Skribble-Clone/
├── backend/
│   ├── GameServer/
│   │   ├── gameEngine.ts      # Game logic & scoring
│   │   ├── gameManager.ts     # Game state management
│   │   ├── words.ts            # Word lists by category
│   │   ├── Rooms/
│   │   │   ├── room.ts         # Room class
│   │   │   └── roomManager.ts  # Room operations
│   │   └── User/
│   │       └── user.ts         # User class
│   ├── index.ts                # Socket.IO event handlers
│   └── types/
│       └── types.ts            # TypeScript types
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canva.tsx       # Drawing canvas
│   │   │   ├── Chat.tsx        # Chat interface
│   │   │   ├── GameOverScreen.tsx
│   │   │   ├── GameSettings.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── LobbyScreen.tsx
│   │   │   ├── PlayerHeader.tsx
│   │   │   └── WordSelection.tsx
│   │   ├── App.tsx             # Main app & Socket.IO logic
│   │   └── socket.ts           # Socket.IO client setup
│   └── public/
│       └── game-over.wav       # Game over sound effect
│
└── docker-compose.yml          # Docker configuration
```

## 🎨 Game Categories

- Animals
- Food
- Objects
- Sports
- Nature
- Random (all categories)

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
CLIENT_URL=http://localhost:80
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 🤝 Contributing

Contributions are welcome ! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests


## 🎉 Acknowledgments

Inspired by Skribbl.io

---
