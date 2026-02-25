import { useEffect, useState } from 'react';
import socket from '../socket';

interface WordSelectionProps {
  roomCode: string;
  isDrawer: boolean;
}

const TOTAL_TIME = 15;

const WORD_COLORS = [
  { border: '#ec4899', glow: '#ec489940', text: '#ec4899', bg: '#2d0a1a' },
  { border: '#f59e0b', glow: '#f59e0b40', text: '#f59e0b', bg: '#2d1a00' },
  { border: '#06b6d4', glow: '#06b6d440', text: '#06b6d4', bg: '#001a2d' },
];

const WordSelection = ({ roomCode, isDrawer }: WordSelectionProps) => {
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showSelection, setShowSelection] = useState(false);

  useEffect(() => {
    if (!isDrawer) {
      setShowSelection(false);
      return;
    }

    socket.on('turn_started', ({ wordChoices }: { wordChoices: string[] }) => {
      setWordChoices(wordChoices);
      setTimeLeft(TOTAL_TIME);
      setShowSelection(true);
    });

    socket.on('word_finalized', () => {
      setShowSelection(false);
    });

    return () => {
      socket.off('turn_started');
      socket.off('word_finalized');
    };
  }, [isDrawer]);

  useEffect(() => {
    if (!showSelection || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowSelection(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSelection, timeLeft]);

  const handleWordChoice = (word: string) => {
    socket.emit('word_chosen', { word, roomCode });
    setShowSelection(false);
  };

  if (!showSelection || !isDrawer) return null;

  const pct = (timeLeft / TOTAL_TIME) * 100;
  const barColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 9 ? '#f59e0b' : '#10b981';
  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 9 ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative bg-[#0f172a] border-2 border-[#1e293b] rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">

        {/* header */}
        <div className="text-center mb-6">
          <p className="text-[#64748b] text-xs font-semibold uppercase tracking-widest mb-1">
            ✏️ Your turn to draw
          </p>
          <h2 className="text-2xl font-bold text-white">Pick a word</h2>
        </div>

        {/* timer bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#475569] text-xs">Time to choose</span>
            <span className={`text-xl font-bold font-mono ${timerColor}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        {/* word cards */}
        <div className="flex flex-col gap-3">
          {wordChoices.map((word, i) => {
            const c = WORD_COLORS[i % WORD_COLORS.length];
            return (
              <button
                key={word}
                onClick={() => handleWordChoice(word)}
                style={{
                  backgroundColor: c.bg,
                  borderColor: c.border,
                  boxShadow: `0 0 0 0 ${c.glow}`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 18px 2px ${c.glow}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 0 ${c.glow}`;
                }}
                className="group w-full flex items-center justify-between border-2 rounded-xl px-5 py-4 transition-transform duration-100 active:scale-[0.98] hover:scale-[1.02] cursor-pointer"
              >
                <span className="text-[#475569] text-xs font-mono font-bold w-5">
                  {i + 1}
                </span>
                <span
                  className="flex-1 text-center text-lg font-bold tracking-wide"
                  style={{ color: c.text }}
                >
                  {word}
                </span>
                <span className="text-[#475569] text-xs w-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[#334155] text-xs mt-5">
          A word will be auto-selected if you don't choose in time
        </p>
      </div>
    </div>
  );
};

export default WordSelection;
