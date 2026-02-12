import { create } from "zustand";
import type {
  BuildingResponse,
  BuildingDetailResponse,
  BuildingStatus,
  BuildingCreateRequest,
  BuildingUpdateRequest,
} from "@/types";
import * as api from "@/api";
import { toast } from "sonner";

interface BuildingStore {
  buildings: BuildingResponse[];
  currentBuilding: BuildingDetailResponse | null;
  isLoading: boolean;
  statusFilter: BuildingStatus | undefined;

  setStatusFilter: (status: BuildingStatus | undefined) => void;
  fetchBuildings: (status?: BuildingStatus) => Promise<void>;
  fetchBuildingDetail: (id: string) => Promise<void>;
  createBuilding: (data: BuildingCreateRequest) => Promise<BuildingResponse>;
  updateBuilding: (id: string, data: BuildingUpdateRequest) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  updateBuildingStatus: (id: string, status: BuildingStatus) => Promise<void>;
  clearCurrentBuilding: () => void;
}

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  buildings: [],
  currentBuilding: null,
  isLoading: false,
  statusFilter: undefined,

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().fetchBuildings(status);
  },

  fetchBuildings: async (status) => {
    set({ isLoading: true });
    try {
      const buildings = await api.getBuildings(status);
      set({ buildings });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBuildingDetail: async (id) => {
    set({ isLoading: true });
    try {
      const building = await api.getBuildingDetail(id);
      set({ currentBuilding: building });
    } finally {
      set({ isLoading: false });
    }
  },

  createBuilding: async (data) => {
    const building = await api.createBuilding(data);
    toast.success("건물이 생성되었습니다.");
    await get().fetchBuildings(get().statusFilter);
    return building;
  },

  updateBuilding: async (id, data) => {
    await api.updateBuilding(id, data);
    toast.success("건물 정보가 수정되었습니다.");
    await get().fetchBuildingDetail(id);
  },

  deleteBuilding: async (id) => {
    await api.deleteBuilding(id);
    toast.success("건물이 삭제되었습니다.");
    set({ currentBuilding: null });
  },

  updateBuildingStatus: async (id, status) => {
    await api.updateBuildingStatus(id, status);
    toast.success("건물 상태가 변경되었습니다.");
    await get().fetchBuildingDetail(id);
  },

  clearCurrentBuilding: () => set({ currentBuilding: null }),
}));
