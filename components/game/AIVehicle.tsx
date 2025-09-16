

import React, { useRef, useContext, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
// FIX: Import useBox to create the chassis physics body.
import { useRaycastVehicle, useBox } from '@react-three/cannon';
import * as THREE from 'three';
import Vehicle from './Vehicle';
import { GameContext } from '../../store/GameContext';
import { ACCELERATION, BRAKE_FORCE, MAX_SPEED, STEERING_SENSITIVITY, CHECKPOINT_POSITIONS, TRACK_RADIUS, STRAIGHT_LENGTH, TOTAL_LAPS } from '../../constants';

interface AIVehicleProps {
  vehicleId: string;
  initialPosition: [number, number, number];
  color: string;
}

const AI_WAYPOINTS: THREE.Vector3[] = [
    new THREE.Vector3(TRACK_RADIUS, 0, -STRAIGHT_LENGTH / 2),
    new THREE.Vector3(TRACK_RADIUS, 0, STRAIGHT_LENGTH / 2),
    new THREE.Vector3(-TRACK_RADIUS, 0, STRAIGHT_LENGTH / 2),
    new THREE.Vector3(-TRACK_RADIUS, 0, -STRAIGHT_LENGTH / 2),
];

const AIVehicle: React.FC<AIVehicleProps> = ({ vehicleId, initialPosition, color }) => {
  const { updateVehicleState, raceState } = useContext(GameContext)!;
  const currentWaypoint = useRef(0);
  const lastCheckpoint = useRef(CHECKPOINT_POSITIONS.length - 1);
  const lap = useRef(0);

  const wheel1 = useRef(null);
  const wheel2 = useRef(null);
  const wheel3 = useRef(null);
  const wheel4 = useRef(null);
  const wheels = [wheel1, wheel2, wheel3, wheel4];

  const wheelInfo = {
    radius: 0.5,
    directionLocal: [0, -1, 0] as [number, number, number],
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    axleLocal: [-1, 0, 0] as [number, number, number],
    chassisConnectionPointLocal: [1, 0, 1] as [number, number, number],
    useCustomSlidingRotationalSpeed: true,
    customSlidingRotationalSpeed: -30,
    frictionSlip: 2,
    isFrontWheel: true,
  };

  const wheelInfos = [
    { ...wheelInfo, isFrontWheel: true, chassisConnectionPointLocal: [-0.85, 0, 1.4] as [number, number, number] },
    { ...wheelInfo, isFrontWheel: true, chassisConnectionPointLocal: [0.85, 0, 1.4] as [number, number, number] },
    { ...wheelInfo, isFrontWheel: false, chassisConnectionPointLocal: [-0.85, 0, -1.4] as [number, number, number] },
    { ...wheelInfo, isFrontWheel: false, chassisConnectionPointLocal: [0.85, 0, -1.4] as [number, number, number] },
  ];
  
  // FIX: Explicitly type the ref from useBox as THREE.Group.
  // This ensures the ref type matches what the forwarded ref in the Vehicle component expects,
  // resolving the TypeScript error about Object3D not being assignable to Group.
  const [chassisRef, chassisApi] = useBox<THREE.Group>(() => ({
    mass: 150,
    args: [1.7, 1, 4],
    allowSleep: false,
    collisionFilterGroup: 1,
    position: initialPosition,
  }));
  
  const [, api] = useRaycastVehicle(() => ({
    chassisBody: chassisRef,
    wheels,
    wheelInfos,
    indexForwardAxis: 2,
    indexRightAxis: 0,
    indexUpAxis: 1,
  }));
  
  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    if (chassisApi) {
      const unsubscribe = chassisApi.velocity.subscribe((v) => (velocity.current = v));
      return unsubscribe;
    }
  }, [chassisApi]);

  useEffect(() => {
    updateVehicleState(vehicleId, { lap: 1, checkpoint: lastCheckpoint.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (!chassisRef.current || raceState !== 'racing') {
        api.setBrake(10, 2);
        api.setBrake(10, 3);
        return;
    }

    const position = new THREE.Vector3();
    chassisRef.current.getWorldPosition(position);

    const waypoint = AI_WAYPOINTS[currentWaypoint.current];
    if (position.distanceTo(waypoint) < 25) {
      currentWaypoint.current = (currentWaypoint.current + 1) % AI_WAYPOINTS.length;
    }

    const targetDirection = waypoint.clone().sub(position).normalize();
    const vehicleDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(chassisRef.current.quaternion);

    const angle = targetDirection.angleTo(vehicleDirection);
    const cross = new THREE.Vector3().crossVectors(vehicleDirection, targetDirection);
    const steerCorrection = cross.y > 0 ? 1 : -1;

    let steeringValue = angle * steerCorrection * 0.5;
    steeringValue = Math.max(-1, Math.min(1, steeringValue));

    api.setSteeringValue(steeringValue * 100, 0);
    api.setSteeringValue(steeringValue * 100, 1);

    const speed = new THREE.Vector3(...(velocity.current as [number, number, number])).length() * 3.6;
    const isApproachingTurn = currentWaypoint.current % 2 === 1; // Waypoints on straights are even
    const targetSpeed = isApproachingTurn ? MAX_SPEED * 0.7 : MAX_SPEED * 0.9;
    
    if (speed < targetSpeed) {
      api.applyEngineForce(ACCELERATION * 0.9, 2);
      api.applyEngineForce(ACCELERATION * 0.9, 3);
      api.setBrake(0, 2);
      api.setBrake(0, 3);
    } else {
      api.applyEngineForce(0, 2);
      api.applyEngineForce(0, 3);
      api.setBrake(BRAKE_FORCE, 2);
      api.setBrake(BRAKE_FORCE, 3);
    }

    const nextCheckpointIndex = (lastCheckpoint.current + 1) % CHECKPOINT_POSITIONS.length;
    const nextCheckpoint = new THREE.Vector3(...CHECKPOINT_POSITIONS[nextCheckpointIndex]);
    if (position.distanceTo(nextCheckpoint) < 20) {
        lastCheckpoint.current = nextCheckpointIndex;
        if (nextCheckpointIndex === CHECKPOINT_POSITIONS.length - 1) {
            lap.current++;
        }
        updateVehicleState(vehicleId, { lap: lap.current <= TOTAL_LAPS ? lap.current : TOTAL_LAPS + 1, checkpoint: lastCheckpoint.current });
    }

    const rotation = new THREE.Euler();
    rotation.setFromQuaternion(chassisRef.current.quaternion);

    updateVehicleState(vehicleId, {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z],
      speed: Math.floor(speed),
    });
  });

  return <Vehicle ref={chassisRef} color={color} />;
};

export default AIVehicle;