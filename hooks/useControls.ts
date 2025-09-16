// FIX: Add a triple-slash directive to include DOM library types.
// This resolves errors with 'window.addEventListener' and 'KeyboardEvent.key'
// by providing the correct TypeScript definitions for browser environments.
/// <reference lib="dom" />

import { useEffect, useRef } from 'react';
import { Controls } from '../types';

const useControls = () => {
  const controls = useRef<Controls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    nitro: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          controls.current.forward = true;
          break;
        case 's':
        case 'ArrowDown':
          controls.current.backward = true;
          break;
        case 'a':
        case 'ArrowLeft':
          controls.current.left = true;
          break;
        case 'd':
        case 'ArrowRight':
          controls.current.right = true;
          break;
        case ' ':
          controls.current.brake = true;
          break;
        case 'Shift':
          controls.current.nitro = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          controls.current.forward = false;
          break;
        case 's':
        case 'ArrowDown':
          controls.current.backward = false;
          break;
        case 'a':
        case 'ArrowLeft':
          controls.current.left = false;
          break;
        case 'd':
        case 'ArrowRight':
          controls.current.right = false;
          break;
        case ' ':
          controls.current.brake = false;
          break;
        case 'Shift':
          controls.current.nitro = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
};

export default useControls;