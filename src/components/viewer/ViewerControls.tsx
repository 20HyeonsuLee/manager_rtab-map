import { Orbit, Scan, Eye, Route, MapPinned, Layers, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import { useViewerStore, useNodeStore } from "@/stores";
import { FloorSelector } from "./FloorSelector";

export function ViewerControls() {
  const pointSize = useViewerStore((s) => s.pointSize);
  const setPointSize = useViewerStore((s) => s.setPointSize);
  const showPath = useViewerStore((s) => s.showPath);
  const setShowPath = useViewerStore((s) => s.setShowPath);
  const showPOI = useViewerStore((s) => s.showPOI);
  const setShowPOI = useViewerStore((s) => s.setShowPOI);
  const viewMode = useViewerStore((s) => s.viewMode);
  const setViewMode = useViewerStore((s) => s.setViewMode);
  const isLoadingPointCloud = useViewerStore((s) => s.isLoadingPointCloud);
  const pointCloudProgress = useViewerStore((s) => s.pointCloudProgress);
  const floorPath = useViewerStore((s) => s.floorPath);
  const nodes = useNodeStore((s) => s.nodes);
  const isPlacementMode = useNodeStore((s) => s.isPlacementMode);
  const setPlacementMode = useNodeStore((s) => s.setPlacementMode);
  const cancelPlacement = useNodeStore((s) => s.cancelPlacement);

  return (
    <Card className="w-72 shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">뷰어 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Floor Selector */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            층 선택
          </Label>
          <FloorSelector />
        </div>

        <Separator />

        {/* Loading Progress */}
        {isLoadingPointCloud && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              포인트클라우드 로딩 중...
            </Label>
            <Progress value={pointCloudProgress} className="h-2" />
            <p className="text-[11px] text-muted-foreground text-right">
              {pointCloudProgress}%
            </p>
          </div>
        )}

        {/* Point Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              포인트 크기
            </Label>
            <span className="text-xs font-mono text-muted-foreground">
              {pointSize.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[pointSize]}
            onValueChange={([v]) => setPointSize(v)}
            min={0.1}
            max={5.0}
            step={0.1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Visibility Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-path" className="flex items-center gap-2 text-xs">
              <Route className="h-3.5 w-3.5 text-cyan-400" />
              경로 표시
            </Label>
            <Switch
              id="show-path"
              checked={showPath}
              onCheckedChange={setShowPath}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-poi" className="flex items-center gap-2 text-xs">
              <MapPinned className="h-3.5 w-3.5 text-amber-400" />
              POI 마커
            </Label>
            <Switch
              id="show-poi"
              checked={showPOI}
              onCheckedChange={(checked) => {
                setShowPOI(checked);
                if (!checked) cancelPlacement();
              }}
            />
          </div>

          {showPOI && (
            <div className="space-y-2 pl-5">
              <p className="text-[11px] text-muted-foreground">
                노드: <span className="font-mono font-medium text-foreground">{nodes.length}개</span>
              </p>
              {isPlacementMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={cancelPlacement}
                  >
                    <X className="mr-1 h-3 w-3" />
                    배치 취소
                  </Button>
                  <p className="text-[10px] text-amber-500">
                    포인트클라우드를 클릭하여 노드를 배치하세요
                  </p>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setPlacementMode(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  노드 배치
                </Button>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* View Mode */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            뷰 모드
          </Label>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => {
              if (v) setViewMode(v as "orbit" | "top-down" | "first-person");
            }}
            className="w-full"
          >
            <ToggleGroupItem value="orbit" className="flex-1 text-xs gap-1">
              <Orbit className="h-3.5 w-3.5" />
              궤도
            </ToggleGroupItem>
            <ToggleGroupItem value="top-down" className="flex-1 text-xs gap-1">
              <Scan className="h-3.5 w-3.5" />
              탑뷰
            </ToggleGroupItem>
            <ToggleGroupItem value="first-person" className="flex-1 text-xs gap-1">
              <Eye className="h-3.5 w-3.5" />
              1인칭
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Path Info */}
        {floorPath && floorPath.segments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>총 거리: <span className="font-mono font-medium text-foreground">{floorPath.totalDistance.toFixed(2)}m</span></p>
              <p>세그먼트: <span className="font-mono font-medium text-foreground">{floorPath.segments.length}개</span></p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
