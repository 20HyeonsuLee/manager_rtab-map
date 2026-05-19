import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Hexagon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { usePolygonStore, useViewerStore } from "@/stores";
import { getAreas } from "@/api/areas";
import type { AreaResponse, PolygonResponse, Point3D } from "@/types";

interface LobbyTabProps {
  buildingId: string;
}

export function LobbyTab({ buildingId }: LobbyTabProps) {
  void buildingId;
  const polygons = usePolygonStore((s) => s.polygons);
  const fetchPolygons = usePolygonStore((s) => s.fetchPolygons);
  const deletePolygon = usePolygonStore((s) => s.deletePolygon);
  const selectedAreaId = useViewerStore((s) => s.selectedAreaId);
  const selectedFloorId = useViewerStore((s) => s.selectedFloorId);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [areaToShow, setAreaToShow] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!selectedFloorId) {
      setAreas([]);
      setAreaToShow(null);
      return;
    }
    getAreas(selectedFloorId).then((data) => {
      setAreas(data);
      const initial = selectedAreaId ?? data.find((a) => a.isDefault)?.areaId ?? data[0]?.areaId ?? null;
      setAreaToShow(initial);
    }).catch(() => setAreas([]));
  }, [selectedFloorId, selectedAreaId]);

  useEffect(() => {
    if (areaToShow) fetchPolygons(areaToShow);
  }, [areaToShow, fetchPolygons]);

  const polygonsForArea = useMemo(() => {
    if (!areaToShow) return [];
    return polygons.filter((p) => p.floorAreaId === areaToShow);
  }, [polygons, areaToShow]);

  if (!selectedFloorId) {
    return <p className="text-sm text-muted-foreground text-center py-12">3D 탭에서 층을 먼저 선택하세요.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">구역:</span>
        {areas.length === 0 ? (
          <span className="text-xs text-muted-foreground">(없음)</span>
        ) : (
          areas.map((a) => (
            <Button
              key={a.areaId}
              variant={areaToShow === a.areaId ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setAreaToShow(a.areaId)}
            >
              {a.label || `Area ${a.areaIndex}`}
              {a.isDefault && " (기본)"}
            </Button>
          ))
        )}
        <div className="ml-auto">
          <Button size="sm" className="text-xs h-8" disabled={!areaToShow} onClick={() => setCreateOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />새 폴리곤
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 bg-muted/20">
          <p className="text-xs font-medium mb-2">시각화 (top-down)</p>
          {polygonsForArea.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
              <Hexagon className="h-10 w-10 mb-2" />
              <p className="text-xs">아직 폴리곤이 없습니다.</p>
            </div>
          ) : (
            <PolygonCanvas polygons={polygonsForArea} />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium">폴리곤 목록 ({polygonsForArea.length})</p>
          {polygonsForArea.length === 0 ? (
            <p className="text-xs text-muted-foreground">목록이 비었습니다.</p>
          ) : (
            <div className="space-y-1.5">
              {polygonsForArea.map((p) => (
                <div key={p.polygonId} className="rounded-md border bg-background p-2.5">
                  <div className="flex items-center gap-2">
                    <Hexagon className="h-3.5 w-3.5 text-cyan-500" />
                    <span className="text-xs font-mono">{p.polygonId.slice(0, 8)}…</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{p.markSessionId}</Badge>
                    <Button
                      variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive"
                      onClick={() => { if (window.confirm("이 폴리곤을 삭제하시겠습니까?")) deletePolygon(p.polygonId); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">vertex: {p.vertices.length}개</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreatePolygonDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        areaId={areaToShow}
      />
    </div>
  );
}

function PolygonCanvas({ polygons }: { polygons: PolygonResponse[] }) {
  const allVertices = polygons.flatMap((p) => p.vertices);
  if (allVertices.length === 0) return null;

  const xs = allVertices.map((v) => v.x);
  const ys = allVertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 0.5;
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;
  const aspect = width / Math.max(height, 0.001);
  const SVG_W = 400;
  const SVG_H = SVG_W / Math.max(aspect, 0.001);

  function toSvg(p: Point3D): { x: number; y: number } {
    const sx = ((p.x - minX + pad) / width) * SVG_W;
    const sy = SVG_H - ((p.y - minY + pad) / height) * SVG_H;
    return { x: sx, y: sy };
  }

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto bg-zinc-900 rounded">
      {polygons.map((poly, i) => {
        const points = poly.vertices.map((v) => {
          const s = toSvg(v);
          return `${s.x},${s.y}`;
        }).join(" ");
        const hue = (i * 67) % 360;
        return (
          <polygon
            key={poly.polygonId}
            points={points}
            fill={`hsl(${hue}, 70%, 50%, 0.2)`}
            stroke={`hsl(${hue}, 70%, 60%)`}
            strokeWidth="1.5"
          />
        );
      })}
      {polygons.map((poly) =>
        poly.vertices.map((v, idx) => {
          const s = toSvg(v);
          return (
            <circle
              key={`${poly.polygonId}-${idx}`}
              cx={s.x}
              cy={s.y}
              r={3}
              fill="#ffffff"
              stroke="#000"
              strokeWidth="0.5"
            />
          );
        }),
      )}
    </svg>
  );
}

function CreatePolygonDialog({ open, onOpenChange, areaId }: {
  open: boolean; onOpenChange: (open: boolean) => void; areaId: string | null;
}) {
  const createPolygon = usePolygonStore((s) => s.createPolygon);
  const [text, setText] = useState("0,0,0\n1,0,0\n1,1,0\n0,1,0");

  async function handleSubmit() {
    if (!areaId) return;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const vertices: Point3D[] = [];
    for (const line of lines) {
      const parts = line.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length < 2 || parts.some(isNaN)) {
        toast.error(`잘못된 좌표: ${line}`);
        return;
      }
      vertices.push({ x: parts[0], y: parts[1], z: parts[2] ?? 0 });
    }
    if (vertices.length < 3) {
      toast.error("최소 3개 vertex가 필요합니다.");
      return;
    }
    await createPolygon(areaId, { exterior: vertices });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>새 폴리곤</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">한 줄에 한 vertex (x,y,z). 최소 3개.</p>
          <textarea
            className="w-full h-32 rounded border bg-background px-2 py-1 text-xs font-mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>취소</Button>
            <Button className="flex-1" onClick={handleSubmit}>생성</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
