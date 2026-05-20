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

  // add-vertical-stop 모드에서 사용 — 사용자가 모달로 connector 만들면 그 ID를 active로
  // 보관해 각 floor 클릭 시 같은 connector에 stop을 attach.
  activeConnectorId: string | null;
  activeConnectorType: string | null;

  fetchConnectors: (buildingId: string) => Promise<void>;
  createConnector: (buildingId: string, body: ConnectorCreateRequest) => Promise<ConnectorResponse>;
  updateConnector: (connectorId: string, body: ConnectorUpdateRequest) => Promise<ConnectorResponse>;
  deleteConnector: (connectorId: string) => Promise<void>;
  addStop: (connectorId: string, body: ConnectorStopRequest) => Promise<ConnectorStopResponse>;
  updateStop: (connectorId: string, stopId: string, body: ConnectorStopRequest) => Promise<ConnectorStopResponse>;
  removeStop: (connectorId: string, stopId: string) => Promise<void>;
  selectConnector: (connectorId: string | null) => void;

  /** 모달에서 호출 — connector 새로 생성 + active로 set. */
  startNewConnector: (buildingId: string, body: ConnectorCreateRequest) => Promise<string>;
  finishActiveConnector: () => void;

  reset: () => void;
}

const initialState = {
  connectors: [] as ConnectorResponse[],
  isLoading: false,
  buildingId: null as string | null,
  selectedConnectorId: null as string | null,
  activeConnectorId: null as string | null,
  activeConnectorType: null as string | null,
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

  startNewConnector: async (buildingId, body) => {
    const created = await api.createConnector(buildingId, body);
    set({
      connectors: [...get().connectors, created],
      activeConnectorId: created.connectorId,
      activeConnectorType: body.connectorType,
    });
    toast.success(`${body.connectorType} "${body.connectorKey}" 생성 — 각 층에서 stop을 찍어주세요`);
    return created.connectorId;
  },

  finishActiveConnector: () => set({ activeConnectorId: null, activeConnectorType: null }),

  reset: () => set(initialState),
}));
