"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode, demoData } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star, Plus, Settings, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User, Community } from "@/app/page"

interface CommunitiesPageProps {
  user: User
  onCommunitySelect: (community: Community) => void
  onLogout: () => void
}

export default function CommunitiesPage({ user, onCommunitySelect, onLogout }: CommunitiesPageProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [starredCommunities, setStarredCommunities] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      if (isDemoMode() || !supabase) {
        console.log("Loading demo communities")
        setCommunities(demoData.communities)
        setStarredCommunities(new Set(["demo-yosemite"]))
        setLoading(false)
        return
      }

      // Load real communities from Supabase
      const { data: communitiesData, error: communitiesError } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false })

      if (communitiesError) {
        console.error("Error loading communities:", communitiesError)
        // Fallback to demo data
        setCommunities(demoData.communities)
        setStarredCommunities(new Set(["demo-yosemite"]))
        setLoading(false)
        return
      }

      setCommunities(communitiesData || [])

      // Load starred communities
      const { data: starredData, error: starredError } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id)
        .eq("is_starred", true)

      if (!starredError && starredData) {
        setStarredCommunities(new Set(starredData.map((item) => item.community_id)))
      }
    } catch (error) {
      console.error("Error in loadCommunities:", error)
      // Fallback to demo data
      setCommunities(demoData.communities)
      setStarredCommunities(new Set(["demo-yosemite"]))
    } finally {
      setLoading(false)
    }
  }

  const toggleStar = async (communityId: string) => {
    const isStarred = starredCommunities.has(communityId)

    if (isDemoMode() || !supabase) {
      // Demo mode - just update local state
      const newStarred = new Set(starredCommunities)
      if (isStarred) {
        newStarred.delete(communityId)
      } else {
        newStarred.add(communityId)
      }
      setStarredCommunities(newStarred)
      return
    }

    try {
      if (isStarred) {
        await supabase
          .from("community_members")
          .update({ is_starred: false })
          .eq("user_id", user.id)
          .eq("community_id", communityId)
      } else {
        await supabase.from("community_members").upsert({
          user_id: user.id,
          community_id: communityId,
          is_starred: true,
        })
      }

      const newStarred = new Set(starredCommunities)
      if (isStarred) {
        newStarred.delete(communityId)
      } else {
        newStarred.add(communityId)
      }
      setStarredCommunities(newStarred)
    } catch (error) {
      console.error("Error toggling star:", error)
    }
  }

  const starredCommunitiesList = communities.filter((c) => starredCommunities.has(c.id))
  const otherCommunities = communities.filter((c) => !starredCommunities.has(c.id))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading communities...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-ucsd-navy dark:text-white">UCSD Social</h1>
            {isDemoMode() && (
              <Badge variant="secondary" className="text-xs">
                Demo Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">Connect with fellow Tritons and join amazing communities</p>
        </div>

        {/* Starred Communities */}
        {starredCommunitiesList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Starred Communities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {starredCommunitiesList.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isStarred={true}
                  onToggleStar={toggleStar}
                  onSelect={onCommunitySelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Communities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">All Communities</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isStarred={false}
                onToggleStar={toggleStar}
                onSelect={onCommunitySelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommunityCardProps {
  community: Community
  isStarred: boolean
  onToggleStar: (id: string) => void
  onSelect: (community: Community) => void
}

function CommunityCard({ community, isStarred, onToggleStar, onSelect }: CommunityCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-ucsd-gold rounded-lg flex items-center justify-center text-ucsd-navy font-bold text-lg">
              {community.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Users className="h-4 w-4 mr-1" />
                {community.member_count} members
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar(community.id)
            }}
          >
            <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{community.description}</CardDescription>
        <Button className="w-full bg-ucsd-navy hover:bg-ucsd-navy/90 text-white" onClick={() => onSelect(community)}>
          Join Community
        </Button>
      </CardContent>
    </Card>
  )
}
