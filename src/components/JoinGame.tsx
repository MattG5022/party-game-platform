import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { QRCodeSVG } from 'qrcode.react';

const JoinGame: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { socket, setIsHost } = useGameStore();
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socket) {
      setIsConnected(socket.connected);
      
      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setError('');
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setError('Unable to connect to server. Please try again.');
        setIsConnected(false);
      });

      socket.on('error', (msg) => {
        console.error('Socket error:', msg);
        setError(msg);
      });

      return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('error');
      };
    }
  }, [socket]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!socket?.connected) {
      setError('Not connected to server. Please try again.');
      return;
    }
    
    console.log('Creating room with player:', playerName);
    setIsHost(true);
    socket.emit('create_room', { playerName: playerName.trim() });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!socket?.connected) {
      setError('Not connected to server. Please try again.');
      return;
    }
    
    if (roomCode) {
      console.log('Joining room:', roomCode, 'as player:', playerName);
      setIsHost(false);
      socket.emit('join_room', { roomCode: roomCode.trim(), playerName: playerName.trim() });
    } else {
      setError('Please enter a room code');
    }
  };

  const joinUrl = `${window.location.origin}?room=${roomCode}`;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Join the Party!
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {!isConnected && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
            Connecting to server...
          </div>
        )}
        
        <div className="mb-6 space-y-2">
          <label className="block text-sm font-medium text-gray-300">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError('');
            }}
            className="w-full bg-gray-700/50 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || !isConnected}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 py-3 rounded-lg font-semibold text-white shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Create New Game
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400">
                Or join existing game
              </span>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                placeholder="Enter room code"
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || !roomCode.trim() || !isConnected}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 py-3 rounded-lg font-semibold text-white shadow-lg hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Join Game
            </button>
          </form>

          {roomCode && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400 mb-3">Scan to join:</p>
              <div className="inline-block bg-white p-3 rounded-lg shadow-lg">
                <QRCodeSVG value={joinUrl} size={128} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGame;