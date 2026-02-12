import { useMemo } from "react";
import * as THREE from "three";
import { useNodeStore } from "@/stores";
import { apiToThree } from "@/lib/utils";

export function PendingNodeMarker() {
  const pendingPosition = useNodeStore((s) => s.pendingPosition);

  const vec = useMemo(() => {
    if (!pendingPosition) return null;
    const [x, y, z] = apiToThree(pendingPosition);
    return new THREE.Vector3(x, y, z);
  }, [pendingPosition]);

  if (!vec) return null;

  return (
    <group position={vec}>
      {/* Ghost stem */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
        <meshStandardMaterial color="#facc15" transparent opacity={0.5} />
      </mesh>
      {/* Ghost head */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#facc15" transparent opacity={0.5} />
      </mesh>
      {/* Pulsing ring at base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
