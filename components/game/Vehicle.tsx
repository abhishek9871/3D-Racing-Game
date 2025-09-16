

import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { useBox } from '@react-three/cannon';
// FIX: Add type import to ensure R3F's JSX elements are recognized by TypeScript.
import type { ThreeElements } from '@react-three/fiber';

interface VehicleProps {
  color?: string;
}

// FIX: The `useBox` hook was removed from this component and moved to the parent components (`PlayerVehicle`, `AIVehicle`).
// This allows parent components to access the physics API of the chassis (e.g., for velocity),
// and makes this component purely presentational. The component now accepts a ref that is already associated with a physics body.
const Vehicle = forwardRef<THREE.Group, VehicleProps>(({ color = 'white' }, ref) => {
  return (
    <group ref={ref}>
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[1.7, 0.8, 3.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.65, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.5, 1.8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Wheels - visual only */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[i < 2 ? 0.9 : -0.9, -0.1, i % 2 === 0 ? 1.3 : -1.3]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      ))}
    </group>
  );
});

export default Vehicle;