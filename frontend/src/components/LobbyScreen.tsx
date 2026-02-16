import React from 'react';

interface LobbyScreenProps {
  username: string;
  joinRoomCode: string;
  error: string;
  connected: boolean;
  onUsernameChange: (value: string) => void;
  onJoinRoomCodeChange: (value: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  username,
  joinRoomCode,
  error,
  connected,
  onUsernameChange,
  onJoinRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
}) => (
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
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Enter your name"
          className="w-full"
        />
      </div>

      <div className="mb-6">
        <button
          onClick={onCreateRoom}
          className="w-full arcade-button bg-[#10b981] text-white py-3 px-6 border-[#10b981] hover:bg-[#059669] text-sm"
        >
          Create New Room
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#334155]" />
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
          onChange={(e) => onJoinRoomCodeChange(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          className="w-full mb-3"
          maxLength={5}
        />
        <button
          onClick={onJoinRoom}
          className="w-full arcade-button bg-[#06b6d4] text-white py-3 px-6 border-[#06b6d4] hover:bg-[#0891b2] text-sm"
        >
          Join Game
        </button>
      </div>

      <div className="text-center mt-6 text-sm">
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-[#10b981]' : 'bg-[#f97316] blink'}`} />
        <span className="text-[#cbd5e1]">{connected ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  </div>
);

export default LobbyScreen;