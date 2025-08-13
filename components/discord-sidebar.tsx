"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured, type Channel, type ChannelCategory } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Hash, Volume2, ExternalLink, ChevronDown, ChevronRight, Settings, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
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

interface DiscordSidebarProps {
  user: User
  community: Community
  selectedChannel: Channel | null
  onChannelSelect: (channel: Channel) => void
  onBack: () => void
  onLogout: () => void
}

interface CategoryWithChannels extends ChannelCategory {
  channels: Channel[]
  isCollapsed: boolean
}

export default function DiscordSidebar({
  user,
  community,
  selectedChannel,
  onChannelSelect,
  onBack,
  onLogout,
}: DiscordSidebarProps) {
  const [categories, setCategories] = useState<CategoryWithChannels[]>([])
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    loadChannelsAndCategories()
  }, [community.id])

  const loadChannelsAndCategories = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - load mock data
        const mockCategories: CategoryWithChannels[] = [
          {
            id: "general-cat",
            name: "GENERAL",
            community_id: community.id,
            position: 0,
            created_at: new Date().toISOString(),
            created_by: user.id,
            isCollapsed: false,
            channels: [
              {
                id: "general-chat",
                name: "general",
                type: "text" as const,
                community_id: community.id,
                category_id: "general-cat",
                topic: "General discussion about the trip",
                position: 0,
                created_at: new Date().toISOString(),
              },
              {
                id: "announcements",
                name: "announcements",
                type: "text" as const,
                community_id: community.id,
                category_id: "general-cat",
                topic: "Important trip announcements",
                position: 1,
                created_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "planning-cat",
            name: "TRIP PLANNING",
            community_id: community.id,
            position: 1,
            created_at: new Date().toISOString(),
            created_by: user.id,
            isCollapsed: false,
            channels: [
              {
                id: "itinerary",
                name: "itinerary",
                type: "text" as const,
                community_id: community.id,
                category_id: "planning-cat",
                topic: "Plan our daily activities",
                position: 0,
                created_at: new Date().toISOString(),
              },
              {
                id: "checklist",
                name: "checklist",
                type: "text" as const,
                community_id: community.id,
                category_id: "planning-cat",
                topic: "Things to bring and prepare",
                position: 1,
                created_at: new Date().toISOString(),
              },
              {
                id: "food-planning",
                name: "food-planning",
                type: "text" as const,
                community_id: community.id,
                category_id: "planning-cat",
                topic: "Meal planning and food prep",
                position: 2,
                created_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "voice-cat",
            name: "VOICE CHANNELS",
            community_id: community.id,
            position: 2,
            created_at: new Date().toISOString(),
            created_by: user.id,
            isCollapsed: false,
            channels: [
              {
                id: "general-voice",
                name: "General",
                type: "voice" as const,
                community_id: community.id,
                category_id: "voice-cat",
                position: 0,
                created_at: new Date().toISOString(),
              },
              {
                id: "planning-voice",
                name: "Planning Session",
                type: "voice" as const,
                community_id: community.id,
                category_id: "voice-cat",
                position: 1,
                created_at: new Date().toISOString(),
              },
            ],
          },
        ]
        setCategories(mockCategories)
        setLoading(false)
        return
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("channel_categories")
        .select("*")
        .eq("community_id", community.id)
        .order("position")

      if (categoriesError) throw categoriesError

      // Load channels
      const { data: channelsData, error: channelsError } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("position")

      if (channelsError) throw channelsError

      // Group channels by category
      const categoriesWithChannels: CategoryWithChannels[] = (categoriesData || []).map((category) => ({
        ...category,
        channels: (channelsData || []).filter((channel) => channel.category_id === category.id),
        isCollapsed: false,
      }))

      // Add uncategorized channels
      const uncategorizedChannels = (channelsData || []).filter((channel) => !channel.category_id)
      if (uncategorizedChannels.length > 0) {
        categoriesWithChannels.push({
          id: "uncategorized",
          name: "UNCATEGORIZED",
          community_id: community.id,
          position: 999,
          created_at: new Date().toISOString(),
          created_by: user.id,
          channels: uncategorizedChannels,
          isCollapsed: false,
        })
      }

      setCategories(categoriesWithChannels)
    } catch (error) {
      console.error("Error loading channels:", error)
      toast.error("Failed to load channels")
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, isCollapsed: !cat.isCollapsed } : cat)),
    )
  }

  const getChannelIcon = (type: Channel["type"]) => {
    switch (type) {
      case "text":
        return <Hash className="w-4 h-4" />
      case "voice":
        return <Volume2 className="w-4 h-4" />
      case "link":
        return <ExternalLink className="w-4 h-4" />
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="w-60 bg-gray-800 dark:bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-60 bg-gray-800 dark:bg-gray-900 text-white flex flex-col h-full">
      {/* Community Header */}
      <div className="p-4 border-b border-gray-700 dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full justify-start text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2"
        >
          <div className="w-8 h-8 rounded bg-ucsd-gold text-ucsd-navy flex items-center justify-center text-sm font-bold mr-3">
            {community.icon}
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm truncate">{community.name}</div>
            <div className="text-xs text-gray-400">{community.member_count} members</div>
          </div>
        </Button>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          {categories.map((category) => (
            <div key={category.id} className="mb-4">
              {/* Category Header */}
              <Button
                variant="ghost"
                onClick={() => toggleCategory(category.id)}
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-1 mb-1 text-xs font-semibold uppercase tracking-wide"
              >
                {category.isCollapsed ? (
                  <ChevronRight className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 mr-1" />
                )}
                {category.name}
              </Button>

              {/* Channels in Category */}
              {!category.isCollapsed && (
                <div className="ml-2">
                  {category.channels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant="ghost"
                      onClick={() => onChannelSelect(channel)}
                      className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 mb-1 text-sm ${
                        selectedChannel?.id === channel.id ? "bg-gray-700 dark:bg-gray-800 text-white" : ""
                      }`}
                    >
                      <span className="mr-2 text-gray-400">{getChannelIcon(channel.type)}</span>
                      <span className="truncate">{channel.name}</span>
                      {/* Unread indicator placeholder */}
                      {/* <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span> */}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Panel */}
      <div className="p-3 border-t border-gray-700 dark:border-gray-800 bg-gray-750 dark:bg-gray-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-ucsd-gold text-ucsd-navy flex items-center justify-center text-sm font-medium">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
