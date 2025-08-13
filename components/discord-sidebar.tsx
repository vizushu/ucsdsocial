"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Hash, ChevronDown, ChevronRight, Plus, Settings, Volume2, ExternalLink, Users } from "lucide-react"
import type { User, Community } from "@/app/page"

interface ChannelCategory {
  id: string
  name: string
  position: number
  channels: ChannelWithDetails[]
}

interface ChannelWithDetails {
  id: string
  name: string
  type: "text" | "voice" | "link"
  topic?: string
  href?: string
  position: number
  category_id?: string
  unread_count?: number
}

interface DiscordSidebarProps {
  user: User
  community: Community
  activeChannelId: string
  onChannelSelect: (channelId: string, channelName: string, channelTopic?: string) => void
  onBack: () => void
}

export default function DiscordSidebar({
  user,
  community,
  activeChannelId,
  onChannelSelect,
  onBack,
}: DiscordSidebarProps) {
  const [categories, setCategories] = useState<ChannelCategory[]>([])
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannelsAndCategories()
  }, [community.id])

  const loadChannelsAndCategories = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("channel_categories")
        .select("*")
        .eq("community_id", community.id)
        .order("position", { ascending: true })

      if (categoriesError) throw categoriesError

      // Load channels
      const { data: channelsData, error: channelsError } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("position", { ascending: true })

      if (channelsError) throw channelsError

      // Group channels by category
      const categoriesWithChannels: ChannelCategory[] = (categoriesData || []).map((category) => ({
        ...category,
        channels: (channelsData || []).filter((channel) => channel.category_id === category.id),
      }))

      // Add uncategorized channels
      const uncategorizedChannels = (channelsData || []).filter((channel) => !channel.category_id)
      if (uncategorizedChannels.length > 0) {
        categoriesWithChannels.push({
          id: "uncategorized",
          name: "Uncategorized",
          position: 999,
          channels: uncategorizedChannels,
        })
      }

      setCategories(categoriesWithChannels)
    } catch (error) {
      console.error("Error loading channels and categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderChannel = (channel: ChannelWithDetails) => {
    const isActive = channel.id === activeChannelId

    if (channel.href) {
      // External link channel
      return (
        <a
          key={channel.id}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-2 py-1 mx-2 rounded text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Hash className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{channel.name}</span>
          </div>
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      )
    }

    if (channel.type === "voice") {
      return (
        <button
          key={channel.id}
          className="group flex items-center justify-between px-2 py-1 mx-2 rounded text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-colors w-full"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Volume2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{channel.name}</span>
          </div>
          <Users className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )
    }

    return (
      <button
        key={channel.id}
        onClick={() => onChannelSelect(channel.id, channel.name, channel.topic)}
        className={`group flex items-center justify-between px-2 py-1 mx-2 rounded transition-colors w-full ${
          isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <Hash className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm truncate">{channel.name}</span>
        </div>
        {channel.unread_count && channel.unread_count > 0 && (
          <div className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
            {channel.unread_count > 99 ? "99+" : channel.unread_count}
          </div>
        )}
      </button>
    )
  }

  const renderCategory = (category: ChannelCategory) => {
    const isCollapsed = collapsedCategories.has(category.id)

    return (
      <div key={category.id} className="mb-4">
        <button
          onClick={() => toggleCategory(category.id)}
          className="group flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide"
        >
          <div className="flex items-center space-x-1">
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span>{category.name}</span>
          </div>
          <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {!isCollapsed && <div className="mt-1 space-y-0.5">{category.channels.map(renderChannel)}</div>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-60 bg-gray-800 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="w-60 bg-gray-800 flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-ucsd-navy rounded-lg flex items-center justify-center text-sm">
              {community.icon}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-white text-sm truncate">{community.name}</h1>
              <p className="text-xs text-gray-400">{community.member_count} members</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-4">{categories.map(renderCategory)}</div>

      {/* User Panel */}
      <div className="p-3 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-ucsd-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{user.avatar}</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onBack} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              ←
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
