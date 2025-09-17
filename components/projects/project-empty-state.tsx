"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus } from "lucide-react";

interface ProjectEmptyStateProps {
  emptyState: {
    title: string;
    description: string;
  };
}

export function ProjectEmptyState({ emptyState }: ProjectEmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {emptyState.title}
        </h3>
        <p className="text-muted-foreground mb-4">
          {emptyState.description}
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </CardContent>
    </Card>
  );
}
