import { create } from "zustand";
import { toast } from "sonner";
import { getFloorPath } from "@/api/floors";
import { getPointCloud } from "@/api/pointcloud";
import type { FloorPathResponse, FloorResponse } from "@/types";

type ViewMode = "orbit" | "top-down" | "first-person";

interface ViewerState {
  selectedFloorId: string | null;
  floors: FloorResponse[];
  floorPath: FloorPathResponse | null;
  pointCloudData: ArrayBuffer | null;
  isLoadingPath: boolean;
  isLoadingPointCloud: boolean;
  pointCloudProgress: number;
  pointSize: number;
  showPath: boolean;
  showPOI: boolean;
  viewMode: ViewMode;

  setFloors: (floors: FloorResponse[]) => void;
  selectFloor: (floorId: string) => void;
  setPointSize: (size: number) => void;
  setShowPath: (show: boolean) => void;
  setShowPOI: (show: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  loadFloorData: (floorId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  selectedFloorId: null as string | null,
  floors: [] as FloorResponse[],
  floorPath: null as FloorPathResponse | null,
  pointCloudData: null as ArrayBuffer | null,
  isLoadingPath: false,
  isLoadingPointCloud: false,
  pointCloudProgress: 0,
  pointSize: 1.0,
  showPath: true,
  showPOI: false,
  viewMode: "orbit" as ViewMode,
};

export const useViewerStore = create<ViewerState>((set) => ({
  ...initialState,

  setFloors: (floors) => set({ floors }),

  selectFloor: (floorId) => {
    set({ selectedFloorId: floorId, floorPath: null, pointCloudData: null });
  },

  setPointSize: (size) => set({ pointSize: size }),
  setShowPath: (show) => set({ showPath: show }),
  setShowPOI: (show) => set({ showPOI: show }),
  setViewMode: (mode) => set({ viewMode: mode }),

  loadFloorData: async (floorId) => {
    set({
      selectedFloorId: floorId,
      isLoadingPath: true,
      isLoadingPointCloud: true,
      pointCloudProgress: 0,
      floorPath: null,
      pointCloudData: null,
    });

    try {
      const pathData = await getFloorPath(floorId);
      set({ floorPath: pathData, isLoadingPath: false });
    } catch {
      set({ isLoadingPath: false });
    }

    try {
      const plyData = await getPointCloud(floorId, (progress) => {
        set({ pointCloudProgress: progress });
      });
      set({ pointCloudData: plyData, isLoadingPointCloud: false, pointCloudProgress: 100 });
    } catch {
      set({ isLoadingPointCloud: false });
      toast.info("포인트클라우드", { description: "포인트클라우드 데이터를 로드할 수 없습니다." });
    }
  },

  reset: () => set(initialState),
}));
