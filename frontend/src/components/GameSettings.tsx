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
    <div className="bg-[#16213e] border-4 border-[#f9c74f] pixel-corners p-6 mb-4 shadow-[0_0_40px_rgba(249,199,79,0.3)]">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-lg text-[#f9c74f] uppercase tracking-wider retro-glow" style={{fontSize: '1rem'}}>⚙ GAME CONFIG</h2>
        <span className="bg-[#06ffa5] text-[#1a0b2e] text-[0.55rem] px-3 py-1 border-2 border-[#1a0b2e] uppercase tracking-wide">
          ★ HOST
        </span>
      </div>

      <div className="space-y-6">
        {/* Total Rounds */}
        <div>
          <label className="block text-[0.65rem] text-[#4cc9f0] mb-3 uppercase tracking-wider">
            ▼ TOTAL ROUNDS
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ROUND_OPTIONS.map((rounds) => (
              <button
                key={rounds}
                onClick={() => setTotalRounds(rounds)}
                className={`arcade-button py-3 px-4 text-[0.7rem] ${
                  totalRounds === rounds
                    ? 'bg-[#e94b9e] border-[#e94b9e] text-white'
                    : 'bg-[#2d1b4e] border-[#4cc9f0] text-[#4cc9f0] hover:bg-[#3d2b5e]'
                }`}
              >
                {rounds}
              </button>
            ))}
          </div>
        </div>

        {/* Round Time */}
        <div>
          <label className="block text-[0.65rem] text-[#4cc9f0] mb-3 uppercase tracking-wider">
            ▼ TIME PER ROUND
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                onClick={() => setRoundTime(time)}
                className={`arcade-button py-3 px-4 text-[0.7rem] ${
                  roundTime === time
                    ? 'bg-[#f9c74f] border-[#f9c74f] text-[#1a0b2e]'
                    : 'bg-[#2d1b4e] border-[#4cc9f0] text-[#4cc9f0] hover:bg-[#3d2b5e]'
                }`}
              >
                {time}S
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full arcade-button bg-[#06ffa5] text-[#1a0b2e] py-4 px-6 border-[#06ffa5] hover:bg-[#05e094] text-[0.8rem] retro-glow"
        >
          ▶ START GAME ◀
        </button>
        
        {/* Game Info */}
        <div className="bg-[#2d1b4e] border-2 border-[#4cc9f0] p-4 text-center">
          <p className="text-[0.6rem] text-[#a5b4fc] mb-2 uppercase">
            {totalRounds} ROUND{totalRounds > 1 ? 'S' : ''} × {roundTime}S × {numPlayers} PLAYER{numPlayers > 1 ? 'S' : ''}
          </p>
          <p className="text-[0.65rem] text-[#06ffa5]">
            <span className="text-[1rem] retro-glow">
              {totalMinutes}:{remainingSeconds.toString().padStart(2, '0')}
            </span>
            <br/>
            <span className="text-[#4cc9f0] text-[0.55rem] uppercase">TOTAL TIME</span>
          </p>
          <p className="text-[0.55rem] text-[#a5b4fc] mt-3 opacity-75 uppercase">
            EACH PLAYER DRAWS ONCE PER ROUND
          </p>
        </div>
      </div>
    </div>
  );
}
