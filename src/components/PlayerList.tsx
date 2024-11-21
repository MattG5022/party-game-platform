import React from 'react';
import { useGameStore } from '../store/gameStore';

const PlayerList = () => {
  const { players, roomCode } = useGameStore();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Players</h2>
        {roomCode && (
          <span className="bg-gray-700 px-3 py-1 rounded text-sm">
            Room: {roomCode}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-700 p-3 rounded"
          >
            <span>{player.name}</span>
            <span className={`text-sm ${
              player.status === 'ready' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {player.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;