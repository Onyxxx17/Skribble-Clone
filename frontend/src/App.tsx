import { useEffect, useState } from 'react';
import './App.css'
import socket from './socket';
import Chat from './components/Chat';
import Canva from './components/Canva';
import GameSettings from './components/GameSettings';
import WordSelection from './components/WordSelection';
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
  const [currentWord, setCurrentWord] = useState("");

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
      console.log('is_drawer event received:', isDrawer);
      setIsDrawer(isDrawer);
      if (!isDrawer) {
        setCurrentWord("");
      }
    });

    socket.on('word_finalized', ({ word }: { word: string }) => {
      console.log('Word finalized event received:', word);
      setCurrentWord(word);
    });

    socket.on("turn_ended", ()=> {
      setCurrentWord("");
    })

    socket.on('error', (message: string) => {
      setError(message);
    });
    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  // Trigger start_turn when drawer changes
  useEffect(() => {
    if (isDrawer && gameStarted && roomCode) {
      console.log('Drawer changed, emitting start_turn. Current word:', currentWord);
      socket.emit('start_turn', isDrawer, roomCode);
    }
  }, [isDrawer, gameStarted, roomCode]);

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
        <div className="bg-[#1e293b] border-2 border-[#06b6d4] rounded-lg p-6 mb-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#ec4899] mb-2">Room: {roomCode}</h1>
              <p className="text-[#cbd5e1] text-sm">Share this code with others to join!</p>
            </div>
            <button
              onClick={leaveRoom}
              className="arcade-button bg-[#ec4899] text-white py-2 px-5 border-[#ec4899] hover:bg-[#db2777] text-sm"
            >
              Leave Room
            </button>
          </div>
          
          <div className="mt-4 bg-[#0f172a] border border-[#06b6d4] rounded-lg p-4">
            <p className="text-[#10b981] mb-3 text-sm font-semibold">Players ({users.length})</p>
            <div className="flex flex-wrap gap-2">
              {users.map((user, index) => (
                <span key={index} className="bg-[#1e293b] border border-[#14b8a6] text-[#14b8a6] px-3 py-1.5 rounded-md text-sm font-medium">
                  ▸ {user}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Drawer Display */}
        {gameStarted && (
          <div className="bg-[#273c5f] border border-[#000000] rounded-lg p-4 mb-4 shadow-xl">
            <div className="text-center">
              <p className="text-sm text-[#fef3c7] mb-1 font-semibold">Current Artist</p>
              <p className="text-2xl font-bold text-white">🎨 {currentDrawer} 🎨 </p>
              {isDrawer && (
                <p className="text-sm mt-2 bg-[#10b981] text-white px-4 py-1.5 rounded-full inline-block font-semibold">That's you! Start drawing!</p>
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

        {/* Word Selection Modal */}
        <WordSelection roomCode={roomCode} isDrawer={isDrawer} />

        {/* Canvas and Chat Side by Side */}
        {gameStarted && (
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            {/* Canvas Section */}
            <div className="flex-1 lg:w-2/3">
              {(() => {
                console.log('Render check - isDrawer:', isDrawer, 'currentWord:', currentWord);
                return isDrawer && currentWord && (
                  <div className="bg-[#10b981] border-2 border-[#059669] rounded-lg p-4 mb-4 shadow-xl">
                    <div className="text-center">
                      <p className="text-sm text-white mb-1 font-semibold">Your Word</p>
                      <p className="text-3xl font-bold text-white tracking-wider">{currentWord}</p>
                    </div>
                  </div>
                );
              })()}
                <Canva isDrawer={isDrawer} roomId={roomCode} />
            </div>
            
            {/* Chat Section */}
            <div className="flex flex-col lg:w-1/3 min-h-125 lg:min-h-0">
              <div className="flex-1 flex flex-col bg-[#1e293b] border-2 border-[#06b6d4] rounded-lg overflow-hidden shadow-xl">
                <Chat roomId={roomCode} username={username} isDrawer={isDrawer} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border-2 border-[#8b5cf6] rounded-lg p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#06b6d4]">Sketch Battle</h1>
        
        {error && (
          <div className="bg-[#1e293b] border-2 border-[#f97316] text-[#f97316] px-4 py-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-[#06b6d4] mb-2 text-sm font-semibold">Your Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>

        <div className="mb-6">
          <button
            onClick={createRoom}
            className="w-full arcade-button bg-[#10b981] text-white py-3 px-6 border-[#10b981] hover:bg-[#059669] text-sm"
          >
            Create New Room
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#334155]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[#1e293b] text-[#cbd5e1]">OR</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[#ec4899] mb-2 text-sm font-semibold">Join Room</label>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full mb-3"
            maxLength={5}
          />
          <button
            onClick={joinRoom}
            className="w-full arcade-button bg-[#06b6d4] text-white py-3 px-6 border-[#06b6d4] hover:bg-[#0891b2] text-sm"
          >
            Join Game
          </button>
        </div>

        <div className="text-center mt-6 text-sm">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-[#10b981]' : 'bg-[#f97316] blink'}`}></span>
          <span className="text-[#cbd5e1]">{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
