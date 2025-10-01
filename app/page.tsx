"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode } from "@/lib/supabase"
import LoginPage from "@/components/login-page"
import CommunitiesPage from "@/components/communities-page"
import CommunityPage from "@/components/community-page"
import { toast } from "react-toastify"

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

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      console.log("Initializing auth, demo mode:", isDemoMode())

      // Check for demo mode first
      if (isDemoMode()) {
        console.log("🎮 Running in demo mode")

        // Check for stored demo user
        const storedUser = localStorage.getItem("demo_user")
        if (storedUser) {
          try {
            const demoUser = JSON.parse(storedUser)
            setUser({
              id: demoUser.id,
              name: demoUser.user_metadata?.name || demoUser.email.split("@")[0],
              email: demoUser.email,
              avatar: demoUser.user_metadata?.name?.charAt(0) || demoUser.email.charAt(0).toUpperCase(),
            })
          } catch (error) {
            console.error("Error parsing stored demo user:", error)
            localStorage.removeItem("demo_user")
          }
        }

        // Listen for demo auth changes
        const handleDemoAuth = (event: any) => {
          const { user: demoUser, event: authEvent } = event.detail

          if (authEvent === "SIGNED_IN" && demoUser) {
            setUser({
              id: demoUser.id,
              name: demoUser.user_metadata?.name || demoUser.email.split("@")[0],
              email: demoUser.email,
              avatar: demoUser.user_metadata?.name?.charAt(0) || demoUser.email.charAt(0).toUpperCase(),
            })
          } else if (authEvent === "SIGNED_OUT") {
            setUser(null)
            setSelectedCommunity(null)
          }
        }

        window.addEventListener("demo_auth_change", handleDemoAuth)
        setLoading(false)

        return () => {
          window.removeEventListener("demo_auth_change", handleDemoAuth)
        }
      }

      // Real Supabase authentication
      try {
        console.log("Attempting real Supabase authentication...")
        const {
          data: { session },
          error,
        } = await supabase!.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            avatar: session.user.user_metadata?.name?.charAt(0) || session.user.email?.charAt(0).toUpperCase() || "U",
          })
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase!.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.email)

          if (event === "SIGNED_IN" && session?.user) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
              email: session.user.email || "",
              avatar: session.user.user_metadata?.name?.charAt(0) || session.user.email?.charAt(0).toUpperCase() || "U",
            })
          } else if (event === "SIGNED_OUT") {
            setUser(null)
            setSelectedCommunity(null)
          }
        })

        setLoading(false)

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogout = async () => {
    try {
      if (isDemoMode()) {
        // Demo mode logout
        setUser(null)
        setSelectedCommunity(null)
        localStorage.removeItem("demo_user")
        window.dispatchEvent(
          new CustomEvent("demo_auth_change", {
            detail: { user: null, event: "SIGNED_OUT" },
          }),
        )
        toast.success("Logged out successfully!")
        return
      }

      // Real logout
      const { error } = await supabase!.auth.signOut()
      if (error) throw error
      toast.success("Logged out successfully!")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if there's an error
      setUser(null)
      setSelectedCommunity(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ucsd-navy to-ucsd-blue dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading UCSD Social...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (selectedCommunity) {
    return (
      <CommunityPage
        community={selectedCommunity}
        user={user}
        onBack={() => setSelectedCommunity(null)}
        onLogout={handleLogout}
      />
    )
  }

  return <CommunitiesPage user={user} onCommunitySelect={setSelectedCommunity} onLogout={handleLogout} />
}
