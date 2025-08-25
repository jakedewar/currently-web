import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  variant?: "default" | "compact" | "minimal";
  className?: string;
}

export function PriorityBadge({ priority, variant = "default", className }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return {
          color: "bg-red-500",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          bgColor: "bg-red-50",
          label: "High",
          description: "Urgent - requires immediate attention"
        };
      case "medium":
        return {
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          bgColor: "bg-yellow-50",
          label: "Medium",
          description: "Important - should be completed soon"
        };
      case "low":
        return {
          color: "bg-green-500",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          bgColor: "bg-green-50",
          label: "Low",
          description: "Nice to have - can be done later"
        };
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          bgColor: "bg-gray-50",
          label: "Unknown",
          description: "Priority level not set"
        };
    }
  };

  const config = getPriorityConfig(priority);

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs px-2 py-0.5 h-5 font-normal flex items-center gap-1.5",
          config.bgColor,
          config.textColor,
          config.borderColor,
          className
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs px-2 py-1 font-medium flex items-center gap-1.5",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", config.color)} />
      {config.label}
    </Badge>
  );
}
