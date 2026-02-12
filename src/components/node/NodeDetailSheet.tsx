import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { nodeUpdateSchema, type NodeUpdateFormValues } from "@/lib/validations/node";
import { useNodeStore } from "@/stores";
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

const NODE_LABELS: Record<NodeType, string> = {
  ENTRANCE: "출입구",
  ELEVATOR: "엘리베이터",
  STAIRCASE: "계단",
  RESTROOM: "화장실",
  ROOM: "방",
  INFORMATION: "안내",
  EMERGENCY_EXIT: "비상구",
  OTHER: "기타",
};

interface NodeDetailSheetProps {
  nodeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeDetailSheet({ nodeId, open, onOpenChange }: NodeDetailSheetProps) {
  const nodes = useNodeStore((s) => s.nodes);
  const updateNode = useNodeStore((s) => s.updateNode);
  const deleteNode = useNodeStore((s) => s.deleteNode);
  const [isEditing, setIsEditing] = useState(false);

  const node = nodes.find((n) => n.id === nodeId) ?? null;

  const form = useForm<NodeUpdateFormValues>({
    resolver: zodResolver(nodeUpdateSchema) as Resolver<NodeUpdateFormValues>,
  });

  useEffect(() => {
    if (node && open) {
      form.reset({
        name: node.name,
        type: node.type,
        description: node.description || "",
        position: node.position,
      });
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, open]);

  async function onSubmit(values: NodeUpdateFormValues) {
    if (!nodeId) return;
    try {
      await updateNode(nodeId, {
        name: values.name,
        type: values.type,
        description: values.description || undefined,
        position: values.position,
      });
      setIsEditing(false);
    } catch {
      // Error handled by interceptor
    }
  }

  async function handleDelete() {
    if (!nodeId) return;
    await deleteNode(nodeId);
    onOpenChange(false);
  }

  function formatPoint(point: { x: number; y: number; z: number }): string {
    return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            노드 상세
          </SheetTitle>
          <SheetDescription>노드의 정보를 확인하고 수정합니다.</SheetDescription>
        </SheetHeader>

        {!node ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isEditing ? (
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>유형</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                        <Input {...field} />
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
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                  <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">이름</span>
                <span className="text-sm font-medium">{node.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">유형</span>
                <Badge variant="outline">{NODE_LABELS[node.type]}</Badge>
              </div>
              {node.description && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">설명</span>
                  <span className="text-sm">{node.description}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">좌표</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {formatPoint(node.position)}
                </code>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                수정
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>노드 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      "{node.name}" 노드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
