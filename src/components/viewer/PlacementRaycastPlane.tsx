import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useNodeStore, useViewerStore } from "@/stores";
import { threeToApi } from "@/lib/utils";

export function PlacementRaycastPlane() {
  const isPlacementMode = useNodeStore((s) => s.isPlacementMode);
  const setPendingPosition = useNodeStore((s) => s.setPendingPosition);
  const floorPath = useViewerStore((s) => s.floorPath);

  const planeSize = useMemo(() => {
    if (!floorPath?.bounds) return 100;
    const { minX, maxX, minY, maxY } = floorPath.bounds;
    return Math.max(maxX - minX, maxY - minY) * 3;
  }, [floorPath]);

  if (!isPlacementMode) return null;

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    const { x, y, z } = e.point;
    setPendingPosition(threeToApi(x, y, z));
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[planeSize, planeSize]} />
      <meshBasicMaterial transparent opacity={0} side={2} />
    </mesh>
  );
}
