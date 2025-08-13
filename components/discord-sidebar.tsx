"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { supabase, isDemoMode, demoData } from "@/lib/supabase"
import { Hash, Volume2, ChevronDown, ChevronRight, Settings, LogOut, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User, Community } from "@/app/page"

interface Channel {
  id: string
  name: string
  type: string
  community_id: string
  category_id?: string | null
  topic?: string | null
  position: number
  created_at: string
  created_by: string
}

interface ChannelCategory {
  id: string
  name: string
  community_id: string
  position: number
  created_at: string
  created_by: string
}

interface DiscordSidebarProps {
  community: Community
  user: User
  selectedChannelId: string | null
  onChannelSelect: (channelId: string, channelName: string) => void
  onBack: () => void
  onLogout: () => void
}

export default function DiscordSidebar({
  community,
  user,
  selectedChannelId,
  onChannelSelect,
  onBack,
  onLogout,
}: DiscordSidebarProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [categories, setCategories] = useState<ChannelCategory[]>([])
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannelsAndCategories()
  }, [community.id])

  const loadChannelsAndCategories = async () => {
    try {
      if (isDemoMode() || !supabase) {
        // Load demo data
        const communityChannels = demoData.channels.filter((c) => c.community_id === community.id)
        const communityCategories = demoData.categories.filter((c) => c.community_id === community.id)

        setChannels(communityChannels)
        setCategories(communityCategories)
        setLoading(false)
        return
      }

      // Load real data from Supabase
      const [channelsResponse, categoriesResponse] = await Promise.all([
        supabase.from("channels").select("*").eq("community_id", community.id).order("position", { ascending: true }),
        supabase
          .from("channel_categories")
          .select("*")
          .eq("community_id", community.id)
          .order("position", { ascending: true }),
      ])

      if (channelsResponse.error) {
        console.error("Error loading channels:", channelsResponse.error)
      } else {
        setChannels(channelsResponse.data || [])
      }

      if (categoriesResponse.error) {
        console.error("Error loading categories:", categoriesResponse.error)
      } else {
        setCategories(categoriesResponse.data || [])
      }
    } catch (error) {
      console.error("Error in loadChannelsAndCategories:", error)
      // Fallback to demo data
      const communityChannels = demoData.channels.filter((c) => c.community_id === community.id)
      const communityCategories = demoData.categories.filter((c) => c.community_id === community.id)

      setChannels(communityChannels)
      setCategories(communityCategories)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories)
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId)
    } else {
      newCollapsed.add(categoryId)
    }
    setCollapsedCategories(newCollapsed)
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "voice":
        return <Volume2 className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  const renderChannelsForCategory = (categoryId: string | null) => {
    const categoryChannels = channels.filter((c) => c.category_id === categoryId)

    return categoryChannels.map((channel) => (
      <Button
        key={channel.id}
        variant={selectedChannelId === channel.id ? "secondary" : "ghost"}
        className="w-full justify-start text-left h-8 px-2 text-sm font-normal"
        onClick={() => onChannelSelect(channel.id, channel.name)}
      >
        <div className="flex items-center space-x-2 min-w-0">
          {getChannelIcon(channel.type)}
          <span className="truncate">{channel.name}</span>
        </div>
      </Button>
    ))
  }

  if (loading) {
    return (
      <div className="w-60 bg-gray-800 text-white p-4">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-60 bg-gray-800 text-white flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold truncate">{community.name}</h2>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0" onClick={onBack}>
            ×
          </Button>
        </div>
        {isDemoMode() && (
          <Badge variant="secondary" className="text-xs mt-1">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-2 space-y-1">
          {/* Categorized Channels */}
          {categories.map((category) => {
            const isCollapsed = collapsedCategories.has(category.id)
            const categoryChannels = channels.filter((c) => c.category_id === category.id)

            if (categoryChannels.length === 0) return null

            return (
              <div key={category.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-6 px-1 text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-1">
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <span>{category.name}</span>
                  </div>
                </Button>

                {!isCollapsed && <div className="ml-2 space-y-0.5">{renderChannelsForCategory(category.id)}</div>}
              </div>
            )
          })}

          {/* Uncategorized Channels */}
          {channels.filter((c) => !c.category_id).length > 0 && (
            <div className="space-y-0.5">{renderChannelsForCategory(null)}</div>
          )}

          {/* Add Channel Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-left h-8 px-2 text-sm text-gray-400 hover:text-gray-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Channel
          </Button>
        </div>
      </ScrollArea>

      {/* User Panel */}
      <div className="p-2 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-ucsd-gold rounded-full flex items-center justify-center text-ucsd-navy font-semibold text-sm">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0" onClick={onLogout}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
