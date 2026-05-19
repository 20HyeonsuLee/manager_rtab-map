import { create } from "zustand";
import { toast } from "sonner";
import * as api from "@/api";
import type {
  ConnectorResponse,
  ConnectorStopResponse,
  ConnectorCreateRequest,
  ConnectorUpdateRequest,
  ConnectorStopRequest,
} from "@/types";

interface ConnectorStore {
  connectors: ConnectorResponse[];
  isLoading: boolean;
  buildingId: string | null;
  selectedConnectorId: string | null;

  fetchConnectors: (buildingId: string) => Promise<void>;
  createConnector: (buildingId: string, body: ConnectorCreateRequest) => Promise<ConnectorResponse>;
  updateConnector: (connectorId: string, body: ConnectorUpdateRequest) => Promise<ConnectorResponse>;
  deleteConnector: (connectorId: string) => Promise<void>;
  addStop: (connectorId: string, body: ConnectorStopRequest) => Promise<ConnectorStopResponse>;
  updateStop: (connectorId: string, stopId: string, body: ConnectorStopRequest) => Promise<ConnectorStopResponse>;
  removeStop: (connectorId: string, stopId: string) => Promise<void>;
  selectConnector: (connectorId: string | null) => void;
  reset: () => void;
}

const initialState = {
  connectors: [] as ConnectorResponse[],
  isLoading: false,
  buildingId: null as string | null,
  selectedConnectorId: null as string | null,
};

export const useConnectorStore = create<ConnectorStore>((set, get) => ({
  ...initialState,

  fetchConnectors: async (buildingId) => {
    set({ isLoading: true, buildingId });
    try {
      const connectors = await api.listConnectors(buildingId);
      set({ connectors, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createConnector: async (buildingId, body) => {
    const newConnector = await api.createConnector(buildingId, body);
    set({ connectors: [...get().connectors, newConnector] });
    toast.success("수직 연결이 생성되었습니다.");
    return newConnector;
  },

  updateConnector: async (connectorId, body) => {
    const updated = await api.updateConnector(connectorId, body);
    set({ connectors: get().connectors.map((c) => (c.connectorId === connectorId ? updated : c)) });
    toast.success("수직 연결이 수정되었습니다.");
    return updated;
  },

  deleteConnector: async (connectorId) => {
    await api.deleteConnector(connectorId);
    set({
      connectors: get().connectors.filter((c) => c.connectorId !== connectorId),
      selectedConnectorId: get().selectedConnectorId === connectorId ? null : get().selectedConnectorId,
    });
    toast.success("수직 연결이 삭제되었습니다.");
  },

  addStop: async (connectorId, body) => {
    const newStop = await api.addConnectorStop(connectorId, body);
    set({
      connectors: get().connectors.map((c) =>
        c.connectorId === connectorId ? { ...c, stops: [...c.stops, newStop] } : c,
      ),
    });
    toast.success("Stop이 추가되었습니다.");
    return newStop;
  },

  updateStop: async (connectorId, stopId, body) => {
    const updated = await api.updateConnectorStop(stopId, body);
    set({
      connectors: get().connectors.map((c) =>
        c.connectorId === connectorId
          ? { ...c, stops: c.stops.map((s) => (s.stopId === stopId ? updated : s)) }
          : c,
      ),
    });
    toast.success("Stop이 수정되었습니다.");
    return updated;
  },

  removeStop: async (connectorId, stopId) => {
    await api.removeConnectorStop(stopId);
    set({
      connectors: get().connectors.map((c) =>
        c.connectorId === connectorId
          ? { ...c, stops: c.stops.filter((s) => s.stopId !== stopId) }
          : c,
      ),
    });
    toast.success("Stop이 삭제되었습니다.");
  },

  selectConnector: (connectorId) => set({ selectedConnectorId: connectorId }),

  reset: () => set(initialState),
}));
