
export enum GameState {
  MENU,
  GAME,
  POST_RACE,
}

export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  nitro: boolean;
}

export interface VehicleState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  lap: number;
  checkpoint: number;
  isPlayer: boolean;
  color: string;
}

export interface GameContextType {
  vehicles: VehicleState[];
  raceState: 'countdown' | 'racing' | 'finished';
  countdown: number;
  nitro: number; // Player's nitro level
  playerPosition: number;
  totalLaps: number;
  updateVehicleState: (id: string, partialState: Partial<Omit<VehicleState, 'id'>>) => void;
  setNitro: (value: number) => void;
}
