import { useViewerStore } from "@/stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function FloorSelector() {
  const floors = useViewerStore((s) => s.floors);
  const selectedFloorId = useViewerStore((s) => s.selectedFloorId);
  const loadFloorData = useViewerStore((s) => s.loadFloorData);

  const sortedFloors = [...floors].sort((a, b) => b.level - a.level);

  function handleFloorChange(floorId: string) {
    loadFloorData(floorId);
  }

  function formatLevel(level: number): string {
    return level > 0 ? `${level}F` : `B${Math.abs(level)}F`;
  }

  return (
    <Select value={selectedFloorId || ""} onValueChange={handleFloorChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="층을 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {sortedFloors.map((floor) => (
          <SelectItem key={floor.id} value={floor.id}>
            <div className="flex items-center justify-between gap-3 w-full">
              <span>
                {formatLevel(floor.level)} — {floor.name}
              </span>
              {!floor.hasPath && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  경로 미생성
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
