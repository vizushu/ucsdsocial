"use client"

import { useState } from "react"
import DiscordSidebar from "@/components/discord-sidebar"
import EnhancedChatChannel from "@/components/enhanced-chat-channel"
import ItineraryChannel from "@/components/itinerary-channel"
import ChecklistChannel from "@/components/checklist-channel"
import FoodPlanningChannel from "@/components/food-planning-channel"
import FoodDietaryChannel from "@/components/food-dietary-channel"
import type { User, Community } from "@/app/page"

interface CommunityPageProps {
  community: Community
  user: User
  onBack: () => void
  onLogout: () => void
}

export default function CommunityPage({ community, user, onBack, onLogout }: CommunityPageProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>("demo-general")
  const [selectedChannelName, setSelectedChannelName] = useState<string>("general")

  const handleChannelSelect = (channelId: string, channelName: string) => {
    setSelectedChannelId(channelId)
    setSelectedChannelName(channelName)
  }

  const renderChannelContent = () => {
    if (!selectedChannelId) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Welcome to {community.name}</h3>
            <p className="text-muted-foreground">Select a channel to start chatting</p>
          </div>
        </div>
      )
    }

    // Route to different channel types based on channel name
    switch (selectedChannelName) {
      case "itinerary":
        return <ItineraryChannel channelId={selectedChannelId} user={user} />
      case "checklist":
        return <ChecklistChannel channelId={selectedChannelId} user={user} />
      case "food-planning":
        return <FoodPlanningChannel channelId={selectedChannelId} user={user} />
      case "dietary-restrictions":
        return <FoodDietaryChannel channelId={selectedChannelId} user={user} />
      default:
        return <EnhancedChatChannel channelId={selectedChannelId} channelName={selectedChannelName} user={user} />
    }
  }

  return (
    <div className="h-screen flex bg-background">
      <DiscordSidebar
        community={community}
        user={user}
        selectedChannelId={selectedChannelId}
        onChannelSelect={handleChannelSelect}
        onBack={onBack}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col">{renderChannelContent()}</div>
    </div>
  )
}
