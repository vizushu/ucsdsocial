"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
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
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      const configured = isSupabaseConfigured()
      setIsDemo(!configured)

      if (configured) {
        // Real Supabase mode
        console.log("🗄️ Initializing in DATABASE mode")

        // Check current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
        } else if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            avatar: session.user.user_metadata?.name?.charAt(0).toUpperCase() || "U",
          })
          setCurrentView("communities")
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session?.user?.email)

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

        // Cleanup function
        return () => subscription.unsubscribe()
      } else {
        // Demo mode
        console.log("🎭 Initializing in DEMO mode")

        // Set up demo auth listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Demo auth state changed:", event)

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
      }
    } catch (error) {
      console.error("App initialization error:", error)
      // Fallback to demo mode
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
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
      console.error("Logout error:", error)
      // Force logout in demo mode
      setUser(null)
      setCurrentView("login")
      setSelectedCommunity(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading UCSD Social...</p>
          {isDemo && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Running in demo mode</p>}
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

      {/* Demo Mode Indicator */}
      {isDemo && (
        <div className="fixed bottom-4 right-4 bg-ucsd-gold text-ucsd-navy px-3 py-2 rounded-lg text-sm font-medium shadow-lg dark:shadow-gray-800">
          🎭 Demo Mode
        </div>
      )}
    </>
  )
}
