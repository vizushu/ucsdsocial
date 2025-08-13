import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Lazy client creation
let _supabaseClient: SupabaseClient | null = null

const getSupabaseClient = () => {
  if (_supabaseClient) return _supabaseClient

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found.")
    // Return null instead of creating a dummy client
    return null
  }

  _supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return _supabaseClient
}

// Export a proxy object that checks configuration before each call
export const supabase = {
  get auth() {
    const client = getSupabaseClient()
    if (!client) {
      return {
        signInWithPassword: () => Promise.reject(new Error("Supabase not configured")),
        signInWithOAuth: () => Promise.reject(new Error("Supabase not configured")),
        signUp: () => Promise.reject(new Error("Supabase not configured")),
        signOut: () => Promise.reject(new Error("Supabase not configured")),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    }
    return client.auth
  },
  from: (table: string) => {
    const client = getSupabaseClient()
    if (!client) {
      return {
        select: () => Promise.reject(new Error("Supabase not configured")),
        insert: () => Promise.reject(new Error("Supabase not configured")),
        update: () => Promise.reject(new Error("Supabase not configured")),
        delete: () => Promise.reject(new Error("Supabase not configured")),
      }
    }
    return client.from(table)
  },
  channel: (name: string) => {
    const client = getSupabaseClient()
    if (!client) {
      return {
        on: () => ({ subscribe: () => {} }),
      }
    }
    return client.channel(name)
  },
}

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

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Utility functions
export const getCurrentUser = async () => {
  try {
    if (!isSupabaseConfigured()) {
      console.log("Supabase not configured")
      return null
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      // Don't throw for missing session, just return null
      if (error.message?.includes("session") || error.message?.includes("Auth")) {
        console.log("No active session")
        return null
      }
      console.error("getCurrentUser error:", error)
      throw error
    }
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const getCommunityMembers = async (communityId: string) => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

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
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

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
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

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
      throw checkError
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
      throw error
    }

    console.log("Successfully joined community:", data)
    return data
  } catch (error) {
    console.error("joinCommunity error:", error)
    throw error
  }
}

export const leaveCommunity = async (userId: string, communityId: string) => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

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
      throw error
    }

    console.log("Successfully left community")
  } catch (error) {
    console.error("leaveCommunity error:", error)
    throw error
  }
}

export const toggleStarCommunity = async (userId: string, communityId: string, isStarred: boolean) => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

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
      throw error
    }

    console.log("Successfully toggled star")
  } catch (error) {
    console.error("toggleStarCommunity error:", error)
    throw error
  }
}

// Enhanced database setup check with detailed logging
export const checkDatabaseSetup = async (): Promise<boolean> => {
  console.log("🔍 Starting comprehensive database setup check...")

  try {
    // Check environment variables first
    if (!isSupabaseConfigured()) {
      console.log("❌ Missing Supabase environment variables")
      return false
    }
    console.log("✅ Environment variables present")

    // Try to query multiple tables to ensure they all exist
    const tables = [
      "communities",
      "channels",
      "community_members",
      "messages",
      "itinerary_activities",
      "checklist_items",
      "food_items",
    ]

    console.log("🔍 Checking table existence...")
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("id").limit(1)

        if (error) {
          console.log(`❌ Table ${table} check failed:`, error.message, error.code)

          // Check for table not found errors
          if (
            error.code === "42P01" ||
            error.message?.includes("does not exist") ||
            error.message?.includes("relation") ||
            error.message?.includes("table")
          ) {
            console.log(`❌ Table ${table} does not exist`)
            return false
          }

          // For other errors, log but continue checking
          console.warn(`⚠️ Table ${table} exists but query failed:`, error)
        } else {
          console.log(`✅ Table ${table} exists and accessible`)
        }
      } catch (err) {
        console.log(`❌ Exception checking table ${table}:`, err)
        return false
      }
    }

    // Test data access
    console.log("🔍 Testing data access...")
    try {
      const { data: communities, error: commError } = await supabase.from("communities").select("id, name").limit(5)

      if (commError) {
        console.log("❌ Failed to query communities:", commError.message)
        return false
      }

      console.log(`✅ Successfully queried communities: ${communities?.length || 0} found`)

      if (communities && communities.length > 0) {
        console.log("✅ Sample community:", communities[0].name)
      }
    } catch (err) {
      console.log("❌ Exception during data access test:", err)
      return false
    }

    console.log("✅ Database setup verification complete - all checks passed!")
    return true
  } catch (error) {
    console.error("❌ Error during database setup check:", error)
    return false
  }
}
