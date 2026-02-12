import { create } from "zustand";
import { toast } from "sonner";
import type { NodeResponse, NodeCreateRequest, NodeUpdateRequest, Point3D } from "@/types";
import * as api from "@/api";

interface NodeStore {
  nodes: NodeResponse[];
  isLoading: boolean;
  currentFloorId: string | null;
  selectedNodeId: string | null;
  isPlacementMode: boolean;
  pendingPosition: Point3D | null;

  fetchNodes: (floorId: string) => Promise<void>;
  createNode: (floorId: string, body: NodeCreateRequest) => Promise<void>;
  updateNode: (nodeId: string, body: NodeUpdateRequest) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  setPlacementMode: (active: boolean) => void;
  setPendingPosition: (position: Point3D | null) => void;
  cancelPlacement: () => void;
  reset: () => void;
}

const initialState = {
  nodes: [] as NodeResponse[],
  isLoading: false,
  currentFloorId: null as string | null,
  selectedNodeId: null as string | null,
  isPlacementMode: false,
  pendingPosition: null as Point3D | null,
};

export const useNodeStore = create<NodeStore>((set, get) => ({
  ...initialState,

  fetchNodes: async (floorId) => {
    set({ isLoading: true, currentFloorId: floorId });
    try {
      const nodes = await api.getNodes(floorId);
      set({ nodes });
    } catch {
      set({ nodes: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createNode: async (floorId, body) => {
    try {
      await api.createNode(floorId, body);
      toast.success("노드 생성", { description: `"${body.name}" 노드가 생성되었습니다.` });
      await get().fetchNodes(floorId);
    } catch {
      // Error handled by interceptor
    }
  },

  updateNode: async (nodeId, body) => {
    const { currentFloorId } = get();
    try {
      await api.updateNode(nodeId, body);
      toast.success("노드 수정", { description: "노드가 수정되었습니다." });
      if (currentFloorId) await get().fetchNodes(currentFloorId);
    } catch {
      // Error handled by interceptor
    }
  },

  deleteNode: async (nodeId) => {
    const { currentFloorId } = get();
    try {
      await api.deleteNode(nodeId);
      toast.success("노드 삭제", { description: "노드가 삭제되었습니다." });
      set({ selectedNodeId: null });
      if (currentFloorId) await get().fetchNodes(currentFloorId);
    } catch {
      // Error handled by interceptor
    }
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setPlacementMode: (active) =>
    set({ isPlacementMode: active, pendingPosition: null, selectedNodeId: null }),

  setPendingPosition: (position) => set({ pendingPosition: position }),

  cancelPlacement: () => set({ isPlacementMode: false, pendingPosition: null }),

  reset: () => set(initialState),
}));
