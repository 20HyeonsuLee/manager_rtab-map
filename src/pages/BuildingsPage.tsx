import { useEffect } from "react";
import { Building2, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuildingStore } from "@/stores";
import { BuildingCard, CreateBuildingDialog } from "@/components/building";
import type { BuildingStatus } from "@/types";

const statusTabs: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "DRAFT", label: "초안" },
  { value: "PROCESSING", label: "처리 중" },
  { value: "ACTIVE", label: "활성" },
];

export default function BuildingsPage() {
  const { buildings, isLoading, statusFilter, fetchBuildings, setStatusFilter } = useBuildingStore();

  useEffect(() => {
    fetchBuildings(statusFilter);
  }, []);

  function handleTabChange(value: string) {
    const status = value === "ALL" ? undefined : (value as BuildingStatus);
    setStatusFilter(status);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">건물 관리</h1>
          <p className="text-muted-foreground">등록된 건물을 관리하고 실내 구조를 설정합니다.</p>
        </div>
        <CreateBuildingDialog />
      </div>

      <Tabs value={statusFilter || "ALL"} onValueChange={handleTabChange}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">건물이 없습니다</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            새 건물을 추가하여 실내 네비게이션을 시작하세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      )}
    </div>
  );
}
