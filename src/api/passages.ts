import { springApi } from "./client";
import type { VerticalPassageResponse, VerticalPassageDetailResponse, VerticalPassageType } from "@/types";

export async function getPassages(
  buildingId: string,
  type?: VerticalPassageType,
): Promise<VerticalPassageResponse[]> {
  const params = type ? { type } : {};
  const { data } = await springApi.get<VerticalPassageResponse[]>(
    `/api/v1/buildings/${buildingId}/passages`,
    { params },
  );
  return data;
}

export async function getPassageDetail(passageId: string): Promise<VerticalPassageDetailResponse> {
  const { data } = await springApi.get<VerticalPassageDetailResponse>(`/api/v1/passages/${passageId}`);
  return data;
}
