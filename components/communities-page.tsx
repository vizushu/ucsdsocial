"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Star,
  TrendingUp,
  BarChart3,
  Radio,
  Home,
  MessageSquare,
  AtSign,
  LogOut,
  Users,
  Plus,
} from "lucide-react"
import { supabase, joinCommunity, leaveCommunity, toggleStarCommunity, checkDatabaseSetup } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/error-handler"
import type { User as UserType, Community } from "@/app/page"
import { toast } from "sonner"

interface CommunitiesPageProps {
  user: UserType
  onSelectCommunity: (community: Community) => void
  onLogout: () => void
}

// Fallback data in case database is not set up
const fallbackCommunities: Community[] = [
  {
    id: "climbing",
    name: "UCSD Climbing",
    description: "Rock climbing adventures and trips",
    icon: "🧗",
    memberCount: 234,
    isStarred: true,
    isMember: true,
  },
  {
    id: "cse",
    name: "CSE Students",
    description: "Computer Science & Engineering community",
    icon: "💻",
    memberCount: 1205,
    isStarred: true,
    isMember: true,
  },
  {
    id: "triton-gaming",
    name: "Triton Gaming",
    description: "Gaming community for UCSD students",
    icon: "🎮",
    memberCount: 892,
    isStarred: false,
    isMember: false,
  },
  {
    id: "pre-med",
    name: "Pre-Med Tritons",
    description: "Pre-medical students support group",
    icon: "🏥",
    memberCount: 567,
    isStarred: true,
    isMember: true,
  },
  {
    id: "surf-club",
    name: "UCSD Surf Club",
    description: "Surfing and beach activities",
    icon: "🏄",
    memberCount: 445,
    isStarred: false,
    isMember: false,
  },
  {
    id: "photography",
    name: "UCSD Photography",
    description: "Photography enthusiasts and workshops",
    icon: "📸",
    memberCount: 321,
    isStarred: false,
    isMember: false,
  },
]

