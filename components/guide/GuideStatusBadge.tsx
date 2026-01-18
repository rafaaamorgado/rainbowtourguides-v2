import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

type GuideStatus = Database["public"]["Enums"]["guide_status"];

type GuideStatusBadgeProps = {
  status: GuideStatus;
};

const statusConfig: Record<GuideStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending Review", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function GuideStatusBadge({ status }: GuideStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

