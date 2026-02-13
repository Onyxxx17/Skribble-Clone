interface GameSettingsProps {
  totalRounds: number;
  setTotalRounds: (rounds: number) => void;
  roundTime: number;
  setRoundTime: (time: number) => void;
  numPlayers: number;
  onStartGame: () => void;
}

const ROUND_OPTIONS = [1, 2, 4, 8];
const TIME_OPTIONS = [30, 60, 90, 120];

export default function GameSettings({
  totalRounds,
  setTotalRounds,
  roundTime,
  setRoundTime,
  numPlayers,
  onStartGame,
}: GameSettingsProps) {
  const totalSeconds = totalRounds * roundTime * numPlayers;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return (
    <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-4 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">⚙️ Game Settings</h2>
        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
          CREATOR
        </span>
      </div>

      <div className="space-y-4">
        {/* Total Rounds */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Rounds
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ROUND_OPTIONS.map((rounds) => (
              <button
                key={rounds}
                onClick={() => setTotalRounds(rounds)}
                className={`py-2 px-4 rounded-lg font-semibold transition duration-200 ${
                  totalRounds === rounds
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-300'
                }`}
              >
                {rounds}
              </button>
            ))}
          </div>
        </div>

        {/* Round Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time per Round (seconds)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                onClick={() => setRoundTime(time)}
                className={`py-2 px-4 rounded-lg font-semibold transition duration-200 ${
                  roundTime === time
                    ? 'bg-purple-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-300'
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
          className="w-full bg-linear-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🎮 Start Game
        </button>
          {totalRounds} round{totalRounds > 1 ? 's' : ''} × {roundTime}s × {numPlayers} player{numPlayers > 1 ? 's' : ''}
        </div>
        <p className="text-sm text-gray-600 text-center">
          <span className="font-bold text-blue-600 text-lg">
            {totalMinutes}min {remainingSeconds}s
          </span>
          {' '}total game time
        </p>
        <p className="text-xs text-gray-500 text-center mt-2">
          Each player draws once per round 
        
        </p>
      </div>
  );
}
