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
      <div className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-4 py-3">
        <h2 className="text-base font-bold text-white">Chat</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0f172a]">
        {displayMessages.length === 0 ? (
          <p className="text-center text-[#cbd5e1] mt-8 text-sm opacity-60">No messages yet. Start chatting!</p>
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
                    className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.user.username === username
                        ? "bg-[#06b6d4] text-white"
                        : "bg-[#1e293b] text-[#f1f5f9] border border-[#334155]"
                    }`}
                  >
                    <p className="text-xs mb-1 opacity-75 font-semibold">
                      {msg.user.username === username ? "You" : msg.user.username}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              );
            } else {
              // Guess type
              const guess = item.data;
              if (guess.isCorrectGuess) {
                return (
                  <div key={index} className="mb-3 text-center">
                    <div className="inline-block bg-[#10b981] text-white rounded-lg px-4 py-2">
                      <p className="text-sm font-semibold">
                        🎉 {guess.user.username} guessed the word!
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
      <div className="border-t border-[#334155] p-4 bg-[#1e293b]">
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
            placeholder="Type your message..."
            className="flex-1"
          />
          <button
            onClick={sendMessage}
            className="arcade-button bg-[#10b981] text-white px-6 py-2 border-[#10b981] hover:bg-[#059669] text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
