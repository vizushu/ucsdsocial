"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode, demoData } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User, Community } from "@/app/page"

interface CommunitiesPageProps {
  user: User
  onCommunitySelect: (community: Community) => void
  onLogout: () => void
}

export default function CommunitiesPage({ user, onCommunitySelect, onLogout }: CommunitiesPageProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      if (isDemoMode()) {
        // Use demo data
        console.log("Loading demo communities")
        setCommunities(
          demoData.communities.map((c) => ({
            ...c,
            icon: c.name.charAt(0).toUpperCase(),
          })),
        )
        setLoading(false)
        return
      }

      // Load from Supabase
      const { data, error } = await supabase!.from("communities").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setCommunities(
        (data || []).map((c) => ({
          ...c,
          icon: c.name.charAt(0).toUpperCase(),
        })),
      )
    } catch (error) {
      console.error("Error loading communities:", error)
      // Fallback to demo data on error
      setCommunities(
        demoData.communities.map((c) => ({
          ...c,
          icon: c.name.charAt(0).toUpperCase(),
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ucsd-navy to-ucsd-blue dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">UCSD Social Communities</h1>
            <p className="text-gray-200 dark:text-gray-300">
              Welcome back, {user.name}! {isDemoMode() && "🎮 Demo Mode"}
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={onLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading communities...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <Card
                key={community.id}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                onClick={() => onCommunitySelect(community)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-ucsd-gold flex items-center justify-center text-ucsd-navy text-xl font-bold">
                      {community.icon}
                    </div>
                    <div>
                      <CardTitle className="text-ucsd-navy dark:text-white">{community.name}</CardTitle>
                      <CardDescription className="dark:text-gray-300">{community.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="bg-ucsd-blue/10 text-ucsd-blue dark:bg-ucsd-gold/10">
                    <Users className="w-3 h-3 mr-1" />
                    {community.member_count} members
                  </Badge>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed border-2 cursor-pointer hover:border-ucsd-gold transition-colors bg-white/50 dark:bg-gray-800/50">
              <CardHeader className="text-center py-12">
                <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <CardTitle className="text-gray-600 dark:text-gray-300">Create New Community</CardTitle>
                <CardDescription className="dark:text-gray-400">Start your own group</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
