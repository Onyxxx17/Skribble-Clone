import React, { useState } from 'react';
import type { User } from '../types/types';

interface GameOverScreenProps {
  users: User[];
  currentUsername: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  users, 
  currentUsername, 
  onPlayAgain, 
  onBackToLobby 
}) => {
  const [wantToPlayAgain, setWantToPlayAgain] = useState(false);
  
  // Sort users by score (highest first)
  const sortedUsers = [...users].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const currentUserRank = sortedUsers.findIndex(user => user.username === currentUsername) + 1;
  const winner = sortedUsers[0];

  const handlePlayAgain = () => {
    setWantToPlayAgain(true);
    onPlayAgain();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] border-2 border-[#06b6d4] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#ec4899] mb-4">🎉 Game Over! 🎉</h1>
          
          {winner && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-4 rounded-lg mb-6">
              <p className="text-lg font-semibold">👑 Winner 👑</p>
              <p className="text-2xl font-bold">{winner.username}</p>
              <p className="text-lg">{winner.score} points</p>
            </div>
          )}

          <div className={`p-3 rounded-lg ${
            currentUserRank === 1 ? 'bg-green-500/20 text-green-300' :
            currentUserRank <= 3 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-blue-500/20 text-blue-300'
          }`}>
            <p className="font-semibold">
              Your Rank: {getRankIcon(currentUserRank)} #{currentUserRank}
            </p>
          </div>
        </div>

        {/* Final Leaderboard */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#10b981] mb-4 text-center">📊 Final Leaderboard</h2>
          
          <div className="space-y-3">
            {sortedUsers.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.username === currentUsername;
              
              return (
                <div
                  key={user.username || index}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2 transition-all
                    ${isCurrentUser 
                      ? 'border-[#ec4899] bg-[#ec4899]/10 ring-2 ring-[#ec4899]/50' 
                      : 'border-[#06b6d4]/50 bg-[#0f172a]'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold
                      bg-gradient-to-r ${getRankColor(rank)} text-white
                    `}>
                      {getRankIcon(rank)}
                    </div>
                    
                    <div>
                      <p className={`font-bold text-lg ${isCurrentUser ? 'text-[#ec4899]' : 'text-white'}`}>
                        {user.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-sm opacity-75">(You)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#10b981]">
                      {user.score || 0}
                    </p>
                    <p className="text-sm text-[#cbd5e1] opacity-75">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            disabled={wantToPlayAgain}
            className={`
              px-6 py-3 rounded-lg font-bold text-lg transition-all
              ${wantToPlayAgain 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-[#10b981] hover:bg-[#059669] text-white transform hover:scale-105'
              }
            `}
          >
            {wantToPlayAgain ? '⏳ Waiting for others...' : '🎮 Play Again'}
          </button>
          
          <button
            onClick={onBackToLobby}
            className="px-6 py-3 bg-[#6b7280] hover:bg-[#4b5563] text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105"
          >
            🏠 Back to Lobby
          </button>
        </div>

        {wantToPlayAgain && (
          <p className="text-center text-[#cbd5e1] text-sm mt-4">
            Waiting for other players to decide...
          </p>
        )}
      </div>
    </div>
  );
};

export default GameOverScreen;