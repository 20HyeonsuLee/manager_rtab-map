import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useNodeStore, useViewerStore } from "@/stores";
import { apiToThree } from "@/lib/utils";
import type { NodeType } from "@/types";

const NODE_COLORS: Record<NodeType, string> = {
  ENTRANCE: "#22c55e",
  ELEVATOR: "#8b5cf6",
  STAIRCASE: "#f59e0b",
  RESTROOM: "#3b82f6",
  ROOM: "#6b7280",
  INFORMATION: "#06b6d4",
  EMERGENCY_EXIT: "#ef4444",
  OTHER: "#a855f7",
};

const NODE_LABELS: Record<NodeType, string> = {
  ENTRANCE: "출입구",
  ELEVATOR: "엘리베이터",
  STAIRCASE: "계단",
  RESTROOM: "화장실",
  ROOM: "방",
  INFORMATION: "안내",
  EMERGENCY_EXIT: "비상구",
  OTHER: "기타",
};

function NodeMarker({
  id,
  name,
  type,
  position,
  isSelected,
}: {
  id: string;
  name: string;
  type: NodeType;
  position: [number, number, number];
  isSelected: boolean;
}) {
  const selectNode = useNodeStore((s) => s.selectNode);
  const isPlacementMode = useNodeStore((s) => s.isPlacementMode);
  const color = NODE_COLORS[type];

  const vec = useMemo(() => new THREE.Vector3(...position), [position]);

  return (
    <group
      position={vec}
      onClick={(e) => {
        if (isPlacementMode) return;
        e.stopPropagation();
        selectNode(id);
      }}
    >
      {/* Pin stem */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pin head */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.11, 0.14, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Tooltip on hover — always show for selected, Html for label */}
      <Html
        position={[0, 0.45, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: "none" }}
      >
        <div className="whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white shadow">
          <span className="font-medium">{name}</span>
          <span className="ml-1 text-white/60">({NODE_LABELS[type]})</span>
        </div>
      </Html>
    </group>
  );
}

export function NodeOverlay() {
  const nodes = useNodeStore((s) => s.nodes);
  const selectedNodeId = useNodeStore((s) => s.selectedNodeId);
  const showPOI = useViewerStore((s) => s.showPOI);

  if (!showPOI || nodes.length === 0) return null;

  return (
    <group>
      {nodes.map((node) => {
        const pos = apiToThree(node.position);
        return (
          <NodeMarker
            key={node.id}
            id={node.id}
            name={node.name}
            type={node.type}
            position={pos}
            isSelected={selectedNodeId === node.id}
          />
        );
      })}
    </group>
  );
}
