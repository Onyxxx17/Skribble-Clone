import { useEffect, useState } from "react";
import { ROUND_OPTIONS, TIME_OPTIONS, WORD_CATEGORY_NAMES, CATEGORY_EMOJIS, type WordCategory } from "../constants";
import socket from "../socket";

interface GameSettingsProps {
  totalRounds: number;
  setTotalRounds: (rounds: number) => void;
  roundTime: number;
  setRoundTime: (time: number) => void;
  numPlayers: number;
  category: string;
  setCategory: (category: string) => void;
  onStartGame: () => void;
}

export default function GameSettings({
  totalRounds,
  setTotalRounds,
  roundTime,
  setRoundTime,
  numPlayers,
  category,
  setCategory,
  onStartGame,
}: GameSettingsProps) {
  const totalSeconds = totalRounds * roundTime * numPlayers;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.on("start_error", (error: string) => {
      setError(error);
    })
  }, []);
  return (
    <div className="bg-[#1e293b] border-2 border-[#f59e0b] rounded-lg p-6 mb-4 shadow-xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-[#f59e0b]">Game Settings</h2>
        <span className="bg-[#10b981] text-white text-xs px-3 py-1 rounded-full font-semibold">
          ★ HOST
        </span>
      </div>

      <div className="space-y-6">
        {/* Total Rounds */}
        <div>
          <label className="block text-sm font-semibold text-[#06b6d4] mb-3">
            Total Rounds
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ROUND_OPTIONS.map((rounds) => (
              <button
                key={rounds}
                onClick={() => setTotalRounds(rounds)}
                className={`arcade-button py-2 px-4 text-sm ${
                  totalRounds === rounds
                    ? 'bg-[#ec4899] border-[#ec4899] text-white font-bold'
                    : 'bg-[#0f172a] border-[#06b6d4] text-[#06b6d4] hover:bg-[#1e293b]'
                }`}
              >
                {rounds}
              </button>
            ))}
          </div>
        </div>

        {/* Word Category */}
        <div>
          <label className="block text-sm font-semibold text-[#06b6d4] mb-3">
            Word Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WORD_CATEGORY_NAMES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`arcade-button py-2 px-3 text-xs ${
                  category === cat
                    ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white font-bold'
                    : 'bg-[#0f172a] border-[#06b6d4] text-[#06b6d4] hover:bg-[#1e293b]'
                }`}
              >
                {CATEGORY_EMOJIS[cat as WordCategory]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Round Time */}
        <div>
          <label className="block text-sm font-semibold text-[#06b6d4] mb-3">
            Time per Round (seconds)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                onClick={() => setRoundTime(time)}
                className={`arcade-button py-2 px-4 text-sm ${
                  roundTime === time
                    ? 'bg-[#f59e0b] border-[#f59e0b] text-white font-bold'
                    : 'bg-[#0f172a] border-[#06b6d4] text-[#06b6d4] hover:bg-[#1e293b]'
                }`}
              >
                {time}s
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full arcade-button bg-[#10b981] text-white py-3 px-6 border-[#10b981] hover:bg-[#059669] text-lg font-bold"
        >
          🎮 Start Game
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-[#7f1d1d] border border-[#ef4444] rounded-lg p-3 text-sm text-[#ffe4e6] flex gap-3 items-start">
            <span className="text-lg" aria-hidden>
              ⚠️
            </span>
            <div>
              <p className="font-semibold uppercase tracking-wide text-xs text-[#fecdd3]/80">
                Error
              </p>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Game Info */}
        <div className="bg-[#0f172a] border border-[#06b6d4] rounded-lg p-4 text-center">
          <p className="text-xs text-[#cbd5e1] mb-2">
            {totalRounds} round{totalRounds > 1 ? 's' : ''} × {roundTime}s × {numPlayers} player{numPlayers > 1 ? 's' : ''}
          </p>
          <p className="text-sm text-[#10b981]">
            <span className="text-2xl font-bold">
              {totalMinutes}:{remainingSeconds.toString().padStart(2, '0')}
            </span>
            <br/>
            <span className="text-[#06b6d4] text-xs">total game time</span>
          </p>
          <p className="text-xs text-[#cbd5e1] mt-3 opacity-75">
            Each player draws once per round
          </p>
        </div>
      </div>
    </div>
  );
}
