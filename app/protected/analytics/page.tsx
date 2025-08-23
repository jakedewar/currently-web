import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getStreamsData } from "@/lib/data/streams";
import { StreamsList } from "@/components/streams/streams-list";

export default async function AnalyticsPage() {
  const streamsData = await getStreamsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s work streams and track progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Stream
        </Button>
      </div>

      <StreamsList data={streamsData} />
    </div>
  );
}

