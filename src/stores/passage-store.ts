import { create } from "zustand";
import type {
  VerticalPassageResponse,
  VerticalPassageDetailResponse,
  VerticalPassageType,
} from "@/types";
import * as api from "@/api";

interface PassageStore {
  passages: VerticalPassageResponse[];
  currentPassage: VerticalPassageDetailResponse | null;
  isLoading: boolean;
  typeFilter: VerticalPassageType | undefined;

  setTypeFilter: (type: VerticalPassageType | undefined) => void;
  fetchPassages: (buildingId: string, type?: VerticalPassageType) => Promise<void>;
  fetchPassageDetail: (passageId: string) => Promise<void>;
  clearCurrentPassage: () => void;
}

export const usePassageStore = create<PassageStore>((set) => ({
  passages: [],
  currentPassage: null,
  isLoading: false,
  typeFilter: undefined,

  setTypeFilter: (type) => set({ typeFilter: type }),

  fetchPassages: async (buildingId, type) => {
    set({ isLoading: true });
    try {
      const passages = await api.getPassages(buildingId, type);
      set({ passages });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPassageDetail: async (passageId) => {
    set({ isLoading: true });
    try {
      const passage = await api.getPassageDetail(passageId);
      set({ currentPassage: passage });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCurrentPassage: () => set({ currentPassage: null }),
}));
