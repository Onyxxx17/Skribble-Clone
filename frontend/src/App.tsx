import { useEffect, useState } from 'react';
import './App.css'
import socket from './socket';
import Chat from './components/Chat';
import Canva from './components/Canva';
import GameSettings from './components/GameSettings';
import WordSelection from './components/WordSelection';
import PlayerHeader from './components/PlayerHeader';
import LobbyScreen from './components/LobbyScreen';
import GamePopup from './components/GamePopup';
import GameOverScreen from './components/GameOverScreen';
import type { User } from './types/types';

interface PopupMessage {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}
function App() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [totalRounds, setTotalRounds] = useState(1);
  const [roundTime, setRoundTime] = useState(60);
  const [category, setCategory] = useState("Random");
  const [gameStarted, setGameStarted] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const [currentDrawer, setCurrentDrawer] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [popupMessages, setPopupMessages] = useState<PopupMessage[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(1);
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);

  // Function to show popup messages
  const showPopupMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newMessage: PopupMessage = {
      id: messageIdCounter,
      message,
      type
    };
    setPopupMessages(prev => [...prev, newMessage]);
    setMessageIdCounter(prev => prev + 1);
  };

  // Function to remove expired popup messages
  const handleMessageExpire = (messageId: number) => {
    setPopupMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  useEffect(() => {
    socket.connect();
    
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('room_created', (res: any) => {
      console.log("Room Created:", res);
      setRoomCode(res.room.code);
      setInRoom(true);
      setUsers(res.room.users);
      setIsCreator(true);
    });

    socket.on('room_joined', (room: any) => {
    console.log("Room Joined:", room);
    setRoomCode(room.code);
    setInRoom(true);
    setUsers(room.users);
    if (room.username) setUsername(room.username);
    });

    socket.on('user_joined', (newUser: User) => {
      console.log("User joined:", newUser);
      setUsers(prev => [...prev, newUser]);
      showPopupMessage(`${newUser.username} joined the room!`, 'success');
    });

    socket.on('user_left', (leftUsername: string) => {
      console.log("User left:", leftUsername);
      showPopupMessage(`${leftUsername} left the room`, 'warning');
      setUsers(prev => prev.filter(u => u.username !== leftUsername));
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

    socket.on("game_over", () => {
      showPopupMessage("Game Over!", 'info');
      setGameStarted(false);
      setIsDrawer(false);
      setCurrentDrawer("");
      setCurrentWord("");

      setShowGameOverScreen(true);
    })

    socket.on("all_correct_guesses" , () => {
      showPopupMessage("Moving to next turn...", 'success');
    })

    socket.on("turn_ended", () => {
      showPopupMessage("Time's up! Moving to next turn...", 'info');
    })

    socket.on('score_updated', (updatedUser: User) => {
      console.log('Score updated for:', updatedUser.username, 'New score:', updatedUser.score);
      setUsers(prev => prev.map(user => 
        user.username === updatedUser.username 
          ? { ...user, score: updatedUser.score }
          : user
      ));
      showPopupMessage(`${updatedUser.username}'s score updated to ${updatedUser.score}`, 'info');
    });

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
      roundTime,
      category
    });
  }

  function handlePlayAgain() {
    // Reset scores and game state for new game
    setUsers(prev => prev.map(user => ({ ...user, score: 0 })));
    setShowGameOverScreen(false);
    // Keep players in room, creator can start new game
  }

  function handleBackToLobby() {
    setShowGameOverScreen(false);
    setUsers([]);
    setInRoom(false);

    socket.emit('leave_room', roomCode);
  }

  if (inRoom) {
    return (
      <div className="min-h-screen flex flex-col p-2 sm:p-4">
        {/* Top Section - Room Info */}
        <PlayerHeader 
          roomCode={roomCode} 
          users={users} 
          currentUsername={username}
          onLeaveRoom={leaveRoom} 
        />

        {/* Current Drawer Display */}
        {gameStarted && (
          <div className="bg-[#273c5f] border border-[#000000] rounded-lg px-4 py-2 mb-3 shadow-xl flex items-center justify-center gap-3">
            <p className="text-sm text-[#fef3c7] font-semibold">🎨 {currentDrawer} is drawing</p>
            {isDrawer && (
              <span className="text-xs bg-[#10b981] text-white px-3 py-1 rounded-full font-semibold">That's you!</span>
            )}
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
            category={category}
            setCategory={setCategory}
            onStartGame={startGame}
          />
        )}

        {/* Word Selection Modal */}
        <WordSelection roomCode={roomCode} isDrawer={isDrawer} />

        {/* Canvas and Chat Side by Side */}
        {gameStarted && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Canvas Section */}
            <div className="flex-1 md:flex-[3] min-w-0">
              {(() => {
                console.log('Render check - isDrawer:', isDrawer, 'currentWord:', currentWord);
                return isDrawer && currentWord && (
                  <div className="bg-[#10b981] border-2 border-[#059669] rounded-lg px-3 py-1.5 mb-2 shadow-xl flex items-center justify-center gap-2">
                    <p className="text-xs text-white font-semibold uppercase tracking-wide">Your Word:</p>
                    <p className="text-lg sm:text-xl font-bold text-white tracking-wider">{currentWord}</p>
                  </div>
                );
              })()}
                <Canva isDrawer={isDrawer} roomId={roomCode} />
            </div>
            
            {/* Chat Section */}
            <div className="flex flex-col h-80 sm:h-96 md:h-auto md:flex-1">
              <div className="flex-1 flex flex-col bg-[#1e293b] border-2 border-[#06b6d4] rounded-lg overflow-hidden shadow-xl">
                <Chat roomId={roomCode} username={username} isDrawer={isDrawer} />
              </div>
            </div>
          </div>
        )}
        
        {/* Popup Messages */}
        <GamePopup 
          messages={popupMessages} 
          onMessageExpire={handleMessageExpire} 
        />
        
        {/* Game Over Screen */}
        {showGameOverScreen && (
          <GameOverScreen
            users={users}
            currentUsername={username}
            onPlayAgain={handlePlayAgain}
            onBackToLobby={handleBackToLobby}
          />
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
