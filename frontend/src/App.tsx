import { useEffect, useState } from 'react';
import './App.css'
import socket from './socket';
import Chat from './components/Chat';
import Canva from './components/Canva';
import GameSettings from './components/GameSettings';
function App() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isGuesser, setIsGuesser] = useState(true);
  const [totalRounds, setTotalRounds] = useState(1);
  const [roundTime, setRoundTime] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const [currentDrawer, setCurrentDrawer] = useState("");

  useEffect(() => {
    socket.connect();
    
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('room_created', (res: any) => {
      console.log("Room Created:", res);
      setRoomCode(res.room.code);
      setInRoom(true);
      setUsers(prev => [...prev,res.username]);
      setIsCreator(true);
    });

    socket.on('room_joined', (room: any) => {
    console.log("Room Joined:", room);
    setRoomCode(room.code);
    setInRoom(true);
    setUsers(room.users);
    });

    socket.on('user_joined', (newUsername: string) => {
      console.log("User joined:", newUsername);
      setUsers(prev => [...prev, newUsername]);
    });

    socket.on('user_left', (leftUsername: string) => {
      console.log("User left:", leftUsername);
      alert(`${leftUsername} left the room`);
      setUsers(prev => prev.filter(u => u !== leftUsername));
    });

    socket.on('game_started', (gameSettings: any) => {
      setTotalRounds(gameSettings.totalRounds);
      setRoundTime(gameSettings.roundDuration / 1000);
      setGameStarted(true);
      setCurrentDrawer(gameSettings.currentDrawer);
    });

    socket.on('is_drawer', (isDrawer: boolean) => {
      setIsDrawer(isDrawer);
    });

    socket.on('error', (message: string) => {
      setError(message);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  function createRoom() {
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");
    socket.emit('create_room', { username });
  }

  function joinRoom() {
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!joinRoomCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    setError("");
    socket.emit('join_room', { roomCode: joinRoomCode.toUpperCase(), username });
  }

  function leaveRoom() {
    socket.emit('leave_room', roomCode);
    setInRoom(false);
    setRoomCode("");
    setUsers([]);
    setJoinRoomCode("");
    setIsCreator(false);
  }

  function startGame() {
    socket.emit('start_game', { 
      roomCode, 
      totalRounds, 
      roundTime 
    });
  }

  if (inRoom) {
    return (
      <div className="min-h-screen flex flex-col p-4">
        {/* Top Section - Room Info */}
        <div className="bg-[#16213e] border-4 border-[#4cc9f0] pixel-corners p-6 mb-4 shadow-[0_0_30px_rgba(76,201,240,0.2)]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-[#e94b9e] mb-3 retro-glow" style={{fontSize: '1.2rem'}}>ROOM: {roomCode}</h1>
              <p className="text-[#a5b4fc] text-[0.6rem] uppercase tracking-wider">▶ SHARE CODE TO JOIN ◀</p>
            </div>
            <button
              onClick={leaveRoom}
              className="arcade-button bg-[#e94b9e] text-white py-3 px-6 border-[#e94b9e] hover:bg-[#d63384] text-[0.65rem]"
            >
              EXIT
            </button>
          </div>
          
          <div className="mt-4 bg-[#2d1b4e] border-2 border-[#4cc9f0] p-4">
            <p className="text-[#06ffa5] mb-3 text-[0.7rem] uppercase tracking-wide">◆ PLAYERS [{users.length}] ◆</p>
            <div className="flex flex-wrap gap-2">
              {users.map((user, index) => (
                <span key={index} className="bg-[#1a0b2e] border-2 border-[#4ea8af] text-[#4ea8af] px-3 py-2 text-[0.6rem] uppercase">
                  ▸ {user}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Drawer Display */}
        {gameStarted && (
          <div className="bg-[#7b2cbf] border-4 border-[#f9c74f] p-4 mb-4 shadow-[0_0_30px_rgba(123,44,191,0.4)] coin-insert">
            <div className="text-center">
              <p className="text-[0.6rem] text-[#f9c74f] mb-2 uppercase tracking-widest">★ CURRENT ARTIST ★</p>
              <p className="text-xl text-white retro-glow" style={{fontSize: '1.5rem'}}>▼ {currentDrawer} ▼</p>
              {isDrawer && (
                <p className="text-[0.65rem] mt-3 bg-[#06ffa5] text-[#1a0b2e] px-4 py-2 inline-block border-2 border-[#1a0b2e] blink">YOU'RE UP! DRAW NOW!</p>
              )}
            </div>
          </div>
        )}


        {/* Game Settings - Only for Creator */}
        {isCreator && !gameStarted && (
          <GameSettings
            totalRounds={totalRounds}
            setTotalRounds={setTotalRounds}
            roundTime={roundTime}
            setRoundTime={setRoundTime}
            numPlayers={users.length}
            onStartGame={startGame}
          />
        )}

        {gameStarted && <Canva isDrawer={isDrawer} />}
        {/* Bottom Section - Chat */}
        <div className="flex-1 flex flex-col bg-[#16213e] border-4 border-[#4cc9f0] pixel-corners overflow-hidden shadow-[0_0_30px_rgba(76,201,240,0.2)]">
          <Chat roomId={roomCode} username={username} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#16213e] border-4 border-[#7b2cbf] pixel-corners p-8 max-w-md w-full shadow-[0_0_50px_rgba(123,44,191,0.3)] coin-insert">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#4cc9f0] retro-glow uppercase" style={{fontSize: '1.5rem', lineHeight: '1.8'}}>◆ SKETCH ◆<br/>BATTLE</h1>
        
        {error && (
          <div className="bg-[#2d1b4e] border-2 border-[#f3722c] text-[#f3722c] px-4 py-3 mb-4 text-[0.65rem] uppercase">
            ⚠ {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-[#4cc9f0] mb-3 text-[0.65rem] uppercase tracking-wider">▸ PLAYER NAME</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ENTER NAME"
            className="w-full"
          />
        </div>

        <div className="mb-6">
          <button
            onClick={createRoom}
            className="w-full arcade-button bg-[#06ffa5] text-[#1a0b2e] py-4 px-6 border-[#06ffa5] hover:bg-[#05e094] text-[0.7rem]"
          >
            ▶ CREATE ROOM
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#2d1b4e]"></div>
          </div>
          <div className="relative flex justify-center text-[0.6rem]">
            <span className="px-3 bg-[#16213e] text-[#a5b4fc]">◆ OR ◆</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[#e94b9e] mb-3 text-[0.65rem] uppercase tracking-wider">▸ JOIN ROOM</label>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            className="w-full mb-3"
            maxLength={5}
          />
          <button
            onClick={joinRoom}
            className="w-full arcade-button bg-[#4cc9f0] text-[#1a0b2e] py-4 px-6 border-[#4cc9f0] hover:bg-[#3bb8de] text-[0.7rem]"
          >
            ▶ JOIN GAME
          </button>
        </div>

        <div className="text-center mt-6 text-[0.6rem]">
          <span className={`inline-block w-2 h-2 mr-2 ${connected ? 'bg-[#06ffa5]' : 'bg-[#f3722c]'} ${connected ? '' : 'blink'}`}></span>
          <span className="text-[#a5b4fc] uppercase">{connected ? '● ONLINE' : '● OFFLINE'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
