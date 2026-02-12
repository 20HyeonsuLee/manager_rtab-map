import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useViewerStore } from "@/stores";

export function PathOverlay() {
  const floorPath = useViewerStore((s) => s.floorPath);
  const showPath = useViewerStore((s) => s.showPath);

  const linePoints = useMemo(() => {
    if (!floorPath || floorPath.segments.length === 0) return null;

    const sorted = [...floorPath.segments].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder,
    );

    const points: [number, number, number][] = [];
    for (const seg of sorted) {
      if (points.length === 0) {
        points.push([seg.startPoint.x, seg.startPoint.z, seg.startPoint.y]);
      }
      points.push([seg.endPoint.x, seg.endPoint.z, seg.endPoint.y]);
    }

    return points;
  }, [floorPath]);

  if (!showPath || !linePoints || linePoints.length < 2) return null;

  const nodePositions = linePoints.map(
    (p) => new THREE.Vector3(p[0], p[1], p[2]),
  );

  return (
    <group>
      <Line
        points={nodePositions}
        color="#22d3ee"
        lineWidth={3}
        transparent
        opacity={0.9}
      />
      {nodePositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={idx === 0 ? "#4ade80" : idx === nodePositions.length - 1 ? "#f87171" : "#22d3ee"}
          />
        </mesh>
      ))}
    </group>
  );
}
