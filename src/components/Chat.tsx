import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Chat = () => {
  const [message, setMessage] = useState('');
  const { socket, roomCode, messages, addMessage } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket && roomCode) {
      socket.emit('chat_message', { roomCode, message: { user: 'You', text: message } });
      addMessage({ user: 'You', text: message });
      setMessage('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Chat</h2>
      <div className="h-64 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-gray-700 p-2 rounded">
            <span className="font-semibold">{msg.user}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;