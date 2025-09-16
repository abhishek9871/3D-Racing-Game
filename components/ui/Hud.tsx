
import React, { useContext } from 'react';
import { GameContext } from '../../store/GameContext';
import { TOTAL_LAPS } from '../../constants';

const HudSpeed: React.FC<{ speed: number }> = React.memo(({ speed }) => (
  <div className="text-6xl font-mono font-bold text-cyan-300">
    {speed.toString().padStart(3, '0')}
    <span className="text-2xl ml-2">km/h</span>
  </div>
));

const HudPosition: React.FC<{ position: number; total: number }> = React.memo(({ position, total }) => (
  <div className="text-4xl font-bold">
    {position} / <span className="text-2xl text-gray-400">{total}</span>
  </div>
));

const HudLap: React.FC<{ lap: number; total: number }> = React.memo(({ lap, total }) => (
  <div className="text-4xl font-bold">
    <span className="text-xl text-gray-400 mr-2">LAP</span> {Math.min(lap, total)} / {total}
  </div>
));

const HudNitro: React.FC<{ nitro: number }> = React.memo(({ nitro }) => (
  <div className="w-full">
    <span className="text-sm font-bold text-yellow-400">NITRO</span>
    <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-600 mt-1">
      <div
        className="bg-yellow-400 h-full rounded-full transition-all duration-150 ease-linear"
        style={{ width: `${nitro}%` }}
      ></div>
    </div>
  </div>
));


export const Hud: React.FC = () => {
  const context = useContext(GameContext);

  if (!context) return null;

  const { vehicles, playerPosition, nitro, raceState, countdown } = context;
  const player = vehicles.find(v => v.isPlayer);
  const totalVehicles = vehicles.length;

  if (raceState === 'countdown' && countdown > 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-9xl font-bold text-white animate-ping">{countdown}</div>
      </div>
    );
  }
   if (raceState === 'countdown' && countdown === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-9xl font-bold text-green-400 animate-pulse">GO!</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none text-white">
      {/* Top Left: Position & Lap */}
      <div className="flex space-x-8 items-baseline bg-black bg-opacity-30 p-4 rounded-lg w-fit">
        <HudPosition position={playerPosition} total={totalVehicles} />
        <HudLap lap={player?.lap ?? 1} total={TOTAL_LAPS} />
      </div>

      {/* Bottom Right: Speed & Nitro */}
      <div className="self-end flex flex-col items-end space-y-4 w-64 bg-black bg-opacity-30 p-4 rounded-lg">
        <HudSpeed speed={player?.speed ?? 0} />
        <HudNitro nitro={nitro} />
      </div>
    </div>
  );
};
