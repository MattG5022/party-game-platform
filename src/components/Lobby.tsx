import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import PlayerList from './PlayerList';
import Chat from './Chat';
import GameCard from './GameCard';
import JoinGame from './JoinGame';
import io from 'socket.io-client';

// Update to use environment variable for socket URL
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Lobby: React.FC = () => {
  const { 
    socket, 
    setSocket, 
    roomCode,
    setRoomCode, 
    setPlayers,
    addMessage,
    isHost 
  } = useGameStore();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!socket) {
      const newSocket = io(SOCKET_URL);
      
      setSocket(newSocket);

      newSocket.on('room_created', (code) => {
        setRoomCode(code);
      });

      newSocket.on('joined_room', ({ players }) => {
        setPlayers(players);
      });

      newSocket.on('player_joined', (player) => {
        setPlayers((currentPlayers) => [...currentPlayers, player]);
        addMessage({ user: 'System', text: `${player.name} joined the game` });
      });

      newSocket.on('player_left', (playerId) => {
        setPlayers((currentPlayers) => 
          currentPlayers.filter(p => p.id !== playerId)
        );
      });

      newSocket.on('chat_message', (message) => {
        if (message.user !== 'You') {
          addMessage(message);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [socket, setSocket, setRoomCode, setPlayers, addMessage]);

  useEffect(() => {
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl && socket) {
      setRoomCode(roomFromUrl);
    }
  }, [searchParams, socket, setRoomCode]);

  if (!roomCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Party Game Platform</h1>
        <JoinGame />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Party Game Platform</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Available Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GameCard 
                title="Sample Game"
                description="A fun party game for everyone!"
                players="2-8 players"
                duration="15 mins"
              />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <PlayerList />
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Lobby;