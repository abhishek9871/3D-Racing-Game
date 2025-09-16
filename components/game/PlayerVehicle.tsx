

import React, { useRef, useContext, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
// FIX: Import useBox to create the chassis physics body.
import { useRaycastVehicle, useBox } from '@react-three/cannon';
import * as THREE from 'three';
import Vehicle from './Vehicle';
import useControls from '../../hooks/useControls';
import { GameContext } from '../../store/GameContext';
import { ACCELERATION, BRAKE_FORCE, MAX_SPEED, NITRO_BOOST, STEERING_SENSITIVITY, CHECKPOINT_POSITIONS, TOTAL_LAPS } from '../../constants';

interface PlayerVehicleProps {
  vehicleId: string;
}

const PlayerVehicle: React.FC<PlayerVehicleProps> = ({ vehicleId }) => {
  const { updateVehicleState, nitro, setNitro, raceState } = useContext(GameContext)!;
  const controls = useControls();
  
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
  }));

  const [, api] = useRaycastVehicle(() => ({
    chassisBody: chassisRef,
    wheels,
    wheelInfos,
    indexForwardAxis: 2,
    indexRightAxis: 0,
    indexUpAxis: 1,
  }));
  
  const lastCheckpoint = useRef(CHECKPOINT_POSITIONS.length - 1);
  const lap = useRef(0);

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

  useFrame((state, delta) => {
    if (!chassisRef.current || raceState !== 'racing') {
      api.setBrake(10, 2);
      api.setBrake(10, 3);
      return;
    }

    const { forward, backward, left, right, brake, nitro: nitroPressed } = controls.current;

    const currentNitro = nitro;
    const effectiveAcceleration = forward && nitroPressed && currentNitro > 0 ? ACCELERATION * NITRO_BOOST : ACCELERATION;
    const engineForce = forward ? effectiveAcceleration : backward ? -effectiveAcceleration / 2 : 0;
    
    api.applyEngineForce(engineForce, 2);
    api.applyEngineForce(engineForce, 3);
    
    if (forward && nitroPressed && currentNitro > 0) {
      setNitro(Math.max(0, currentNitro - (100 / 5) * delta));
    }
    
    const steeringValue = left ? STEERING_SENSITIVITY : right ? -STEERING_SENSITIVITY : 0;
    api.setSteeringValue(steeringValue * 100, 0);
    api.setSteeringValue(steeringValue * 100, 1);
    
    api.setBrake(brake ? BRAKE_FORCE * 100 : 0, 2);
    api.setBrake(brake ? BRAKE_FORCE * 100 : 0, 3);
    
    const position = new THREE.Vector3();
    chassisRef.current.getWorldPosition(position);

    const speed = new THREE.Vector3(...(velocity.current as [number, number, number])).length() * 3.6; // m/s to km/h
    const effectiveMaxSpeed = MAX_SPEED * (forward && nitroPressed && currentNitro > 0 ? NITRO_BOOST : 1);
    
    if(speed > effectiveMaxSpeed) {
        const currentVelocity = new THREE.Vector3(...(velocity.current as [number, number, number]));
        const newVelocity = currentVelocity.normalize().multiplyScalar(effectiveMaxSpeed / 3.6);
        chassisApi.velocity.set(
            newVelocity.x,
            newVelocity.y,
            newVelocity.z
        );
    }
    
    // Camera follow
    const cameraOffset = new THREE.Vector3(0, 5, -10);
    const body = chassisRef.current;
    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(body.position);
    cameraPosition.add(cameraOffset.applyQuaternion(body.quaternion));
    state.camera.position.lerp(cameraPosition, 0.1);
    state.camera.lookAt(body.position);

    // Checkpoints
    const nextCheckpointIndex = (lastCheckpoint.current + 1) % CHECKPOINT_POSITIONS.length;
    const nextCheckpoint = new THREE.Vector3(...CHECKPOINT_POSITIONS[nextCheckpointIndex]);
    if (position.distanceTo(nextCheckpoint) < 20) {
        lastCheckpoint.current = nextCheckpointIndex;
        if (nextCheckpointIndex === CHECKPOINT_POSITIONS.length - 1) { // Passed finish line
            lap.current = lap.current + 1;
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

  return (
    <Vehicle ref={chassisRef} color="#007bff" />
  );
};

export default PlayerVehicle;