export default function CommunitiesPage({ user, onSelectCommunity, onLogout }: CommunitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("browse")
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    loadCommunities()
  }, [user.id])

  const loadCommunities = async () => {
    try {
      setLoading(true)
      console.log("Loading communities...")

      // First check if database is set up
      const isDatabaseSetup = await checkDatabaseSetup()
      console.log("Database setup status:", isDatabaseSetup)

      if (!isDatabaseSetup) {
        console.log("Using fallback data")
        setCommunities(fallbackCommunities)
        setUsingFallback(true)
        return
      }

      // Database is set up, try to load real data
      setUsingFallback(false)

      // Get all communities
      const { data: allCommunities, error: communitiesError } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false })

      if (communitiesError) {
        console.error("Error loading communities:", communitiesError)
        throw communitiesError
      }

      // Get user's memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from("community_members")
        .select("community_id, is_starred")
        .eq("user_id", user.id)

      if (membershipsError) {
        console.error("Error loading memberships:", membershipsError)
        throw membershipsError
      }

      // Get member counts for each community
      const communitiesWithData = await Promise.all(
        (allCommunities || []).map(async (community) => {
          const memberCount = await getCommunityMemberCount(community.id)
          const membership = memberships?.find((m) => m.community_id === community.id)

          return {
            id: community.id,
            name: community.name,
            description: community.description,
            icon: community.icon,
            memberCount,
            isStarred: membership?.is_starred || false,
            isMember: !!membership,
          }
        }),
      )

      setCommunities(communitiesWithData)
      console.log("Successfully loaded communities:", communitiesWithData.length)
    } catch (error) {
      console.error("Error in loadCommunities:", error)
      handleSupabaseError(error, "loading communities")
      // Fall back to static data if there's any error
      setCommunities(fallbackCommunities)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  const getCommunityMemberCount = async (communityId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from("community_members")
        .select("*", { count: "exact", head: true })
        .eq("community_id", communityId)

      if (error) {
        console.error("Error getting member count:", error)
        return Math.floor(Math.random() * 1000) + 100 // Random fallback count
      }
      return count || 0
    } catch (error) {
      console.error("Error getting member count:", error)
      return Math.floor(Math.random() * 1000) + 100 // Random fallback count
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    console.log(`handleJoinCommunity called for ${communityId}, fallback mode: ${usingFallback}`)

    if (usingFallback) {
      // Update local state for fallback mode
      setCommunities((prev) =>
        prev.map((c) => (c.id === communityId ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c)),
      )
      toast.success("Joined community! (Demo mode)")
      return
    }

    // Check database setup again before attempting join
    try {
      const isDatabaseSetup = await checkDatabaseSetup()
      if (!isDatabaseSetup) {
        console.log("Database not set up, switching to fallback mode")
        setUsingFallback(true)
        setCommunities(fallbackCommunities)
        toast.error("Database not configured. Using demo mode.")
        return
      }
    } catch (dbCheckError) {
      console.error("Database check failed:", dbCheckError)
      setUsingFallback(true)
      setCommunities(fallbackCommunities)
      toast.error("Database check failed. Using demo mode.")
      return
    }

    try {
      setJoiningCommunity(communityId)
      console.log("Calling joinCommunity function...")

      await joinCommunity(user.id, communityId)

      console.log("Join successful, reloading communities...")
      await loadCommunities() // Refresh the list
      toast.success("Successfully joined community!")
    } catch (error) {
      console.error("Join community error details:", {
        error,
        type: typeof error,
        keys: error && typeof error === "object" ? Object.keys(error) : "N/A",
        constructor: error?.constructor?.name,
      })

      // If we get an empty object or meaningless error, switch to fallback mode
      if (!error || (typeof error === "object" && Object.keys(error).length === 0)) {
        console.log("Empty error detected, switching to fallback mode")
        setUsingFallback(true)
        setCommunities(fallbackCommunities)
        toast.error("Database error. Switching to demo mode.")
      } else {
        handleSupabaseError(error, "joining community")
      }
    } finally {
      setJoiningCommunity(null)
    }
  }

  const handleLeaveCommunity = async (communityId: string) => {
    console.log(`handleLeaveCommunity called for ${communityId}, fallback mode: ${usingFallback}`)

    if (usingFallback) {
      // Update local state for fallback mode
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, isMember: false, isStarred: false, memberCount: Math.max(0, c.memberCount - 1) }
            : c,
        ),
      )
      toast.success("Left community! (Demo mode)")
      return
    }

    try {
      setJoiningCommunity(communityId)
      await leaveCommunity(user.id, communityId)
      await loadCommunities() // Refresh the list
      toast.success("Successfully left community!")
    } catch (error) {
      console.error("Leave community error:", error)
      handleSupabaseError(error, "leaving community")
    } finally {
      setJoiningCommunity(null)
    }
  }

  const handleToggleStar = async (communityId: string, currentStarred: boolean) => {
    console.log(`handleToggleStar called for ${communityId}, fallback mode: ${usingFallback}`)

    if (usingFallback) {
      // Update local state for fallback mode
      setCommunities((prev) => prev.map((c) => (c.id === communityId ? { ...c, isStarred: !currentStarred } : c)))
      toast.success(`${!currentStarred ? "Starred" : "Unstarred"} community! (Demo mode)`)
      return
    }

    try {
      await toggleStarCommunity(user.id, communityId, !currentStarred)
      await loadCommunities() // Refresh the list
      toast.success(`${!currentStarred ? "Starred" : "Unstarred"} community!`)
    } catch (error) {
      console.error("Toggle star error:", error)
      handleSupabaseError(error, "toggling star")
    }
  }

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getFilteredCommunities = () => {
    switch (activeTab) {
      case "starred":
        return filteredCommunities.filter((c) => c.isStarred)
      case "joined":
        return filteredCommunities.filter((c) => c.isMember)
      case "popular":
        return filteredCommunities.sort((a, b) => b.memberCount - a.memberCount)
      case "recent":
        return filteredCommunities // Already sorted by created_at desc
      default:
        return filteredCommunities
    }
  }

  const displayedCommunities = getFilteredCommunities()
  const starredCommunities = displayedCommunities.filter((c) => c.isStarred && c.isMember)
  const otherCommunities = displayedCommunities.filter((c) => !c.isStarred || !c.isMember)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    )
  }

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
            {usingFallback && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                Demo Mode
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600 hover:text-[#182B49]">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Database Setup Notice */}
      {usingFallback && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-center space-x-2 text-yellow-800">
            <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs">!</span>
            </div>
            <p className="text-sm">
              <strong>Demo Mode:</strong> Database not configured. Run the SQL scripts in the scripts folder to set up
              your Supabase database.
            </p>
          </div>
        </div>
      )}

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
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: "browse", label: "Browse", icon: TrendingUp },
            { id: "starred", label: "Starred", icon: Star },
            { id: "joined", label: "Joined", icon: Users },
            { id: "popular", label: "Popular", icon: BarChart3 },
            { id: "recent", label: "Recent", icon: Radio },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-colors whitespace-nowrap ${
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
                <CommunityCard
                  key={community.id}
                  community={community}
                  onSelect={onSelectCommunity}
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                  onToggleStar={handleToggleStar}
                  isJoining={joiningCommunity === community.id}
                  usingFallback={usingFallback}
                />
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
              {activeTab === "starred"
                ? "Starred Communities"
                : activeTab === "joined"
                  ? "Joined Communities"
                  : "Discover"}
            </h2>
            <div className="space-y-2">
              {otherCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onSelect={onSelectCommunity}
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                  onToggleStar={handleToggleStar}
                  isJoining={joiningCommunity === community.id}
                  usingFallback={usingFallback}
                />
              ))}
            </div>
          </div>
        )}

        {displayedCommunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No communities found</p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")} className="text-[#182B49] border-[#182B49]">
                Clear search
              </Button>
            )}
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

