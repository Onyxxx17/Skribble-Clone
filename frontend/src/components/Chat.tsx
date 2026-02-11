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
      <div className="bg-blue-500 text-white px-4 py-3">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {displayMessages.length === 0 ? (
          <p className="text-center text-gray-400 mt-8">No messages yet. Start the conversation!</p>
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
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1">
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
                    <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg">
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
      <div className="border-t border-gray-200 p-4 bg-white">
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
