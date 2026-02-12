import { fastApi } from "./client";

export async function getPointCloud(
  sessionId: string,
  onProgress?: (progress: number) => void,
): Promise<ArrayBuffer> {
  const { data } = await fastApi.get<ArrayBuffer>(`/api/v1/pointcloud/${sessionId}`, {
    responseType: "arraybuffer",
    timeout: 60000,
    onDownloadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}
