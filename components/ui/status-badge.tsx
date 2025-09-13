import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CircleCheck, Circle, AlertCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "compact" | "minimal";
  className?: string;
}

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          icon: <Clock className="h-3 w-3 text-blue-500" />,
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          bgColor: "bg-blue-50",
          label: "",
          variant: "outline" as const
        };
      case "completed":
        return {
          icon: <CircleCheck className="h-3 w-3 text-green-500" />,
          textColor: "text-green-700",
          borderColor: "border-green-200",
          bgColor: "bg-green-50",
          label: "Completed",
          variant: "default" as const
        };
      case "paused":
        return {
          icon: <AlertCircle className="h-3 w-3 text-yellow-500" />,
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          bgColor: "bg-yellow-50",
          label: "Paused",
          variant: "outline" as const
        };
      case "archived":
        return {
          icon: <XCircle className="h-3 w-3 text-gray-500" />,
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          bgColor: "bg-gray-50",
          label: "Archived",
          variant: "secondary" as const
        };
      default:
        return {
          icon: <Circle className="h-3 w-3 text-gray-400" />,
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          bgColor: "bg-gray-50",
          label: status.charAt(0).toUpperCase() + status.slice(1),
          variant: "outline" as const
        };
    }
  };

  const config = getStatusConfig(status);

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {config.icon}
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Badge 
        variant={config.variant}
        className={cn(
          "text-xs px-2 py-0.5 h-5 font-normal flex items-center gap-1.5",
          config.bgColor,
          config.textColor,
          config.borderColor,
          className
        )}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "text-xs px-2 py-1 font-medium flex items-center gap-1.5",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
