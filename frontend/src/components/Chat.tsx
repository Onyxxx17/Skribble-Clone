import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import type { ChatMessage, DisplayMessage, Guess } from "../types/types";

export default function Chat({
  roomId,
  username,
}: {
  roomId: string;
  username: string;
}) {
  const [message, setMessage] = useState("");
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);

  // Reference to the bottom of the messages list - used to auto-scroll to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Listen for chat messages
    socket.on("message_sent", (chatMessage: ChatMessage) => {
      setDisplayMessages((prev) => [...prev, { type: 'message', data: chatMessage }]);
    });

    // Listen for guesses
    socket.on("guess", (guess: Guess) => {
      setDisplayMessages((prev) => [...prev, { type: 'guess', data: guess }]);
    });

    return () => {
      socket.off("message_sent");
      socket.off("guess");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      message,
      username,
      roomCode: roomId,
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#7b2cbf] border-b-4 border-[#6a25a8] px-4 py-3">
        <h2 className="text-[0.75rem] text-white uppercase tracking-widest">▶ CHAT TERMINAL ◀</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#1a0b2e]">
        {displayMessages.length === 0 ? (
          <p className="text-center text-[#a5b4fc] mt-8 text-[0.65rem] uppercase opacity-50">◆ NO MESSAGES ◆<br/>START CHATTING!</p>
        ) : (
          displayMessages.map((item, index) => {
            if (item.type === 'message') {
              const msg = item.data;
              return (
                <div
                  key={msg.id || index}
                  className={`mb-3 ${
                    msg.user.username === username ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-xs lg:max-w-md px-4 py-3 border-2 ${
                      msg.user.username === username
                        ? "bg-[#4cc9f0] text-[#1a0b2e] border-[#3bb8de]"
                        : "bg-[#2d1b4e] text-[#e0e7ff] border-[#4ea8af]"
                    }`}
                  >
                    <p className="text-[0.55rem] mb-2 uppercase tracking-wide opacity-75">
                      {msg.user.username === username ? "▸ YOU" : `▸ ${msg.user.username}`}
                    </p>
                    <p className="text-[0.65rem] leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            } else {
              // Guess type
              const guess = item.data;
              if (guess.isCorrectGuess) {
                return (
                  <div key={index} className="mb-3 text-center">
                    <div className="inline-block bg-[#06ffa5] text-[#1a0b2e] border-4 border-[#05e094] px-4 py-3">
                      <p className="text-[0.65rem] uppercase tracking-wide">
                        ★ {guess.user.username} GUESSED IT! ★
                      </p>
                    </div>
                  </div>
                );
              }
              return null; // Don't show incorrect guesses
            }
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t-4 border-[#7b2cbf] p-4 bg-[#16213e]">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="TYPE MESSAGE..."
            className="flex-1"
          />
          <button
            onClick={sendMessage}
            className="arcade-button bg-[#06ffa5] text-[#1a0b2e] px-6 py-3 border-[#06ffa5] hover:bg-[#05e094] text-[0.65rem]"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
