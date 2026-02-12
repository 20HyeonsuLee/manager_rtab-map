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
import { buildingUpdateSchema, type BuildingUpdateFormValues } from "@/lib/validations/building";
import { useBuildingStore } from "@/stores";
import type { BuildingDetailResponse } from "@/types";

interface EditBuildingDialogProps {
  building: BuildingDetailResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBuildingDialog({ building, open, onOpenChange }: EditBuildingDialogProps) {
  const updateBuilding = useBuildingStore((s) => s.updateBuilding);

  const form = useForm<BuildingUpdateFormValues>({
    resolver: zodResolver(buildingUpdateSchema) as Resolver<BuildingUpdateFormValues>,
    defaultValues: {
      name: building.name,
      description: building.description || "",
      latitude: building.latitude,
      longitude: building.longitude,
    },
  });

  async function onSubmit(values: BuildingUpdateFormValues) {
    try {
      await updateBuilding(building.id, {
        name: values.name || undefined,
        description: values.description || undefined,
        latitude: typeof values.latitude === "number" ? values.latitude : undefined,
        longitude: typeof values.longitude === "number" ? values.longitude : undefined,
      });
      onOpenChange(false);
    } catch {
      // Error handled by interceptor
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>건물 정보 수정</DialogTitle>
          <DialogDescription>건물의 기본 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>건물 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 공학관" {...field} />
                  </FormControl>
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
                    <Input placeholder="건물에 대한 설명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>위도</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>경도</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
