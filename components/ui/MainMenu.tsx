
import React from 'react';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="text-center p-8 rounded-lg shadow-2xl bg-gray-800 border border-gray-700">
        <h1 className="text-6xl font-bold text-cyan-400 mb-2 tracking-wider" style={{fontFamily: `'Orbitron', sans-serif`}}>3D Racer</h1>
        <p className="text-gray-300 mb-8">A minimalistic racing experience.</p>
        <button
          onClick={onStart}
          className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
        >
          Start Race
        </button>
      </div>
       <div className="absolute bottom-4 text-center text-gray-500 text-sm">
        <p>Built with React, Three.js & Tailwind CSS</p>
      </div>
    </div>
  );
};
