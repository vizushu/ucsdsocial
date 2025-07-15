"use client"

import { useState, useEffect } from "react"
import { supabase, getCurrentUser } from "@/lib/supabase"
import { handleError } from "@/lib/error-handler"
import LoginPage from "@/components/login-page"
import CommunitiesPage from "@/components/communities-page"
import CommunityPage from "@/components/community-page"
import { Toaster } from "sonner"

export type User = {
  id: string
  name: string
  email: string
  avatar: string
}

export type Community = {
  id: string
  name: string
  description: string
  icon: string
  memberCount: number
  isStarred: boolean
  isMember: boolean
}

export type Channel = {
  id: string
  name: string
  type: "text" | "voice" | "link"
  unreadCount?: number
  href?: string
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<"login" | "communities" | "community">("login")
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.name?.charAt(0).toUpperCase() || "U",
        }
        setCurrentUser(user)
        setCurrentView("communities")
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null)
        setSelectedCommunity(null)
        setCurrentView("login")
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        const userData: User = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          avatar: user.user_metadata?.name?.charAt(0).toUpperCase() || "U",
        }
        setCurrentUser(userData)
        setCurrentView("communities")
      }
    } catch (error) {
      handleError(error, "Failed to check authentication status")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setCurrentView("communities")
  }

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community)
    setCurrentView("community")
  }

  const handleBackToCommunities = () => {
    setSelectedCommunity(null)
    setCurrentView("communities")
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      handleError(error, "Failed to log out")
    }
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

  if (currentView === "login") {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    )
  }

  if (currentView === "communities") {
    return (
      <>
        <CommunitiesPage user={currentUser!} onSelectCommunity={handleSelectCommunity} onLogout={handleLogout} />
        <Toaster position="top-center" />
      </>
    )
  }

  if (currentView === "community" && selectedCommunity) {
    return (
      <>
        <CommunityPage
          user={currentUser!}
          community={selectedCommunity}
          onBack={handleBackToCommunities}
          onLogout={handleLogout}
        />
        <Toaster position="top-center" />
      </>
    )
  }

  return null
}
