import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useViewerStore } from "@/stores";

export function PointCloudRenderer() {
  const pointCloudData = useViewerStore((s) => s.pointCloudData);
  const pointSize = useViewerStore((s) => s.pointSize);
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    if (!pointCloudData) return null;

    try {
      const result = parsePLY(pointCloudData);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(result.positions, 3));

      if (result.colors.length > 0) {
        geo.setAttribute("color", new THREE.Float32BufferAttribute(result.colors, 3));
      }

      geo.computeBoundingBox();
      return geo;
    } catch (err) {
      console.error("Failed to parse PLY:", err);
      return null;
    }
  }, [pointCloudData]);

  if (!geometry) return null;

  const hasColors = geometry.getAttribute("color") !== undefined;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={pointSize * 0.01}
        sizeAttenuation
        vertexColors={hasColors}
        color={hasColors ? undefined : "#8b9cf7"}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}

interface PLYResult {
  positions: number[];
  colors: number[];
}

function parsePLY(buffer: ArrayBuffer): PLYResult {
  const decoder = new TextDecoder();
  const text = decoder.decode(buffer);

  const headerEnd = text.indexOf("end_header");
  if (headerEnd === -1) {
    throw new Error("Invalid PLY file: missing end_header");
  }

  const header = text.substring(0, headerEnd);
  const lines = header.split("\n");

  let vertexCount = 0;
  let isBinary = false;
  const properties: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("element vertex")) {
      vertexCount = parseInt(trimmed.split(" ")[2], 10);
    } else if (trimmed.startsWith("property")) {
      const parts = trimmed.split(" ");
      properties.push(parts[parts.length - 1]);
    } else if (trimmed.startsWith("format binary")) {
      isBinary = true;
    }
  }

  const xIdx = properties.indexOf("x");
  const yIdx = properties.indexOf("y");
  const zIdx = properties.indexOf("z");
  const rIdx = properties.indexOf("red");
  const gIdx = properties.indexOf("green");
  const bIdx = properties.indexOf("blue");
  const hasColor = rIdx !== -1 && gIdx !== -1 && bIdx !== -1;

  const positions: number[] = [];
  const colors: number[] = [];

  if (isBinary) {
    const headerBytes = new TextEncoder().encode(text.substring(0, headerEnd + "end_header\n".length));
    const dataView = new DataView(buffer, headerBytes.byteLength);
    const bytesPerVertex = properties.length * 4;

    for (let i = 0; i < vertexCount; i++) {
      const offset = i * bytesPerVertex;
      positions.push(
        dataView.getFloat32(offset + xIdx * 4, true),
        dataView.getFloat32(offset + zIdx * 4, true),
        dataView.getFloat32(offset + yIdx * 4, true),
      );
      if (hasColor) {
        colors.push(
          dataView.getUint8(offset + rIdx * 4) / 255,
          dataView.getUint8(offset + gIdx * 4) / 255,
          dataView.getUint8(offset + bIdx * 4) / 255,
        );
      }
    }
  } else {
    const bodyStart = headerEnd + "end_header".length;
    const body = text.substring(bodyStart).trim();
    const bodyLines = body.split("\n");

    const limit = Math.min(vertexCount, bodyLines.length);
    for (let i = 0; i < limit; i++) {
      const values = bodyLines[i].trim().split(/\s+/);
      if (values.length < properties.length) continue;

      positions.push(
        parseFloat(values[xIdx]),
        parseFloat(values[zIdx]),
        parseFloat(values[yIdx]),
      );
      if (hasColor) {
        colors.push(
          parseFloat(values[rIdx]) / 255,
          parseFloat(values[gIdx]) / 255,
          parseFloat(values[bIdx]) / 255,
        );
      }
    }
  }

  return { positions, colors };
}
