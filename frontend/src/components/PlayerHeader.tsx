import React from 'react';
import type { User } from '../types/types';
import Leaderboard from './Leaderboard';

interface PlayerHeaderProps {
  roomCode: string;
  users: User[];
  currentUsername?: string;
  onLeaveRoom: () => void;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ roomCode, users, currentUsername, onLeaveRoom }) => (
  <div className="bg-[#1e293b] border-2 border-[#06b6d4] rounded-lg p-3 sm:p-6 mb-4 shadow-xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold text-[#ec4899] mb-0.5 truncate">Room: {roomCode}</h1>
        <p className="text-[#cbd5e1] text-xs sm:text-sm">Share this code with others to join!</p>
      </div>
      <button
        onClick={onLeaveRoom}
        className="arcade-button bg-[#ec4899] text-white py-2 px-5 border-[#ec4899] hover:bg-[#db2777] text-sm"
      >
        Leave Room
      </button>
    </div>

    <div className="mt-4">
      <Leaderboard users={users} currentUsername={currentUsername} />
    </div>
  </div>
);

export default PlayerHeader;