interface CommunityCardProps {
  community: Community
  onSelect: (community: Community) => void
  onJoin: (communityId: string) => void
  onLeave: (communityId: string) => void
  onToggleStar: (communityId: string, currentStarred: boolean) => void
  isJoining: boolean
  usingFallback: boolean
}

function CommunityCard({
  community,
  onSelect,
  onJoin,
  onLeave,
  onToggleStar,
  isJoining,
  usingFallback,
}: CommunityCardProps) {
  return (
    <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#F0F0F0] rounded-xl flex items-center justify-center text-xl">
            {community.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3
                className="font-semibold text-[#182B49] cursor-pointer hover:text-[#FFCD00]"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                }}
                onClick={() => community.isMember && onSelect(community)}
              >
                {community.name}
              </h3>
              {community.isMember && (
                <button
                  onClick={() => onToggleStar(community.id, community.isStarred)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-4 w-4 ${community.isStarred ? "text-[#FFCD00] fill-current" : "text-gray-400"}`}
                  />
                </button>
              )}
            </div>
            <p
              className="text-sm text-gray-600 mt-1"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
              }}
            >
              {community.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <Badge
                className="bg-[#F0F0F0] text-gray-600 border-0 text-xs"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                }}
              >
                <Users className="h-3 w-3 mr-1" />
                {community.memberCount.toLocaleString()} members
              </Badge>

              {community.isMember ? (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onSelect(community)}
                    className="bg-[#FFCD00] hover:bg-yellow-500 text-[#182B49] text-xs"
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLeave(community.id)}
                    disabled={isJoining}
                    className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
                  >
                    {isJoining ? "..." : "Leave"}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onJoin(community.id)}
                  disabled={isJoining}
                  className="bg-[#182B49] hover:bg-[#1a2f52] text-white text-xs"
                >
                  {isJoining ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Join
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
