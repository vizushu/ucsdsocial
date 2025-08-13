"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Users, Plus, LogOut } from "lucide-react"
import { toast } from "sonner"
import type { User, Community } from "@/app/page"
import { ThemeToggle } from "@/components/theme-toggle"

interface CommunitiesPageProps {
  user: User
  onSelectCommunity: (community: Community) => void
  onLogout: () => void
}

// Demo communities for when Supabase is not configured
const demoCommunities: Community[] = [
  {
    id: "demo-climbing",
    name: "UCSD Climbing",
    description: "Rock climbing adventures and trips",
    icon: "🧗",
    member_count: 234,
    is_starred: true,
    is_member: true,
  },
  {
    id: "demo-cse",
    name: "CSE Students",
    description: "Computer Science & Engineering community",
    icon: "💻",
    member_count: 1205,
    is_starred: true,
    is_member: true,
  },
  {
    id: "demo-gaming",
    name: "Triton Gaming",
    description: "Gaming community for UCSD students",
    icon: "🎮",
    member_count: 892,
    is_starred: false,
    is_member: true,
  },
  {
    id: "demo-premed",
    name: "Pre-Med Tritons",
    description: "Pre-medical students support group",
    icon: "🏥",
    member_count: 567,
    is_starred: false,
    is_member: false,
  },
  {
    id: "demo-surf",
    name: "UCSD Surf Club",
    description: "Surfing and beach activities",
    icon: "🏄",
    member_count: 445,
    is_starred: false,
    is_member: false,
  },
  {
    id: "demo-photo",
    name: "UCSD Photography",
    description: "Photography enthusiasts and workshops",
    icon: "📸",
    member_count: 321,
    is_starred: false,
    is_member: false,
  },
]

export default function CommunitiesPage({ user, onSelectCommunity, onLogout }: CommunitiesPageProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    loadCommunities()
  }, [user.id])

  const loadCommunities = async () => {
    try {
      const configured = isSupabaseConfigured()
      setIsDemo(!configured)

      if (!configured) {
        // Demo mode - use static data
        console.log("🎭 Loading demo communities")
        setCommunities(demoCommunities)
        setLoading(false)
        return
      }

      // Real database mode
      console.log("🗄️ Loading communities from database")

      // Get all communities with member counts
      const { data: allCommunities, error: communitiesError } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false })

      if (communitiesError) throw communitiesError

      // Get user's memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from("community_members")
        .select("community_id, is_starred")
        .eq("user_id", user.id)

      if (membershipsError) throw membershipsError

      // Combine data
      const communitiesWithMembership = (allCommunities || []).map((community) => {
        const membership = memberships?.find((m) => m.community_id === community.id)
        return {
          ...community,
          is_member: !!membership,
          is_starred: membership?.is_starred || false,
        }
      })

      setCommunities(communitiesWithMembership)
    } catch (error: any) {
      console.error("Error loading communities:", error)

      // Fallback to demo data on error
      console.log("🎭 Falling back to demo communities")
      setCommunities(demoCommunities)
      setIsDemo(true)

      if (!error.message?.includes("Demo mode")) {
        toast.error("Using demo data - database not available")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (isDemo) {
      // Demo mode - simulate joining
      setCommunities((prev) =>
        prev.map((c) => (c.id === communityId ? { ...c, is_member: true, member_count: c.member_count + 1 } : c)),
      )
      toast.success("Joined community! (Demo mode)")
      return
    }

    try {
      setJoiningCommunity(communityId)

      const { error } = await supabase.from("community_members").insert({
        user_id: user.id,
        community_id: communityId,
        is_starred: false,
      })

      if (error) throw error

      toast.success("Joined community!")
      loadCommunities()
    } catch (error: any) {
      console.error("Error joining community:", error)
      toast.error("Failed to join community")
    } finally {
      setJoiningCommunity(null)
    }
  }

  const handleToggleStar = async (communityId: string, currentStarred: boolean) => {
    if (isDemo) {
      // Demo mode - simulate starring
      setCommunities((prev) => prev.map((c) => (c.id === communityId ? { ...c, is_starred: !currentStarred } : c)))
      toast.success(currentStarred ? "Unstarred community! (Demo)" : "Starred community! (Demo)")
      return
    }

    try {
      const { error } = await supabase
        .from("community_members")
        .update({ is_starred: !currentStarred })
        .eq("user_id", user.id)
        .eq("community_id", communityId)

      if (error) throw error

      toast.success(currentStarred ? "Unstarred community" : "Starred community")
      loadCommunities()
    } catch (error: any) {
      console.error("Error toggling star:", error)
      toast.error("Failed to update community")
    }
  }

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const starredCommunities = filteredCommunities.filter((c) => c.is_starred && c.is_member)
  const otherCommunities = filteredCommunities.filter((c) => !c.is_starred || !c.is_member)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-ucsd-navy rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UC</span>
            </div>
            <h1 className="text-xl font-bold text-ucsd-navy">Communities</h1>
            {isDemo && (
              <Badge variant="outline" className="text-xs bg-ucsd-gold text-ucsd-navy">
                Demo Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
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
            className="pl-10 bg-white border-0 rounded-xl h-12"
          />
        </div>
      </div>
      {/* Communities */}
      <div className="px-4 space-y-6">
        {/* Starred Communities */}
        {starredCommunities.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-ucsd-navy mb-3">My Communities</h2>
            <div className="space-y-2">
              {starredCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onSelect={onSelectCommunity}
                  onJoin={handleJoinCommunity}
                  onToggleStar={handleToggleStar}
                  isJoining={joiningCommunity === community.id}
                  isDemo={isDemo}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Communities */}
        {otherCommunities.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-ucsd-navy mb-3">Discover</h2>
            <div className="space-y-2">
              {otherCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onSelect={onSelectCommunity}
                  onJoin={handleJoinCommunity}
                  onToggleStar={handleToggleStar}
                  isJoining={joiningCommunity === community.id}
                  isDemo={isDemo}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="h-20" /> {/* Bottom padding */}
    </div>
  )
}

interface CommunityCardProps {
  community: Community
  onSelect: (community: Community) => void
  onJoin: (communityId: string) => void
  onToggleStar: (communityId: string, currentStarred: boolean) => void
  isJoining: boolean
  isDemo: boolean
}

function CommunityCard({ community, onSelect, onJoin, onToggleStar, isJoining, isDemo }: CommunityCardProps) {
  return (
    <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
            {community.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3
                className="font-semibold text-ucsd-navy cursor-pointer hover:text-ucsd-blue"
                onClick={() => community.is_member && onSelect(community)}
              >
                {community.name}
              </h3>
              {community.is_member && (
                <button
                  onClick={() => onToggleStar(community.id, community.is_starred || false)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-4 w-4 ${community.is_starred ? "text-ucsd-gold fill-current" : "text-gray-400"}`}
                  />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{community.description}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {community.member_count.toLocaleString()} members
              </Badge>

              {community.is_member ? (
                <Button
                  size="sm"
                  onClick={() => onSelect(community)}
                  className="bg-ucsd-gold hover:bg-yellow-500 text-ucsd-navy text-xs"
                >
                  Open
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onJoin(community.id)}
                  disabled={isJoining}
                  className="bg-ucsd-navy hover:bg-ucsd-navy/90 text-white text-xs"
                >
                  {isJoining ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Join{isDemo ? " (Demo)" : ""}
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
