"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Hash, Settings, Search, Plus, Menu, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/error-handler"
import type { User, Community, Channel } from "@/app/page"
import ChatChannel from "@/components/chat-channel"
import ItineraryChannel from "@/components/itinerary-channel"
import ChecklistChannel from "@/components/checklist-channel"
import FoodDietaryChannel from "@/components/food-dietary-channel"

interface CommunityPageProps {
  user: User
  community: Community
  onBack: () => void
  onLogout: () => void
}

export default function CommunityPage({ user, community, onBack, onLogout }: CommunityPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState("chat")
  const [searchQuery, setSearchQuery] = useState("")
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannels()
  }, [community.id])

  const loadChannels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      const channelsWithUnread = (data || []).map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type as "text" | "voice" | "link",
        href: channel.href,
        unreadCount: channel.name === "chat" ? Math.floor(Math.random() * 5) : undefined, // Mock unread count
      }))

      setChannels(channelsWithUnread)

      // Set default active channel
      if (channelsWithUnread.length > 0) {
        const defaultChannel = channelsWithUnread.find((c) => c.name === "chat") || channelsWithUnread[0]
        setActiveChannel(defaultChannel.id)
      }
    } catch (error) {
      handleSupabaseError(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChannels = channels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderChannelContent = () => {
    const channel = channels.find((c) => c.id === activeChannel)
    if (!channel) return null

    switch (channel.name) {
      case "chat":
        return <ChatChannel user={user} channelId={channel.id} communityId={community.id} />
      case "itinerary":
        return <ItineraryChannel user={user} channelId={channel.id} communityId={community.id} />
      case "gear-checklist":
        return <ChecklistChannel user={user} channelId={channel.id} communityId={community.id} />
      case "food-dietary":
        return <FoodDietaryChannel channelId={channel.id} communityId={community.id} />
      default:
        return <ChatChannel user={user} channelId={channel.id} communityId={community.id} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#182B49] rounded-xl flex items-center justify-center text-xl">
                  {community.icon}
                </div>
                <div>
                  <h1
                    className="font-bold text-[#182B49] text-lg"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
                  >
                    {community.name}
                  </h1>
                  <p
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
                  >
                    {community.memberCount} members
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                ✕
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to..."
                className="pl-10 bg-[#F0F0F0] border-0 rounded-lg h-10 text-[#182B49] placeholder:text-gray-500 text-sm"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
              />
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-semibold text-gray-600 uppercase tracking-wide"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
                >
                  Channels
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-[#182B49]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {filteredChannels.map((channel) => {
                const commonClasses =
                  "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors"
                const activeClasses = "bg-[#FFCD00] text-[#182B49]"
                const inactiveClasses = "text-gray-700 hover:bg-[#F0F0F0]"

                if (channel.href) {
                  return (
                    <a
                      key={channel.id}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${commonClasses} ${inactiveClasses}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span
                          className="text-sm font-medium"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                          }}
                        >
                          {channel.name}
                        </span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )
                }

                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel.id)
                      setSidebarOpen(false)
                    }}
                    className={`${commonClasses} ${activeChannel === channel.id ? activeClasses : inactiveClasses}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span
                        className="text-sm font-medium"
                        style={{
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                        }}
                      >
                        {channel.name}
                      </span>
                    </div>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-[#182B49] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.avatar}</span>
              </div>
              <div className="flex-1">
                <p
                  className="font-medium text-[#182B49] text-sm"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
                >
                  {user.name}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
                >
                  {user.email}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-[#182B49]">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="w-full text-[#182B49] border-[#182B49] hover:bg-[#182B49] hover:text-white bg-transparent"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="text-[#182B49]">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <h1
                  className="font-semibold text-[#182B49]"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
                >
                  {channels.find((c) => c.id === activeChannel)?.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Content */}
        <div className="flex-1 overflow-hidden">{renderChannelContent()}</div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
