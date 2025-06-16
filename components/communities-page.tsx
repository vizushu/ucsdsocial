"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, TrendingUp, BarChart3, Radio, Home, MessageSquare, AtSign, LogOut } from "lucide-react"
import type { User as UserType, Community } from "@/app/page"

interface CommunitiesPageProps {
  user: UserType
  onSelectCommunity: (community: Community) => void
  onLogout: () => void
}

export default function CommunitiesPage({ user, onSelectCommunity, onLogout }: CommunitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("browse")

  const communities: Community[] = [
    {
      id: "climbing",
      name: "UCSD Climbing",
      description: "Rock climbing adventures and trips",
      icon: "🧗",
      memberCount: 234,
      isStarred: true,
    },
    {
      id: "cse",
      name: "CSE Students",
      description: "Computer Science & Engineering community",
      icon: "💻",
      memberCount: 1205,
      isStarred: true,
    },
    {
      id: "triton-gaming",
      name: "Triton Gaming",
      description: "Gaming community for UCSD students",
      icon: "🎮",
      memberCount: 892,
      isStarred: false,
    },
    {
      id: "pre-med",
      name: "Pre-Med Tritons",
      description: "Pre-medical students support group",
      icon: "🏥",
      memberCount: 567,
      isStarred: true,
    },
    {
      id: "surf-club",
      name: "UCSD Surf Club",
      description: "Surfing and beach activities",
      icon: "🏄",
      memberCount: 445,
      isStarred: false,
    },
    {
      id: "photography",
      name: "UCSD Photography",
      description: "Photography enthusiasts and workshops",
      icon: "📸",
      memberCount: 321,
      isStarred: false,
    },
  ]

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const starredCommunities = filteredCommunities.filter((c) => c.isStarred)
  const otherCommunities = filteredCommunities.filter((c) => !c.isStarred)

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#182B49] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UC</span>
            </div>
            <h1
              className="text-xl font-bold text-[#182B49]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
            >
              Communities
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600 hover:text-[#182B49]">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="pl-10 bg-white border-0 rounded-xl h-12 text-[#182B49] placeholder:text-gray-500"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-6">
        <div className="flex space-x-4">
          {[
            { id: "browse", label: "Browse", icon: TrendingUp },
            { id: "popular", label: "Popular", icon: Star },
            { id: "all", label: "All", icon: BarChart3 },
            { id: "recent", label: "Recent", icon: Radio },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                activeTab === id ? "bg-[#FFCD00] text-[#182B49]" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span
                className="text-xs font-medium"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Communities List */}
      <div className="px-4 space-y-6">
        {/* Starred Communities */}
        {starredCommunities.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold text-[#182B49] mb-3"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
            >
              My Communities
            </h2>
            <div className="space-y-2">
              {starredCommunities.map((community) => (
                <Card
                  key={community.id}
                  className="bg-white border-0 shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectCommunity(community)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#F0F0F0] rounded-xl flex items-center justify-center text-xl">
                        {community.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3
                            className="font-semibold text-[#182B49]"
                            style={{
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                            }}
                          >
                            {community.name}
                          </h3>
                          {community.isStarred && <Star className="h-4 w-4 text-[#FFCD00] fill-current" />}
                        </div>
                        <p
                          className="text-sm text-gray-600 mt-1"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                          }}
                        >
                          {community.description}
                        </p>
                        <Badge
                          className="mt-2 bg-[#F0F0F0] text-gray-600 border-0 text-xs"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                          }}
                        >
                          {community.memberCount.toLocaleString()} members
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Communities */}
        {otherCommunities.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold text-[#182B49] mb-3"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
            >
              Discover
            </h2>
            <div className="space-y-2">
              {otherCommunities.map((community) => (
                <Card
                  key={community.id}
                  className="bg-white border-0 shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectCommunity(community)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#F0F0F0] rounded-xl flex items-center justify-center text-xl">
                        {community.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-semibold text-[#182B49]"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                          }}
                        >
                          {community.name}
                        </h3>
                        <p
                          className="text-sm text-gray-600 mt-1"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                          }}
                        >
                          {community.description}
                        </p>
                        <Badge
                          className="mt-2 bg-[#F0F0F0] text-gray-600 border-0 text-xs"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                          }}
                        >
                          {community.memberCount.toLocaleString()} members
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center p-2 text-[#182B49]">
            <Home className="h-5 w-5 mb-1" />
            <span
              className="text-xs font-medium"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
            >
              Home
            </span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span
              className="text-xs"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
            >
              DMs
            </span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <AtSign className="h-5 w-5 mb-1" />
            <span
              className="text-xs"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
            >
              Mentions
            </span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            {/* The UserType variable is undeclared. */}
            {/* Hint: Please fix the import or declare the variable before using it. */}
            {/* The UserType is already imported, so no changes are needed here. */}
            <div className="w-5 h-5 mb-1 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{user.name.charAt(0)}</span>
            </div>
            <span
              className="text-xs"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
            >
              You
            </span>
          </button>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  )
}
