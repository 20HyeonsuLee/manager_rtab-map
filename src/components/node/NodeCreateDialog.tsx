import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nodeCreateSchema, type NodeCreateFormValues } from "@/lib/validations/node";
import { useNodeStore, useViewerStore } from "@/stores";
import type { NodeType } from "@/types";

const NODE_TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: "ENTRANCE", label: "출입구" },
  { value: "ELEVATOR", label: "엘리베이터" },
  { value: "STAIRCASE", label: "계단" },
  { value: "RESTROOM", label: "화장실" },
  { value: "ROOM", label: "방" },
  { value: "INFORMATION", label: "안내" },
  { value: "EMERGENCY_EXIT", label: "비상구" },
  { value: "OTHER", label: "기타" },
];

export function NodeCreateDialog() {
  const pendingPosition = useNodeStore((s) => s.pendingPosition);
  const setPendingPosition = useNodeStore((s) => s.setPendingPosition);
  const createNode = useNodeStore((s) => s.createNode);
  const cancelPlacement = useNodeStore((s) => s.cancelPlacement);
  const selectedFloorId = useViewerStore((s) => s.selectedFloorId);

  const open = pendingPosition !== null;

  const form = useForm<NodeCreateFormValues>({
    resolver: zodResolver(nodeCreateSchema) as Resolver<NodeCreateFormValues>,
    defaultValues: {
      name: "",
      type: "OTHER",
      description: "",
      position: { x: 0, y: 0, z: 0 },
    },
  });

  useEffect(() => {
    if (pendingPosition) {
      form.setValue("position", pendingPosition);
    }
  }, [pendingPosition, form]);

  async function onSubmit(values: NodeCreateFormValues) {
    if (!selectedFloorId) return;
    try {
      await createNode(selectedFloorId, {
        name: values.name,
        type: values.type,
        description: values.description || undefined,
        position: values.position,
      });
      form.reset();
      cancelPlacement();
    } catch {
      // Error handled by interceptor
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      form.reset();
      setPendingPosition(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 노드 생성</DialogTitle>
          <DialogDescription>노드의 정보를 입력해주세요. 좌표를 직접 수정할 수도 있습니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 1층 정문" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>유형 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NODE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Input placeholder="노드에 대한 설명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>좌표</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="position.x"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="X"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position.y"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Y"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position.z"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Z"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">API 좌표 (x, y, z)</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
