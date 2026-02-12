import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { buildingCreateSchema, type BuildingCreateFormValues } from "@/lib/validations/building";
import { useBuildingStore } from "@/stores";

export function CreateBuildingDialog() {
  const [open, setOpen] = useState(false);
  const createBuilding = useBuildingStore((s) => s.createBuilding);

  const form = useForm<BuildingCreateFormValues>({
    resolver: zodResolver(buildingCreateSchema) as Resolver<BuildingCreateFormValues>,
    defaultValues: {
      name: "",
      description: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  async function onSubmit(values: BuildingCreateFormValues) {
    try {
      await createBuilding({
        name: values.name,
        description: values.description || undefined,
        latitude: typeof values.latitude === "number" ? values.latitude : undefined,
        longitude: typeof values.longitude === "number" ? values.longitude : undefined,
      });
      form.reset();
      setOpen(false);
    } catch {
      // Error handled by interceptor
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          건물 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 건물 생성</DialogTitle>
          <DialogDescription>건물의 기본 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>건물 이름 *</FormLabel>
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
                    <Input placeholder="건물에 대한 설명을 입력해주세요" {...field} />
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
                        placeholder="37.5665"
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
                        placeholder="126.9780"
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
