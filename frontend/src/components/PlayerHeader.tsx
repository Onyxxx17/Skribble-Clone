import React from 'react';

interface PlayerHeaderProps {
  roomCode: string;
  users: string[];
  onLeaveRoom: () => void;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ roomCode, users, onLeaveRoom }) => (
  <div className="bg-[#1e293b] border-2 border-[#06b6d4] rounded-lg p-6 mb-4 shadow-xl">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-[#ec4899] mb-2">Room: {roomCode}</h1>
        <p className="text-[#cbd5e1] text-sm">Share this code with others to join!</p>
      </div>
      <button
        onClick={onLeaveRoom}
        className="arcade-button bg-[#ec4899] text-white py-2 px-5 border-[#ec4899] hover:bg-[#db2777] text-sm"
      >
        Leave Room
      </button>
    </div>

    <div className="mt-4 bg-[#0f172a] border border-[#06b6d4] rounded-lg p-4">
      <p className="text-[#10b981] mb-3 text-sm font-semibold">Players ({users.length})</p>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <span
            key={user}
            className="bg-[#1e293b] border border-[#14b8a6] text-[#14b8a6] px-3 py-1.5 rounded-md text-sm font-medium"
          >
            ▸ {user}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default PlayerHeader;