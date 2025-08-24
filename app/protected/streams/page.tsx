'use client'

import { StreamsList } from "@/components/streams/streams-list"
import { useCallback, useEffect, useState } from "react"
import type { StreamsData } from "@/lib/data/streams"
import { useOrganization } from "@/components/organization-provider"
import { CreateStreamDialog } from "@/components/streams/create-stream-dialog"


export default function StreamsPage() {
  const [streamsData, setStreamsData] = useState<StreamsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useOrganization()


  const fetchStreams = useCallback(async () => {
    if (!currentOrganization) {
      setError('Please select an organization')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/streams?organizationId=${currentOrganization.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch streams')
      }

      setStreamsData(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching streams:', err)
      setError(err instanceof Error ? err.message : 'Failed to load streams')
    } finally {
      setLoading(false)
    }
  }, [currentOrganization])

  useEffect(() => {
    fetchStreams()
  }, [currentOrganization, fetchStreams])

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-muted-foreground">
              Please select an organization to view streams
            </p>
          </div>
          <CreateStreamDialog onStreamCreated={fetchStreams} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-muted-foreground">
              Loading streams...
            </p>
          </div>
          <CreateStreamDialog onStreamCreated={fetchStreams} />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-6 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-muted-foreground">
              {error}
            </p>
          </div>
          <CreateStreamDialog onStreamCreated={fetchStreams} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
          <p className="text-muted-foreground">
            Manage {currentOrganization.name}&apos;s work streams and track progress
          </p>
        </div>
        <CreateStreamDialog onStreamCreated={fetchStreams} />
      </div>

      {streamsData && <StreamsList data={streamsData} />}
    </div>
  )
}