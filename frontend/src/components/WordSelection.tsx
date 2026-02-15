import { useEffect, useState } from 'react';
import socket from '../socket';

interface WordSelectionProps {
  roomCode: string;
  isDrawer: boolean;
}

const WordSelection = ({ roomCode, isDrawer }: WordSelectionProps) => {
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showSelection, setShowSelection] = useState(false);

  useEffect(() => {
    if (!isDrawer) {
      setShowSelection(false);
      return;
    }

    socket.on('turn_started', ({ wordChoices }: { wordChoices: string[] }) => {
      setWordChoices(wordChoices);
      setTimeLeft(15);
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

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 1000,
      minWidth: '400px',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>Choose a Word</h2>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: timeLeft <= 5 ? '#e74c3c' : '#2ecc71',
        marginBottom: '1.5rem'
      }}>
        {timeLeft}s
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {wordChoices.map((word, index) => (
          <button
            key={index}
            onClick={() => handleWordChoice(word)}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2980b9';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3498db';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordSelection;
