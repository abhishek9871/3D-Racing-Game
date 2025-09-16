
export const MAX_SPEED = 250; // km/h
export const ACCELERATION = 80;
export const STEERING_SENSITIVITY = 0.002;
export const BRAKE_FORCE = 1.5;
export const NITRO_BOOST = 1.4;
export const NITRO_DURATION = 5; // seconds
export const MAX_NITRO = 100;

export const AI_COUNT = 3;
export const TOTAL_LAPS = 3;

export const TRACK_WIDTH = 20;
export const TRACK_RADIUS = 60;
export const STRAIGHT_LENGTH = 100;
export const WALL_HEIGHT = 2;

export const CHECKPOINT_POSITIONS: [number, number, number][] = [
  [0, 0, STRAIGHT_LENGTH / 2], // Checkpoint 1 (After turn 1)
  [TRACK_RADIUS + TRACK_WIDTH/2, 0, 0], // Checkpoint 2 (Halfway through turn 2)
  [0, 0, -STRAIGHT_LENGTH / 2], // Checkpoint 3 (After turn 3)
  [-TRACK_RADIUS - TRACK_WIDTH/2, 0, 0] // Start/Finish Line
];
