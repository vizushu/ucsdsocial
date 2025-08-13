"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Hash, Menu, ExternalLink } from "lucide-react"
import ChatChannel from "@/components/chat-channel"
import ItineraryChannel from "@/components/itinerary-channel"
import ChecklistChannel from "@/components/checklist-channel"
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
        setActiveChannel(data[0].id)
      }
    } catch (error) {
      console.error("Error loading channels:", error)
    } finally {
      setLoading(false)
    }
  }

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
      default:
        return <ChatChannel user={user} channelId={channel.id} communityId={community.id} />
    }
  }

  const activeChannelData = channels.find((c) => c.id === activeChannel)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ucsd-navy rounded-xl flex items-center justify-center text-xl">
                  {community.icon}
                </div>
                <div>
                  <h1 className="font-bold text-ucsd-navy text-lg">{community.name}</h1>
                  <p className="text-xs text-gray-500">{community.member_count} members</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                ✕
              </Button>
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Channels</h3>
              {channels.map((channel) => {
                if (channel.href) {
                  // External link channel
                  return (
                    <a
                      key={channel.id}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span className="text-sm font-medium">{channel.name}</span>
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
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                      activeChannel === channel.id ? "bg-ucsd-gold text-ucsd-navy" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Hash className="h-4 w-4" />
                    <span className="text-sm font-medium">{channel.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-ucsd-navy rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.avatar}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-ucsd-navy text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="w-full text-ucsd-navy border-ucsd-navy hover:bg-ucsd-navy hover:text-white bg-transparent"
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
        <div className="lg:hidden bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <h1 className="font-semibold text-ucsd-navy">{activeChannelData?.name}</h1>
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
