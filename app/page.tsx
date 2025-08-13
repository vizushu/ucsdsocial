"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import LoginPage from "@/components/login-page"
import CommunitiesPage from "@/components/communities-page"
import CommunityPage from "@/components/community-page"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Community {
  id: string
  name: string
  description: string
  icon: string
  member_count: number
  created_at: string
  created_by: string
}

export interface Channel {
  id: string
  name: string
  type: "text" | "voice" | "link"
  community_id: string
  category_id?: string
  topic?: string
  href?: string
  position: number
  created_at: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          setLoading(false)
          return
        }

        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.email
                ?.split("@")[0]
                ?.replace(/[._]/g, " ")
                ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
              "User",
            email: session.user.email || "",
            avatar: (session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "U")
              .charAt(0)
              .toUpperCase(),
          }
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userData: User = {
          id: session.user.id,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email
              ?.split("@")[0]
              ?.replace(/[._]/g, " ")
              ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
            "User",
          email: session.user.email || "",
          avatar: (session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "U")
            .charAt(0)
            .toUpperCase(),
        }
        setUser(userData)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setSelectedCommunity(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSelectedCommunity(null)
  }

  const handleCommunitySelect = (community: Community) => {
    setSelectedCommunity(community)
  }

  const handleBackToCommunities = () => {
    setSelectedCommunity(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (selectedCommunity) {
    return <CommunityPage community={selectedCommunity} currentUser={user} onBack={handleBackToCommunities} />
  }

  return <CommunitiesPage user={user} onCommunitySelect={handleCommunitySelect} onLogout={handleLogout} />
}
