import React, { createContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { GameContextType, VehicleState } from '../types';
import { AI_COUNT, TOTAL_LAPS, MAX_NITRO, CHECKPOINT_POSITIONS } from '../constants';

export const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

const getVehicleProgress = (v: VehicleState) => {
    const totalCheckpoints = CHECKPOINT_POSITIONS.length;
    return v.lap * totalCheckpoints + v.checkpoint;
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<VehicleState[]>(() => {
    const initialVehicles: VehicleState[] = [
      // FIX: Explicitly cast position and rotation to [number, number, number] to satisfy VehicleState type
      { id: 'player', position: [0, 0.5, -5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], speed: 0, lap: 0, checkpoint: 0, isPlayer: true, color: '#007bff' },
      ...Array.from({ length: AI_COUNT }).map((_, i) => ({
        id: `ai-${i}`,
        // FIX: Explicitly cast position and rotation to [number, number, number] to satisfy VehicleState type
        position: [5 + i * 5, 0.5, -10] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        speed: 0,
        lap: 0,
        checkpoint: 0,
        isPlayer: false,
        color: ['#ff4040', '#40ff40', '#4040ff'][i % 3],
      })),
    ];
    return initialVehicles;
  });

  const [nitro, setNitroState] = useState(MAX_NITRO);
  const [countdown, setCountdown] = useState(3);
  const [raceState, setRaceState] = useState<'countdown' | 'racing' | 'finished'>('countdown');

  useEffect(() => {
    if (raceState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setRaceState('racing');
      }
    }
  }, [countdown, raceState]);

  const updateVehicleState = useCallback((id: string, partialState: Partial<Omit<VehicleState, 'id'>>) => {
    setVehicles(prev =>
      prev.map(v => (v.id === id ? { ...v, ...partialState } : v))
    );
  }, []);
  
  const setNitro = useCallback((value: number) => {
    setNitroState(value);
  }, []);

  const playerPosition = useMemo(() => {
    const sortedVehicles = [...vehicles].sort((a, b) => getVehicleProgress(b) - getVehicleProgress(a));
    const playerIndex = sortedVehicles.findIndex(v => v.isPlayer);
    return playerIndex + 1;
  }, [vehicles]);


  const contextValue = useMemo(() => ({
    vehicles,
    raceState,
    countdown,
    nitro,
    playerPosition,
    totalLaps: TOTAL_LAPS,
    updateVehicleState,
    setNitro,
  }), [vehicles, raceState, countdown, nitro, playerPosition, updateVehicleState, setNitro]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
