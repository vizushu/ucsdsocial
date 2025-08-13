"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode } from "@/lib/supabase"
import DiscordSidebar from "@/components/discord-sidebar"
import EnhancedChatChannel from "@/components/enhanced-chat-channel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Channel {
  id: string
  name: string
  type: string
  category_id?: string
  topic?: string
  position: number
}

interface Community {
  id: string
  name: string
  description: string
  icon: string
  member_count: number
  created_at: string
  created_by: string
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface CommunityPageProps {
  community: Community
  user: User
  onBack: () => void
  onLogout: () => void
}

export default function CommunityPage({ community, user, onBack, onLogout }: CommunityPageProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDefaultChannel()
  }, [community.id])

  const loadDefaultChannel = async () => {
    try {
      if (isDemoMode() || !supabase) {
        // Use demo data - select first channel
        const defaultChannel = {
          id: "demo-general",
          name: "general",
          type: "text",
          category_id: "demo-general-cat",
          topic: "General discussion about the trip",
          position: 0,
        }
        setSelectedChannel(defaultChannel)
        setLoading(false)
        return
      }

      // Load first channel from database
      const { data: channels, error } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .eq("type", "text")
        .order("position", { ascending: true })
        .limit(1)

      if (error) throw error

      if (channels && channels.length > 0) {
        setSelectedChannel(channels[0])
      }
    } catch (error) {
      console.error("Error loading default channel:", error)
      // Fallback to demo channel
      const defaultChannel = {
        id: "demo-general",
        name: "general",
        type: "text",
        category_id: "demo-general-cat",
        topic: "General discussion",
        position: 0,
      }
      setSelectedChannel(defaultChannel)
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Mobile Back Button */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Discord-style Sidebar */}
      <DiscordSidebar
        community={community}
        user={user}
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
        onBack={onBack}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <EnhancedChatChannel channel={selectedChannel} user={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Welcome to {community.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
