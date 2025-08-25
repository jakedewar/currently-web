'use client'

import { StreamsList } from "@/components/streams/streams-list"
import { useOrganization } from "@/components/organization-provider"
import { CreateStreamDialog } from "@/components/streams/create-stream-dialog"
import { LoadingStream } from "@/components/streams/loading-stream"
import { Accordion } from "@/components/ui/accordion"
import { useStreams } from "@/hooks/use-streams"

export default function StreamsPage() {
  const { currentOrganization } = useOrganization()
  
  // Use React Query hook for streams data
  const { data: streamsData, isLoading, error, refetch } = useStreams(currentOrganization?.id)

  if (!currentOrganization) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Please select an organization to view streams
            </p>
          </div>
          <CreateStreamDialog onStreamCreated={() => refetch()} />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Loading streams...
            </p>
          </div>
          <CreateStreamDialog onStreamCreated={() => refetch()} />
        </div>
        <Accordion type="multiple" className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <LoadingStream key={i} />
          ))}
        </Accordion>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load streams'}
            </p>
          </div>
          <CreateStreamDialog onStreamCreated={() => refetch()} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Streams</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your team&apos;s work streams and track progress
          </p>
        </div>
        <CreateStreamDialog onStreamCreated={() => refetch()} />
      </div>
      
      {streamsData && <StreamsList data={streamsData} />}
    </div>
  )
}