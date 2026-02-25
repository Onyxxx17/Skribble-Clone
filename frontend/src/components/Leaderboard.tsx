import React from 'react';
import type { User } from '../types/types';

interface LeaderboardProps {
  users: User[];
  currentUsername?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUsername }) => {
  // Sort users by score (highest first)
  const sortedUsers = [...users].sort((a, b) => (b.score || 0) - (a.score || 0));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 2: return 'text-gray-300 border-gray-300 bg-gray-300/10';
      case 3: return 'text-orange-400 border-orange-400 bg-orange-400/10';
      default: return 'text-[#14b8a6] border-[#14b8a6] bg-[#14b8a6]/10';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sortedUsers.map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.username === currentUsername;

        return (
          <div
            key={user.username || index}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold
              ${getRankColor(rank)}
              ${isCurrentUser ? 'ring-2 ring-[#ec4899] ring-opacity-60' : ''}
            `}
          >
            <span>{getRankIcon(rank)}</span>
            <span className={isCurrentUser ? 'text-[#ec4899]' : ''}>{user.username}</span>
            <span className="opacity-60">·</span>
            <span>{user.score || 0}pts</span>
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;