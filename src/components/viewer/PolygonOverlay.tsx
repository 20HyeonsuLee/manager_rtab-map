import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGraphEditorStore, usePolygonStore, useViewerStore } from "@/stores";
import { apiToThree } from "@/lib/utils";

/**
 * area의 saved corner polygons + 코너 작성 중 draft vertices를 3D 위에 표시.
 * - saved: 폐곡선 (호박색) — area당 다중 row인데 각각 별도 표시 (서버 FloorMap read는 union하지만
 *   admin UI는 row별로 보이는 게 편집/삭제 단서가 됨).
 * - draft: vertex marker + 연결선 + 마지막 vertex → 마우스로 가는 가이드는 생략 (R3F event 처리 무거움).
 */
export function PolygonOverlay() {
  const editorMode = useGraphEditorStore((s) => s.editorMode);
  const selectedAreaId = useViewerStore((s) => s.selectedAreaId);
  const polygons = usePolygonStore((s) => s.polygons);
  const draftVertices = usePolygonStore((s) => s.draftVertices);
  const fetchPolygons = usePolygonStore((s) => s.fetchPolygons);

  useEffect(() => {
    if (selectedAreaId) fetchPolygons(selectedAreaId);
  }, [selectedAreaId, fetchPolygons]);

  const savedLines = useMemo(() => {
    return polygons.map((p) => {
      const pts = p.vertices.map((v) => apiToThree(v.x, v.y, v.z));
      if (pts.length === 0) return null;
      const closed = [...pts, pts[0]];
      const positions = new Float32Array(closed.flatMap(([x, y, z]) => [x, y, z]));
      return { polygonId: p.polygonId, positions };
    }).filter(Boolean) as Array<{ polygonId: string; positions: Float32Array }>;
  }, [polygons]);

  const draftSegments = useMemo(() => {
    if (draftVertices.length === 0) return null;
    const pts = draftVertices.map((v) => apiToThree(v.x, v.y, v.z));
    const positions = new Float32Array(pts.flatMap(([x, y, z]) => [x, y, z]));
    return positions;
  }, [draftVertices]);

  return (
    <group>
      {savedLines.map(({ polygonId, positions }) => (
        <lineLoop key={polygonId}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={positions.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#f59e0b" linewidth={2} transparent opacity={0.9} />
        </lineLoop>
      ))}

      {editorMode === "add-corner" && draftSegments && (
        <>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={draftSegments}
                count={draftSegments.length / 3}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#fde047" linewidth={2} />
          </line>
          {draftVertices.map((v, idx) => {
            const [tx, ty, tz] = apiToThree(v.x, v.y, v.z);
            return (
              <mesh key={`draft-${idx}`} position={[tx, ty, tz]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
}
