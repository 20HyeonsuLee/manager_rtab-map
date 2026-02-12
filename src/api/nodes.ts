import { springApi } from "./client";
import type { NodeResponse, NodeCreateRequest, NodeUpdateRequest } from "@/types";

export async function getNodes(floorId: string): Promise<NodeResponse[]> {
  const { data } = await springApi.get<NodeResponse[]>(`/api/v1/floors/${floorId}/nodes`);
  return data;
}

export async function createNode(floorId: string, body: NodeCreateRequest): Promise<NodeResponse> {
  const { data } = await springApi.post<NodeResponse>(`/api/v1/floors/${floorId}/nodes`, body);
  return data;
}

export async function updateNode(nodeId: string, body: NodeUpdateRequest): Promise<NodeResponse> {
  const { data } = await springApi.put<NodeResponse>(`/api/v1/nodes/${nodeId}`, body);
  return data;
}

export async function deleteNode(nodeId: string): Promise<void> {
  await springApi.delete(`/api/v1/nodes/${nodeId}`);
}
