"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured, type Channel } from "@/lib/supabase"
import DiscordSidebar from "@/components/discord-sidebar"
import EnhancedChatChannel from "@/components/enhanced-chat-channel"
import ItineraryChannel from "@/components/itinerary-channel"
import ChecklistChannel from "@/components/checklist-channel"
import FoodPlanningChannel from "@/components/food-planning-channel"
import FoodDietaryChannel from "@/components/food-dietary-channel"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface Community {
  id: string
  name: string
  description: string
  icon: string
  member_count: number
}

interface CommunityPageProps {
  user: User
  community: Community
  onBack: () => void
  onLogout: () => void
}

export default function CommunityPage({ user, community, onBack, onLogout }: CommunityPageProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auto-select first channel
    loadInitialChannel()
  }, [community.id])

  const loadInitialChannel = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - select general channel
        const demoChannel: Channel = {
          id: "general-chat",
          name: "general",
          type: "text",
          community_id: community.id,
          category_id: "general-cat",
          topic: "General discussion about the trip",
          position: 0,
          created_at: new Date().toISOString(),
        }
        setSelectedChannel(demoChannel)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("position")
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setSelectedChannel(data[0])
      }
    } catch (error) {
      console.error("Error loading initial channel:", error)
      toast.error("Failed to load channels")
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel)
  }

  const renderChannelContent = () => {
    if (!selectedChannel) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to {community.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">Select a channel from the sidebar to start chatting</p>
          </div>
        </div>
      )
    }

    // Special channel types
    switch (selectedChannel.name) {
      case "itinerary":
        return <ItineraryChannel user={user} channel={selectedChannel} />
      case "checklist":
        return <ChecklistChannel user={user} channel={selectedChannel} />
      case "food-planning":
        return <FoodPlanningChannel user={user} channel={selectedChannel} />
      case "food-dietary":
        return <FoodDietaryChannel user={user} channel={selectedChannel} />
      default:
        // Regular chat channel
        return <EnhancedChatChannel user={user} channel={selectedChannel} />
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <DiscordSidebar
        user={user}
        community={community}
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
        onBack={onBack}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col">{renderChannelContent()}</div>
    </div>
  )
}
