import React, { useMemo } from 'react';
import { usePlane, useBox, BoxProps } from '@react-three/cannon';
import * as THREE from 'three';
import { CHECKPOINT_POSITIONS, STRAIGHT_LENGTH, TRACK_RADIUS, TRACK_WIDTH, WALL_HEIGHT } from '../../constants';
// FIX: Add type import to ensure R3F's JSX elements are recognized by TypeScript.
import type { ThreeElements } from '@react-three/fiber';

// A component for a single physics wall segment.
// The useBox hook is called at the top level here, which is correct.
const WallSegment: React.FC<BoxProps> = (props) => {
  useBox(() => ({ ...props, material: 'wall' }));
  return null;
};

// This component calculates the props for all wall segments in a curve and renders them.
const Curve = ({ position, side }: { position: [number, number, number]; side: 'left' | 'right' }) => {
  const segments = useMemo(() => {
    const wallSegments: (BoxProps & { key: string })[] = [];
    const numSegments = 32;
    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * Math.PI;
      const xOuter = Math.cos(angle) * (TRACK_RADIUS + TRACK_WIDTH);
      const zOuter = Math.sin(angle) * (TRACK_RADIUS + TRACK_WIDTH);
      const xInner = Math.cos(angle) * TRACK_RADIUS;
      const zInner = Math.sin(angle) * TRACK_RADIUS;

      const angleNext = ((i + 1) / numSegments) * Math.PI;
      const xOuterNext = Math.cos(angleNext) * (TRACK_RADIUS + TRACK_WIDTH);
      const zOuterNext = Math.sin(angleNext) * (TRACK_RADIUS + TRACK_WIDTH);
      const xInnerNext = Math.cos(angleNext) * TRACK_RADIUS;
      const zInnerNext = Math.sin(angleNext) * TRACK_RADIUS;

      const wallAngle = angle + (angleNext - angle) / 2;

      wallSegments.push({
        key: `outer-${side}-${i}`,
        args: [1, WALL_HEIGHT, (Math.PI * (TRACK_RADIUS + TRACK_WIDTH)) / numSegments + 1],
        position: [position[0] + (xOuter + xOuterNext) / 2 * (side === 'right' ? 1 : -1), WALL_HEIGHT / 2, position[2] + (zOuter + zOuterNext) / 2],
        rotation: [0, -wallAngle * (side === 'right' ? 1 : -1) - (side === 'right' ? 0 : Math.PI), 0],
      });

      wallSegments.push({
        key: `inner-${side}-${i}`,
        args: [1, WALL_HEIGHT, (Math.PI * TRACK_RADIUS) / numSegments + 1],
        position: [position[0] + (xInner + xInnerNext) / 2 * (side === 'right' ? 1 : -1), WALL_HEIGHT / 2, position[2] + (zInner + zInnerNext) / 2],
        rotation: [0, -wallAngle * (side === 'right' ? 1 : -1) - (side === 'right' ? 0 : Math.PI), 0],
      });
    }
    return wallSegments;
  }, [position, side]);

  return (
    <>
      {segments.map((props) => <WallSegment {...props} />)}
    </>
  );
};


const Track: React.FC = () => {
  // Floor planes
  usePlane(() => ({ position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], material: 'ground' }));

  const trackColor = "#555555";
  const grassColor = "#3c6e31";

  // Walls
  const wallMaterial = 'wall';
  // Outer walls
  useBox(() => ({ position: [TRACK_RADIUS + TRACK_WIDTH, WALL_HEIGHT / 2, 0], args: [1, WALL_HEIGHT, STRAIGHT_LENGTH], material: wallMaterial }));
  useBox(() => ({ position: [-TRACK_RADIUS - TRACK_WIDTH, WALL_HEIGHT / 2, 0], args: [1, WALL_HEIGHT, STRAIGHT_LENGTH], material: wallMaterial }));
  // Inner walls
  useBox(() => ({ position: [TRACK_RADIUS, WALL_HEIGHT / 2, 0], args: [1, WALL_HEIGHT, STRAIGHT_LENGTH], material: wallMaterial }));
  useBox(() => ({ position: [-TRACK_RADIUS, WALL_HEIGHT / 2, 0], args: [1, WALL_HEIGHT, STRAIGHT_LENGTH], material: wallMaterial }));

  const trackGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -TRACK_WIDTH / 2);
    shape.lineTo(STRAIGHT_LENGTH, -TRACK_WIDTH / 2);
    shape.absarc(STRAIGHT_LENGTH, 0, TRACK_WIDTH / 2, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(0, TRACK_WIDTH / 2);
    shape.absarc(0, 0, TRACK_WIDTH / 2, Math.PI / 2, -Math.PI / 2, false);

    const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(TRACK_RADIUS, 0, STRAIGHT_LENGTH/2),
        new THREE.Vector3(0, 0, STRAIGHT_LENGTH/2),
        new THREE.Vector3(-TRACK_RADIUS, 0, STRAIGHT_LENGTH/2),
        new THREE.Vector3(-TRACK_RADIUS, 0, -STRAIGHT_LENGTH/2),
        new THREE.Vector3(0, 0, -STRAIGHT_LENGTH/2),
        new THREE.Vector3(TRACK_RADIUS, 0, -STRAIGHT_LENGTH/2),
    ], true, 'catmullrom', 0.5);

    return new THREE.TubeGeometry(path, 100, TRACK_WIDTH, 8, false);
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
         <planeGeometry args={[ (TRACK_RADIUS+TRACK_WIDTH)*2.5, STRAIGHT_LENGTH * 1.5]} />
        <meshStandardMaterial color={grassColor} />
      </mesh>
      <mesh geometry={trackGeo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
         <meshStandardMaterial color={trackColor} />
      </mesh>

      <Curve position={[0, 0, STRAIGHT_LENGTH / 2]} side="right" />
      <Curve position={[0, 0, -STRAIGHT_LENGTH / 2]} side="left" />
      
      {/* Start/Finish Line */}
      <mesh position={[0, 0.01, -STRAIGHT_LENGTH/2 - 5]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH*2, 10]} />
        <meshBasicMaterial color="white" side={THREE.DoubleSide}/>
      </mesh>
      
      {/* Checkpoints (invisible triggers) */}
       {CHECKPOINT_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
            <boxGeometry args={[TRACK_WIDTH * 2, 5, 1]} />
            <meshBasicMaterial visible={false} />
        </mesh>
       ))}
    </>
  );
};

export default React.memo(Track);