import * as THREE from "three";
import { Line } from "@react-three/drei";
import type { VerticalPassageResponse, VerticalPassageType } from "@/types";

interface VerticalPassageOverlayProps {
  passages: VerticalPassageResponse[];
  visible: boolean;
}

function generateStaircasePoints(
  entry: THREE.Vector3,
  exit: THREE.Vector3,
  steps: number,
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const dx = (exit.x - entry.x) / steps;
  const dy = (exit.y - entry.y) / steps;
  const dz = (exit.z - entry.z) / steps;
  const zigzagOffset = 0.15;

  for (let i = 0; i <= steps; i++) {
    const zigzag = i % 2 === 0 ? zigzagOffset : -zigzagOffset;
    points.push([
      entry.x + dx * i + zigzag,
      entry.z + dz * i,
      entry.y + dy * i,
    ]);
  }
  return points;
}

function getPassageColor(type: VerticalPassageType): string {
  return type === "STAIRCASE" ? "#f59e0b" : "#8b5cf6";
}

export function VerticalPassageOverlay({ passages, visible }: VerticalPassageOverlayProps) {
  if (!visible || passages.length === 0) return null;

  return (
    <group>
      {passages.map((passage) => {
        const entry = new THREE.Vector3(
          passage.entryPoint.x,
          passage.entryPoint.z,
          passage.entryPoint.y,
        );
        const exit = new THREE.Vector3(
          passage.exitPoint.x,
          passage.exitPoint.z,
          passage.exitPoint.y,
        );
        const color = getPassageColor(passage.type);

        if (passage.type === "STAIRCASE") {
          const stairPoints = generateStaircasePoints(entry, exit, 10);
          const vectors = stairPoints.map(
            (p) => new THREE.Vector3(p[0], p[1], p[2]),
          );
          return (
            <group key={passage.id}>
              <Line
                points={vectors}
                color={color}
                lineWidth={2}
                transparent
                opacity={0.7}
                dashed
                dashSize={0.1}
                dashOffset={0}
                gapSize={0.05}
              />
              <mesh position={entry}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
              <mesh position={exit}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>
          );
        }

        return (
          <group key={passage.id}>
            <Line
              points={[entry, exit]}
              color={color}
              lineWidth={3}
              transparent
              opacity={0.8}
            />
            <mesh position={entry}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={exit}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
