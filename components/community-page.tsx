"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Hash, Menu } from "lucide-react"
import EnhancedChatChannel from "@/components/enhanced-chat-channel"
import ItineraryChannel from "@/components/itinerary-channel"
import ChecklistChannel from "@/components/checklist-channel"
import DiscordSidebar from "@/components/discord-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User, Community, Channel } from "@/app/page"

interface CommunityPageProps {
  user: User
  community: Community
  onBack: () => void
  onLogout: () => void
}

export default function CommunityPage({ user, community, onBack, onLogout }: CommunityPageProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string>("")
  const [activeChannelName, setActiveChannelName] = useState<string>("")
  const [activeChannelTopic, setActiveChannelTopic] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannels()
  }, [community.id])

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      setChannels(data || [])
      if (data && data.length > 0) {
        const firstChannel = data[0]
        setActiveChannel(firstChannel.id)
        setActiveChannelName(firstChannel.name)
        setActiveChannelTopic(firstChannel.topic || "")
      }
    } catch (error) {
      console.error("Error loading channels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSelect = (channelId: string, channelName: string, channelTopic?: string) => {
    setActiveChannel(channelId)
    setActiveChannelName(channelName)
    setActiveChannelTopic(channelTopic || "")
    setSidebarOpen(false) // Close mobile sidebar
  }

  const renderChannelContent = () => {
    const channel = channels.find((c) => c.id === activeChannel)
    if (!channel) return null

    switch (channel.name) {
      case "chat":
      case "general":
      case "random":
        return (
          <EnhancedChatChannel
            user={user}
            channelId={channel.id}
            channelName={channel.name}
            channelTopic={channel.topic}
            communityId={community.id}
          />
        )
      case "itinerary":
        return <ItineraryChannel user={user} channelId={channel.id} communityId={community.id} />
      case "gear-checklist":
        return <ChecklistChannel user={user} channelId={channel.id} communityId={community.id} />
      default:
        return (
          <EnhancedChatChannel
            user={user}
            channelId={channel.id}
            channelName={channel.name}
            channelTopic={channel.topic}
            communityId={community.id}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-700 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DiscordSidebar
          user={user}
          community={community}
          activeChannelId={activeChannel}
          onChannelSelect={handleChannelSelect}
          onBack={onBack}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <DiscordSidebar
          user={user}
          community={community}
          activeChannelId={activeChannel}
          onChannelSelect={handleChannelSelect}
          onBack={onBack}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <h1 className="font-semibold text-white">{activeChannelName}</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Channel Content */}
        <div className="flex-1 overflow-hidden">{renderChannelContent()}</div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
