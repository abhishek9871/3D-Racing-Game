
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import Scene from './Scene';
import { Hud } from '../ui/Hud';
import { GameProvider } from '../../store/GameContext';

interface GameProps {
  onRaceFinish: (position: number) => void;
}

const Game: React.FC<GameProps> = ({ onRaceFinish }) => {
  return (
    <GameProvider>
      <div className="relative w-full h-full">
        <Canvas shadows camera={{ position: [0, 10, -20], fov: 50 }}>
          <Physics broadphase="SAP" gravity={[0, -9.81, 0]}>
            <Scene onRaceFinish={onRaceFinish} />
          </Physics>
        </Canvas>
        <Hud />
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-xs">
          Controls: [A/D] or [←/→] to Steer | [W] or [↑] to Accelerate | [Space] to Brake | [Shift] for Nitro
        </div>
      </div>
    </GameProvider>
  );
};

export default Game;
