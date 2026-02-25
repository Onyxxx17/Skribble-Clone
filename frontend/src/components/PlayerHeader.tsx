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
  <div className="bg-[#1e293b] border-2 border-[#06b6d4] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 mb-3 shadow-xl">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-[#ec4899] truncate">Room: {roomCode}</h1>
        <p className="text-[#cbd5e1] text-xs hidden sm:block">Share to invite!</p>
      </div>
      <button
        onClick={onLeaveRoom}
        className="arcade-button bg-[#ec4899] text-white py-1.5 px-4 border-[#ec4899] hover:bg-[#db2777] text-sm shrink-0"
      >
        Leave
      </button>
    </div>

    <div className="mt-2">
      <Leaderboard users={users} currentUsername={currentUsername} />
    </div>
  </div>
);

export default PlayerHeader;