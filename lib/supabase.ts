import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Community {
  id: string
  name: string
  description: string
  icon: string
  created_at: string
  created_by: string
}

export interface Channel {
  id: string
  name: string
  type: "text" | "voice" | "link"
  community_id: string
  href?: string
  created_at: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  channel_id: string
  created_at: string
  user_name: string
  user_avatar: string
}

export interface CommunityMember {
  id: string
  user_id: string
  community_id: string
  is_starred: boolean
  joined_at: string
}

export interface ItineraryActivity {
  id: string
  text: string
  time: string
  day_index: number
  channel_id: string
  icon_type: string
  icon_color: string
  border_color: string
  created_at: string
  created_by: string
}

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  channel_id: string
  created_at: string
  created_by: string
}

export interface FoodItem {
  id: string
  text: string
  checked: boolean
  channel_id: string
  created_at: string
  created_by: string
}

// Utility functions
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("getCurrentUser error:", error)
      throw error
    }
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    throw error || new Error("Failed to get current user")
  }
}

export const getCommunityMembers = async (communityId: string) => {
  try {
    const { data, error } = await supabase.from("community_members").select("*").eq("community_id", communityId)

    if (error) {
      console.error("getCommunityMembers error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting community members:", error)
    throw error || new Error("Failed to get community members")
  }
}

export const getUserCommunities = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select(`
      *,
      communities (*)
    `)
      .eq("user_id", userId)

    if (error) {
      console.error("getUserCommunities error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting user communities:", error)
    throw error || new Error("Failed to get user communities")
  }
}

export const joinCommunity = async (userId: string, communityId: string) => {
  try {
    console.log(`Attempting to join community ${communityId} for user ${userId}`)

    // Validate inputs
    if (!userId || !communityId) {
      throw new Error("User ID and Community ID are required")
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("community_members")
      .select("id")
      .eq("user_id", userId)
      .eq("community_id", communityId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing membership:", checkError)
      // Don't throw empty objects
      if (checkError && Object.keys(checkError).length > 0) {
        throw checkError
      } else {
        throw new Error("Failed to check existing membership")
      }
    }

    if (existingMember) {
      console.log("User is already a member")
      throw new Error("You are already a member of this community")
    }

    // Insert new membership
    const { data, error } = await supabase
      .from("community_members")
      .insert({
        user_id: userId,
        community_id: communityId,
        is_starred: false,
      })
      .select()

    if (error) {
      console.error("Error inserting membership:", error)
      // Don't throw empty objects
      if (error && Object.keys(error).length > 0) {
        throw error
      } else {
        throw new Error("Failed to insert membership")
      }
    }

    console.log("Successfully joined community:", data)
    return data
  } catch (error) {
    console.error("joinCommunity error:", error)
    let errorMessage = "Failed to join community - an unknown error occurred."

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (error && typeof error === "object") {
      const errorObj = error as any
      if (errorObj.message && typeof errorObj.message === "string") {
        errorMessage = errorObj.message
      } else if (errorObj.details && typeof errorObj.details === "string") {
        errorMessage = errorObj.details
      } else if (errorObj.error_description && typeof errorObj.error_description === "string") {
        errorMessage = errorObj.error_description
      } else if (errorObj.error && typeof errorObj.error === "string") {
        errorMessage = errorObj.error
      } else if (Object.keys(errorObj).length === 0) {
        errorMessage = "Failed to join community - empty error object received."
      }
    } else if (typeof error === "string") {
      errorMessage = error
    }

    throw new Error(errorMessage)
  }
}

export const leaveCommunity = async (userId: string, communityId: string) => {
  try {
    console.log(`Attempting to leave community ${communityId} for user ${userId}`)

    if (!userId || !communityId) {
      throw new Error("User ID and Community ID are required")
    }

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("user_id", userId)
      .eq("community_id", communityId)

    if (error) {
      console.error("Error leaving community:", error)
      if (error && Object.keys(error).length > 0) {
        throw error
      } else {
        throw new Error("Failed to leave community")
      }
    }

    console.log("Successfully left community")
  } catch (error) {
    console.error("leaveCommunity error:", error)
    let errorMessage = "Failed to leave community - an unknown error occurred."

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (error && typeof error === "object") {
      const errorObj = error as any
      if (errorObj.message && typeof errorObj.message === "string") {
        errorMessage = errorObj.message
      } else if (errorObj.details && typeof errorObj.details === "string") {
        errorMessage = errorObj.details
      } else if (errorObj.error_description && typeof errorObj.error_description === "string") {
        errorMessage = errorObj.error_description
      } else if (errorObj.error && typeof errorObj.error === "string") {
        errorMessage = errorObj.error
      } else if (Object.keys(errorObj).length === 0) {
        errorMessage = "Failed to leave community - empty error object received."
      }
    } else if (typeof error === "string") {
      errorMessage = error
    }

    throw new Error(errorMessage)
  }
}

export const toggleStarCommunity = async (userId: string, communityId: string, isStarred: boolean) => {
  try {
    console.log(`Toggling star for community ${communityId} to ${isStarred}`)

    if (!userId || !communityId) {
      throw new Error("User ID and Community ID are required")
    }

    const { error } = await supabase
      .from("community_members")
      .update({ is_starred: isStarred })
      .eq("user_id", userId)
      .eq("community_id", communityId)

    if (error) {
      console.error("Error toggling star:", error)
      if (error && Object.keys(error).length > 0) {
        throw error
      } else {
        throw new Error("Failed to toggle star")
      }
    }

    console.log("Successfully toggled star")
  } catch (error) {
    console.error("toggleStarCommunity error:", error)
    let errorMessage = "Failed to toggle star - an unknown error occurred."

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (error && typeof error === "object") {
      const errorObj = error as any
      if (errorObj.message && typeof errorObj.message === "string") {
        errorMessage = errorObj.message
      } else if (errorObj.details && typeof errorObj.details === "string") {
        errorMessage = errorObj.details
      } else if (errorObj.error_description && typeof errorObj.error_description === "string") {
        errorMessage = errorObj.error_description
      } else if (errorObj.error && typeof errorObj.error === "string") {
        errorMessage = errorObj.error
      } else if (Object.keys(errorObj).length === 0) {
        errorMessage = "Failed to toggle star - empty error object received."
      }
    } else if (typeof error === "string") {
      errorMessage = error
    }

    throw new Error(errorMessage)
  }
}

// Check if database tables exist
export const checkDatabaseSetup = async (): Promise<boolean> => {
  try {
    console.log("Checking database setup...")

    // Try to query the communities table with a simple select
    const { data, error } = await supabase.from("communities").select("id").limit(1)

    if (error) {
      console.log("Database check error:", error)

      // Check for table not found errors
      if (
        error.code === "42P01" ||
        error.message?.includes("does not exist") ||
        (error.message?.includes("relation") && error.message?.includes("does not exist"))
      ) {
        console.log("Database tables not found")
        return false
      }

      // For other errors, assume database exists but there's another issue
      console.warn("Database exists but query failed:", error)
      return true
    }

    console.log("Database setup verified")
    return true
  } catch (error) {
    console.error("Error checking database setup:", error)
    // If we can't check, assume database is not set up
    return false
  }
}
