
import React from 'react';

interface PostRaceMenuProps {
  playerPosition: number | null;
  onRestart: () => void;
  onMenu: () => void;
}

export const PostRaceMenu: React.FC<PostRaceMenuProps> = ({ playerPosition, onRestart, onMenu }) => {
  const getPositionText = (pos: number | null) => {
    if (pos === null) return 'Race Finished';
    switch (pos) {
      case 1: return '1st Place!';
      case 2: return '2nd Place!';
      case 3: return '3rd Place!';
      default: return `${pos}th Place`;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="text-center p-8 rounded-lg shadow-2xl bg-gray-800 border border-gray-700 w-full max-w-sm">
        <h1 className="text-5xl font-bold text-cyan-400 mb-4">{getPositionText(playerPosition)}</h1>
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105"
          >
            Restart
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
