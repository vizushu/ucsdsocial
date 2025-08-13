"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Hash,
  Volume2,
  Settings,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Plus,
  Mic,
  Headphones,
  LogOut,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase, isDemoMode } from "@/lib/supabase"

interface Channel {
  id: string
  name: string
  type: string
  category_id?: string
  topic?: string
  position: number
}

interface Category {
  id: string
  name: string
  position: number
  channels: Channel[]
}

interface Community {
  id: string
  name: string
  description: string
  member_count: number
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface DiscordSidebarProps {
  community: Community
  user: User
  selectedChannel: Channel | null
  onChannelSelect: (channel: Channel) => void
  onBack: () => void
  onLogout: () => void
}

export default function DiscordSidebar({
  community,
  user,
  selectedChannel,
  onChannelSelect,
  onBack,
  onLogout,
}: DiscordSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannelsAndCategories()
  }, [community.id])

  const loadChannelsAndCategories = async () => {
    try {
      if (isDemoMode() || !supabase) {
        // Use demo data
        const demoCategories: Category[] = [
          {
            id: "demo-general-cat",
            name: "GENERAL",
            position: 0,
            channels: [
              {
                id: "demo-general",
                name: "general",
                type: "text",
                category_id: "demo-general-cat",
                topic: "General discussion about the trip",
                position: 0,
              },
              {
                id: "demo-announcements",
                name: "announcements",
                type: "text",
                category_id: "demo-general-cat",
                topic: "Important updates and announcements",
                position: 1,
              },
            ],
          },
          {
            id: "demo-planning-cat",
            name: "TRIP PLANNING",
            position: 1,
            channels: [
              {
                id: "demo-itinerary",
                name: "itinerary",
                type: "text",
                category_id: "demo-planning-cat",
                topic: "Plan our daily activities",
                position: 0,
              },
              {
                id: "demo-checklist",
                name: "packing-checklist",
                type: "text",
                category_id: "demo-planning-cat",
                topic: "What to bring on the trip",
                position: 1,
              },
              {
                id: "demo-food",
                name: "food-planning",
                type: "text",
                category_id: "demo-planning-cat",
                topic: "Meal planning and dietary needs",
                position: 2,
              },
            ],
          },
          {
            id: "demo-voice-cat",
            name: "VOICE CHANNELS",
            position: 2,
            channels: [
              {
                id: "demo-voice-general",
                name: "General",
                type: "voice",
                category_id: "demo-voice-cat",
                position: 0,
              },
              {
                id: "demo-voice-planning",
                name: "Planning Session",
                type: "voice",
                category_id: "demo-voice-cat",
                position: 1,
              },
            ],
          },
        ]
        setCategories(demoCategories)
        setLoading(false)
        return
      }

      // Load real data from Supabase
      const [categoriesResult, channelsResult] = await Promise.all([
        supabase
          .from("channel_categories")
          .select("*")
          .eq("community_id", community.id)
          .order("position", { ascending: true }),
        supabase.from("channels").select("*").eq("community_id", community.id).order("position", { ascending: true }),
      ])

      if (categoriesResult.error) throw categoriesResult.error
      if (channelsResult.error) throw channelsResult.error

      // Group channels by category
      const categoriesWithChannels: Category[] = (categoriesResult.data || []).map((category) => ({
        ...category,
        channels: (channelsResult.data || []).filter((channel) => channel.category_id === category.id),
      }))

      // Add uncategorized channels
      const uncategorizedChannels = (channelsResult.data || []).filter((channel) => !channel.category_id)
      if (uncategorizedChannels.length > 0) {
        categoriesWithChannels.unshift({
          id: "uncategorized",
          name: "CHANNELS",
          position: -1,
          channels: uncategorizedChannels,
        })
      }

      setCategories(categoriesWithChannels)
    } catch (error) {
      console.error("Error loading channels:", error)
      // Fallback to demo data on error
      const demoCategories: Category[] = [
        {
          id: "demo-general-cat",
          name: "GENERAL",
          position: 0,
          channels: [
            {
              id: "demo-general",
              name: "general",
              type: "text",
              category_id: "demo-general-cat",
              topic: "General discussion",
              position: 0,
            },
          ],
        },
      ]
      setCategories(demoCategories)
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

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case "voice":
        return <Volume2 className="h-4 w-4" />
      case "text":
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="w-60 bg-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-60 bg-gray-800 text-white flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white truncate">{community.name}</h1>
            <p className="text-xs text-gray-400">{community.member_count} members</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <UserPlus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map((category) => (
            <div key={category.id} className="mb-4">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-300 transition-colors"
              >
                <span>{category.name}</span>
                {collapsedCategories.has(category.id) ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {/* Channels in Category */}
              {!collapsedCategories.has(category.id) && (
                <div className="mt-1 space-y-0.5">
                  {category.channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => onChannelSelect(channel)}
                      className={`flex items-center w-full px-2 py-1.5 rounded text-sm transition-colors group ${
                        selectedChannel?.id === channel.id
                          ? "bg-gray-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      }`}
                    >
                      <span className="mr-2 text-gray-400">{getChannelIcon(channel)}</span>
                      <span className="truncate">{channel.name}</span>
                      {channel.type === "voice" && (
                        <div className="ml-auto flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-400">3</span>
                        </div>
                      )}
                    </button>
                  ))}
                  <button className="flex items-center w-full px-2 py-1.5 rounded text-sm text-gray-400 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-xs">Add Channel</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Panel */}
      <div className="p-3 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">#{user.id.slice(-4)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <Mic className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <Headphones className="h-3 w-3" />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              onClick={onLogout}
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
