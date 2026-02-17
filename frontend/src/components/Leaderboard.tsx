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
    <div className="bg-[#0f172a] border border-[#06b6d4] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#10b981] text-sm font-semibold flex items-center gap-2">
          <span>🏆</span>
          Leaderboard
        </p>
        <span className="text-[#cbd5e1] text-xs">
          {users.length} player{users.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-2">
        {sortedUsers.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.username === currentUsername;
          
          return (
            <div
              key={user.username || index}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                ${getRankColor(rank)}
                ${isCurrentUser ? 'ring-2 ring-[#ec4899] ring-opacity-50' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-sm">
                  {getRankIcon(rank)}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${isCurrentUser ? 'text-[#ec4899]' : ''}`}>
                    {user.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs opacity-75">(You)</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  {user.score || 0}
                </span>
                <span className="text-xs opacity-75">pts</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedUsers.length === 0 && (
        <p className="text-center text-[#64748b] text-sm py-4">
          No players yet
        </p>
      )}
    </div>
  );
};

export default Leaderboard;