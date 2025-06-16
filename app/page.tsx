"use client"

import { useState } from "react"
import LoginPage from "@/components/login-page"
import CommunitiesPage from "@/components/communities-page"
import CommunityPage from "@/components/community-page"

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
}

export type Channel = {
  id: string
  name: string
  type: "text" | "voice"
  unreadCount?: number
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<"login" | "communities" | "community">("login")
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

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

  const handleLogout = () => {
    setCurrentUser(null)
    setSelectedCommunity(null)
    setCurrentView("login")
  }

  if (currentView === "login") {
    return <LoginPage onLogin={handleLogin} />
  }

  if (currentView === "communities") {
    return <CommunitiesPage user={currentUser!} onSelectCommunity={handleSelectCommunity} onLogout={handleLogout} />
  }

  if (currentView === "community" && selectedCommunity) {
    return (
      <CommunityPage
        user={currentUser!}
        community={selectedCommunity}
        onBack={handleBackToCommunities}
        onLogout={handleLogout}
      />
    )
  }

  return null
}
