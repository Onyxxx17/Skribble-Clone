import { useEffect, useState } from 'react';
import './App.css'
import socket from './socket';
import Chat from './components/Chat';
import Canva from './components/Canva';
import GameSettings from './components/GameSettings';
import WordSelection from './components/WordSelection';
import PlayerHeader from './components/PlayerHeader';
import LobbyScreen from './components/LobbyScreen';
function App() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);
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

    socket.on("game_over", () => {
      alert("Game Over");
      setGameStarted(false);
    })

    socket.on("all_correct_guesses" , () => {
      alert("All Correct Guesses, going to next round");
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
        <PlayerHeader roomCode={roomCode} users={users} onLeaveRoom={leaveRoom} />

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
    <LobbyScreen
      username={username}
      joinRoomCode={joinRoomCode}
      error={error}
      connected={connected}
      onUsernameChange={setUsername}
      onJoinRoomCodeChange={(value) => setJoinRoomCode(value.toUpperCase())}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
    />
  );
}

export default App;
