"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import DiscordSidebar from "./discord-sidebar"
import EnhancedChatChannel from "./enhanced-chat-channel"
import ItineraryChannel from "./itinerary-channel"
import ChecklistChannel from "./checklist-channel"
import FoodPlanningChannel from "./food-planning-channel"
import FoodDietaryChannel from "./food-dietary-channel"

interface Community {
  id: string
  name: string
  description: string
  member_count: number
}

interface Channel {
  id: string
  name: string
  type: string
  topic?: string
  community_id: string
}

interface CommunityPageProps {
  community: Community
  currentUser: any
  onBack: () => void
}

export default function CommunityPage({ community, currentUser, onBack }: CommunityPageProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<string>("")
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  useEffect(() => {
    const loadChannels = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("position")

      if (error) {
        console.error("Error loading channels:", error)
        return
      }

      setChannels(data || [])

      // Set first channel as default
      if (data && data.length > 0) {
        setCurrentChannel(data[0].id)
        setSelectedChannel(data[0])
      }
    }

    loadChannels()
  }, [community.id])

  const handleChannelSelect = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId)
    if (channel) {
      setCurrentChannel(channelId)
      setSelectedChannel(channel)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onBack()
  }

  const renderChannelContent = () => {
    if (!selectedChannel) return null

    switch (selectedChannel.type) {
      case "itinerary":
        return <ItineraryChannel channel={selectedChannel} currentUser={currentUser} />
      case "checklist":
        return <ChecklistChannel channel={selectedChannel} currentUser={currentUser} />
      case "food-planning":
        return <FoodPlanningChannel channel={selectedChannel} currentUser={currentUser} />
      case "food-dietary":
        return <FoodDietaryChannel channel={selectedChannel} currentUser={currentUser} />
      default:
        return <EnhancedChatChannel channel={selectedChannel} currentUser={currentUser} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <DiscordSidebar
        community={community}
        currentChannel={currentChannel}
        onChannelSelect={handleChannelSelect}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          renderChannelContent()
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <h2 className="text-xl font-semibold mb-2">Welcome to {community.name}</h2>
              <p>Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
