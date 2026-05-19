import { create } from "zustand";
import { toast } from "sonner";
import * as api from "@/api";
import type { PolygonResponse, PolygonRequest } from "@/types";

interface PolygonStore {
  polygons: PolygonResponse[];
  isLoading: boolean;
  areaId: string | null;
  selectedPolygonId: string | null;

  fetchPolygons: (areaId: string) => Promise<void>;
  createPolygon: (areaId: string, body: PolygonRequest) => Promise<PolygonResponse>;
  updatePolygon: (polygonId: string, body: PolygonRequest) => Promise<PolygonResponse>;
  deletePolygon: (polygonId: string) => Promise<void>;
  selectPolygon: (polygonId: string | null) => void;
  reset: () => void;
}

const initialState = {
  polygons: [] as PolygonResponse[],
  isLoading: false,
  areaId: null as string | null,
  selectedPolygonId: null as string | null,
};

export const usePolygonStore = create<PolygonStore>((set, get) => ({
  ...initialState,

  fetchPolygons: async (areaId) => {
    set({ isLoading: true, areaId });
    try {
      const polygons = await api.listPolygons(areaId);
      set({ polygons, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createPolygon: async (areaId, body) => {
    const newPolygon = await api.createPolygon(areaId, body);
    set({ polygons: [...get().polygons, newPolygon] });
    toast.success("폴리곤이 생성되었습니다.");
    return newPolygon;
  },

  updatePolygon: async (polygonId, body) => {
    const updated = await api.updatePolygon(polygonId, body);
    set({ polygons: get().polygons.map((p) => (p.polygonId === polygonId ? updated : p)) });
    toast.success("폴리곤이 수정되었습니다.");
    return updated;
  },

  deletePolygon: async (polygonId) => {
    await api.deletePolygon(polygonId);
    set({
      polygons: get().polygons.filter((p) => p.polygonId !== polygonId),
      selectedPolygonId: get().selectedPolygonId === polygonId ? null : get().selectedPolygonId,
    });
    toast.success("폴리곤이 삭제되었습니다.");
  },

  selectPolygon: (polygonId) => set({ selectedPolygonId: polygonId }),

  reset: () => set(initialState),
}));
