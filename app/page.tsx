"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/login-page"
import CommunitiesPage from "@/components/communities-page"
import CommunityPage from "@/components/community-page"
import { Toaster } from "sonner"
import { isSupabaseConfigured } from "@/lib/supabase"

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
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      console.log("🚀 Initializing app...")

      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      setIsDemo(!configured)

      if (!configured) {
        console.log("🎭 Running in demo mode")
        setCurrentUser(null)
        setCurrentView("login")
        setLoading(false)
        return
      }

      console.log("🔗 Supabase configured, checking authentication...")

      // Dynamic import to avoid loading if not configured
      const { supabase } = await import("@/lib/supabase")

      // Check current user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.log("⚠️ Auth check error:", error.message)
        setCurrentUser(null)
        setCurrentView("login")
      } else if (user) {
        console.log("✅ User authenticated:", user.email)
        const userData: User = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          avatar: user.user_metadata?.name?.charAt(0).toUpperCase() || "U",
        }
        setCurrentUser(userData)
        setCurrentView("communities")
      } else {
        console.log("ℹ️ No authenticated user")
        setCurrentUser(null)
        setCurrentView("login")
      }

      // Set up auth state listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("🔄 Auth state changed:", event)

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
      })

      // Cleanup function
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("❌ App initialization failed:", error)
      setIsDemo(true)
      setCurrentUser(null)
      setCurrentView("login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (user: User) => {
    console.log("👤 User logged in:", user.email)
    setCurrentUser(user)
    setCurrentView("communities")
  }

  const handleSelectCommunity = (community: Community) => {
    console.log("🏘️ Community selected:", community.name)
    setSelectedCommunity(community)
    setCurrentView("community")
  }

  const handleBackToCommunities = () => {
    console.log("⬅️ Back to communities")
    setSelectedCommunity(null)
    setCurrentView("communities")
  }

  const handleLogout = async () => {
    try {
      console.log("👋 Logging out...")

      if (!isDemo) {
        const { supabase } = await import("@/lib/supabase")
        await supabase.auth.signOut()
      }

      setCurrentUser(null)
      setSelectedCommunity(null)
      setCurrentView("login")
    } catch (error) {
      console.error("❌ Logout failed:", error)
      // Force logout anyway
      setCurrentUser(null)
      setSelectedCommunity(null)
      setCurrentView("login")
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
