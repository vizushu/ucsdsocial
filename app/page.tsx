"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import LoginPage from "@/components/login-page"
import CommunitiesPage from "@/components/communities-page"
import CommunityPage from "@/components/community-page"
import { Toaster } from "sonner"

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
  is_starred?: boolean
  is_member?: boolean
}

export interface Channel {
  id: string
  name: string
  type: "text" | "voice" | "link"
  href?: string
  unread_count?: number
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<"login" | "communities" | "community">("login")
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.name?.charAt(0).toUpperCase() || "U",
        })
        setCurrentView("communities")
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.name?.charAt(0).toUpperCase() || "U",
        })
        setCurrentView("communities")
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setCurrentView("login")
        setSelectedCommunity(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community)
    setCurrentView("community")
  }

  const handleBackToCommunities = () => {
    setSelectedCommunity(null)
    setCurrentView("communities")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentView === "login" && <LoginPage />}
      {currentView === "communities" && user && (
        <CommunitiesPage user={user} onSelectCommunity={handleSelectCommunity} onLogout={handleLogout} />
      )}
      {currentView === "community" && user && selectedCommunity && (
        <CommunityPage
          user={user}
          community={selectedCommunity}
          onBack={handleBackToCommunities}
          onLogout={handleLogout}
        />
      )}
      <Toaster position="top-center" />
    </>
  )
}
