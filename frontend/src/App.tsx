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
      <div className="min-h-screen bg-gray-100 flex flex-col p-4">
        {/* Top Section - Room Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-600 mb-2">Room: {roomCode}</h1>
              <p className="text-gray-600 text-sm">Share this code with others to join!</p>
            </div>
            <button
              onClick={leaveRoom}
              className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Leave Room
            </button>
          </div>
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 font-semibold mb-2">Players ({users.length}):</p>
            <div className="flex flex-wrap gap-2">
              {users.map((user, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  👤 {user}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Game Settings - Only for Creator */}
        {isCreator && (
          <GameSettings
            totalRounds={totalRounds}
            setTotalRounds={setTotalRounds}
            roundTime={roundTime}
            setRoundTime={setRoundTime}
            numPlayers={users.length}
            onStartGame={startGame}
          />
        )}

        <Canva/>
        {/* Bottom Section - Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <Chat roomId={roomCode} username={username} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Skribble Clone</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          >
            Create New Room
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Join Room</label>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
            maxLength={5}
          />
          <button
            onClick={joinRoom}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
          >
            Join Room
          </button>
        </div>

        <div className="text-center mt-4">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
