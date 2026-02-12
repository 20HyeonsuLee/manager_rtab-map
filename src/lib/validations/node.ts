import { z } from "zod";

const nodeTypes = [
  "ENTRANCE",
  "ELEVATOR",
  "STAIRCASE",
  "RESTROOM",
  "ROOM",
  "INFORMATION",
  "EMERGENCY_EXIT",
  "OTHER",
] as const;

const point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const nodeCreateSchema = z.object({
  name: z.string().min(1, "노드 이름을 입력해주세요").max(100, "최대 100자까지 입력 가능합니다"),
  type: z.enum(nodeTypes, { required_error: "노드 유형을 선택해주세요" }),
  description: z.string().max(500, "최대 500자까지 입력 가능합니다").optional(),
  position: point3DSchema,
});

export type NodeCreateFormValues = z.infer<typeof nodeCreateSchema>;

export const nodeUpdateSchema = z.object({
  name: z.string().min(1, "노드 이름을 입력해주세요").max(100, "최대 100자까지 입력 가능합니다").optional(),
  type: z.enum(nodeTypes).optional(),
  description: z.string().max(500, "최대 500자까지 입력 가능합니다").optional(),
  position: point3DSchema.optional(),
});

export type NodeUpdateFormValues = z.infer<typeof nodeUpdateSchema>;
