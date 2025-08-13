"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode, demoData } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
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
  created_at: string
  created_by: string
}

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
      if (isDemoMode()) {
        // Use demo data
        setCommunities(
          demoData.communities.map((c) => ({
            ...c,
            icon: c.name.charAt(0).toUpperCase(),
          })),
        )
        setLoading(false)
        return
      }

      // Load communities from Supabase
      const { data: communitiesData, error: communitiesError } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false })

      if (communitiesError) throw communitiesError

      // Load starred communities
      const { data: starredData, error: starredError } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id)
        .eq("is_starred", true)

      if (starredError) throw starredError

      const starred = new Set(starredData?.map((s) => s.community_id) || [])
      setStarredCommunities(starred)

      // Add icons to communities
      const communitiesWithIcons = (communitiesData || []).map((community) => ({
        ...community,
        icon: community.name.charAt(0).toUpperCase(),
      }))

      setCommunities(communitiesWithIcons)
    } catch (error) {
      console.error("Error loading communities:", error)
      toast.error("Failed to load communities")
    } finally {
      setLoading(false)
    }
  }

  const toggleStar = async (communityId: string) => {
    if (isDemoMode()) {
      // Demo mode - just update local state
      setStarredCommunities((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(communityId)) {
          newSet.delete(communityId)
          toast.success("Removed from favorites")
        } else {
          newSet.add(communityId)
          toast.success("Added to favorites")
        }
        return newSet
      })
      return
    }

    try {
      const isStarred = starredCommunities.has(communityId)

      if (isStarred) {
        // Unstar
        const { error } = await supabase
          .from("community_members")
          .update({ is_starred: false })
          .eq("user_id", user.id)
          .eq("community_id", communityId)

        if (error) throw error

        setStarredCommunities((prev) => {
          const newSet = new Set(prev)
          newSet.delete(communityId)
          return newSet
        })
        toast.success("Removed from favorites")
      } else {
        // Star
        const { error } = await supabase.from("community_members").upsert({
          user_id: user.id,
          community_id: communityId,
          is_starred: true,
        })

        if (error) throw error

        setStarredCommunities((prev) => new Set([...prev, communityId]))
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error("Error toggling star:", error)
      toast.error("Failed to update favorites")
    }
  }

  const handleJoinCommunity = async (community: Community) => {
    if (isDemoMode()) {
      // Demo mode - directly select community
      onCommunitySelect(community)
      return
    }

    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from("community_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("community_id", community.id)
        .single()

      if (!existingMember) {
        // Join the community
        const { error } = await supabase.from("community_members").insert({
          user_id: user.id,
          community_id: community.id,
          role: "member",
        })

        if (error) throw error
        toast.success(`Joined ${community.name}!`)
      }

      onCommunitySelect(community)
    } catch (error) {
      console.error("Error joining community:", error)
      toast.error("Failed to join community")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading communities...</p>
        </div>
      </div>
    )
  }

  const starredCommunitiesList = communities.filter((c) => starredCommunities.has(c.id))
  const otherCommunities = communities.filter((c) => !starredCommunities.has(c.id))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-ucsd-gold rounded-lg flex items-center justify-center">
                <span className="text-ucsd-navy font-bold text-sm">UC</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">UCSD Social</h1>
              {isDemoMode() && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                >
                  Demo Mode
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-ucsd-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user.avatar}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Starred Communities */}
        {starredCommunitiesList.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Starred Communities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starredCommunitiesList.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-ucsd-navy rounded-xl flex items-center justify-center text-xl">
                          {community.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{community.member_count} members</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(community.id)
                        }}
                      >
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">{community.description}</CardDescription>
                    <Button
                      onClick={() => handleJoinCommunity(community)}
                      className="w-full bg-ucsd-blue hover:bg-ucsd-navy text-white"
                    >
                      Enter Community
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Communities */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {starredCommunitiesList.length > 0 ? "Other Communities" : "Communities"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCommunities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-ucsd-navy rounded-xl flex items-center justify-center text-xl text-white">
                        {community.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{community.member_count} members</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(community.id)
                      }}
                    >
                      <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4">{community.description}</CardDescription>
                  <Button
                    onClick={() => handleJoinCommunity(community)}
                    className="w-full bg-ucsd-blue hover:bg-ucsd-navy text-white"
                  >
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {communities.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No communities yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Communities will appear here when they're created.</p>
          </div>
        )}
      </div>
    </div>
  )
}
