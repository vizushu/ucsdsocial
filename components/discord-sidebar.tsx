"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { Hash, Volume2, ChevronDown, ChevronRight, Settings, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface Channel {
  id: string
  name: string
  type: string
  topic?: string
  category_id?: string
  position: number
}

interface ChannelCategory {
  id: string
  name: string
  position: number
  channels: Channel[]
}

interface DiscordSidebarProps {
  community: {
    id: string
    name: string
  }
  currentChannel: string
  onChannelSelect: (channelId: string) => void
  currentUser: any
  onLogout: () => void
}

export default function DiscordSidebar({
  community,
  currentChannel,
  onChannelSelect,
  currentUser,
  onLogout,
}: DiscordSidebarProps) {
  const [categories, setCategories] = useState<ChannelCategory[]>([])
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const loadChannelsAndCategories = async () => {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("channel_categories")
        .select("*")
        .eq("community_id", community.id)
        .order("position")

      if (categoriesError) {
        console.error("Error loading categories:", categoriesError)
        return
      }

      // Load channels
      const { data: channelsData, error: channelsError } = await supabase
        .from("channels")
        .select("*")
        .eq("community_id", community.id)
        .order("position")

      if (channelsError) {
        console.error("Error loading channels:", channelsError)
        return
      }

      // Group channels by category
      const categoriesWithChannels = (categoriesData || []).map((category) => ({
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
    }

    loadChannelsAndCategories()
  }, [community.id])

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

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "voice":
        return <Volume2 className="w-4 h-4" />
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  const getUserDisplayName = (user: any) => {
    return user?.full_name || user?.email?.split("@")[0] || "Unknown User"
  }

  const getUserAvatar = (user: any) => {
    const name = getUserDisplayName(user)
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="w-60 bg-gray-800 text-gray-100 flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700 shadow-sm">
        <h1 className="font-semibold text-white truncate">{community.name}</h1>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 h-auto text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide"
                onClick={() => toggleCategory(category.id)}
              >
                {collapsedCategories.has(category.id) ? (
                  <ChevronRight className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 mr-1" />
                )}
                {category.name}
              </Button>

              {/* Channels in Category */}
              {!collapsedCategories.has(category.id) && (
                <div className="ml-2 space-y-0.5">
                  {category.channels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant="ghost"
                      className={`w-full justify-start px-2 py-1.5 h-auto text-sm font-medium rounded ${
                        currentChannel === channel.id
                          ? "bg-gray-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      }`}
                      onClick={() => onChannelSelect(channel.id)}
                    >
                      {getChannelIcon(channel.type)}
                      <span className="ml-2 truncate">{channel.name}</span>
                      {/* Unread badge placeholder */}
                      {/* <Badge variant="secondary" className="ml-auto">3</Badge> */}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Panel */}
      <div className="p-3 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {getUserAvatar(currentUser)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{getUserDisplayName(currentUser)}</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700">
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
