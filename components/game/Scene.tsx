import React, { useContext, useEffect, useRef, useState } from 'react';
// FIX: Add type import to ensure R3F's JSX elements are recognized by TypeScript.
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import Track from './Track';
import PlayerVehicle from './PlayerVehicle';
import AIVehicle from './AIVehicle';
import { AI_COUNT, TOTAL_LAPS } from '../../constants';
import { GameContext } from '../../store/GameContext';
import { VehicleState } from '../../types';

interface SceneProps {
  onRaceFinish: (position: number) => void;
}

const Scene: React.FC<SceneProps> = ({ onRaceFinish }) => {
  const { vehicles, updateVehicleState, playerPosition } = useContext(GameContext)!;
  const [raceFinished, setRaceFinished] = useState(false);

  useEffect(() => {
    const player = vehicles.find(v => v.isPlayer);
    if (player && player.lap > TOTAL_LAPS && !raceFinished) {
      setRaceFinished(true);
      onRaceFinish(playerPosition);
    }
  }, [vehicles, playerPosition, onRaceFinish, raceFinished]);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Track />
      
      <PlayerVehicle vehicleId="player" />

      {Array.from({ length: AI_COUNT }).map((_, i) => (
        <AIVehicle key={`ai-${i}`} vehicleId={`ai-${i}`} initialPosition={[5 + i * 5, 0.5, -10]} color={['#ff4040', '#40ff40', '#4040ff'][i % 3]} />
      ))}
    </>
  );
};

export default Scene;