import { useEffect } from 'react';

interface PopupMessage {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface GamePopupProps {
  messages: PopupMessage[];
  onMessageExpire: (id: number) => void;
}

export default function GamePopup({ messages, onMessageExpire }: GamePopupProps) {
  useEffect(() => {
    messages.forEach((message) => {
      const timer = setTimeout(() => {
        onMessageExpire(message.id);
      }, 3000); // 3 second display duration

      return () => clearTimeout(timer);
    });
  }, [messages, onMessageExpire]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`
            min-w-80 max-w-md p-4 rounded-lg shadow-xl border-2 
            transform transition-all duration-300 ease-in-out
            ${message.type === 'success' ? 'bg-[#10b981] border-[#059669] text-white' : ''}
            ${message.type === 'warning' ? 'bg-[#f59e0b] border-[#d97706] text-white' : ''}
            ${message.type === 'error' ? 'bg-[#ef4444] border-[#dc2626] text-white' : ''}
            ${(!message.type || message.type === 'info') ? 'bg-[#06b6d4] border-[#0891b2] text-white' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{message.message}</p>
            <button
              onClick={() => onMessageExpire(message.id)}
              className="ml-3 text-white/80 hover:text-white text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}