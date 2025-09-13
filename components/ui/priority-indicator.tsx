import { ArrowUp, ArrowDown, Minus, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityIndicatorProps {
  priority: string;
  className?: string;
}

export function PriorityIndicator({ priority, className }: PriorityIndicatorProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return {
          icon: Flame,
          color: "text-red-500",
          description: "Urgent Priority"
        };
      case "high":
        return {
          icon: ArrowUp,
          color: "text-orange-500",
          description: "High Priority"
        };
      case "medium":
        return {
          icon: Minus,
          color: "text-yellow-500",
          description: "Medium Priority"
        };
      case "low":
        return {
          icon: ArrowDown,
          color: "text-green-500",
          description: "Low Priority"
        };
      default:
        return {
          icon: Minus,
          color: "text-yellow-500",
          description: "Default Priority"
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <div 
      className={cn("flex items-center gap-1.5", className)}
      title={config.description}
    >
      <Icon className={cn("h-3 w-3", config.color)} />
      <span className="text-xs font-medium text-muted-foreground">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </div>
  );
}
