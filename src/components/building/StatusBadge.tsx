import type { BuildingStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: BuildingStatus;
}

const statusConfig: Record<BuildingStatus, { label: string; className: string; variant: "default" | "secondary" | "outline" }> = {
  DRAFT: {
    label: "초안",
    className: "",
    variant: "secondary",
  },
  PROCESSING: {
    label: "처리 중",
    className: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    variant: "outline",
  },
  ACTIVE: {
    label: "활성",
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    variant: "outline",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
