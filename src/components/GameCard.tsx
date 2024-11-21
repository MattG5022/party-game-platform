import React from 'react';

interface GameCardProps {
  title: string;
  description: string;
  players: string;
  duration: string;
}

const GameCard = ({ title, description, players, duration }: GameCardProps) => {
  return (
    <div className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition cursor-pointer">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <div className="flex justify-between text-sm text-gray-400">
        <span>{players}</span>
        <span>{duration}</span>
      </div>
    </div>
  );
};

export default GameCard;