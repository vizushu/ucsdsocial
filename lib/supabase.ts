import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase config check:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "undefined",
})

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const configured = !!(supabaseUrl && supabaseAnonKey)
  console.log("isSupabaseConfigured:", configured)
  return configured
}

// Create a dummy client for when Supabase is not configured
const createDummyClient = () => ({
  auth: {
    signInWithPassword: () => Promise.reject(new Error("Supabase not configured - using demo mode")),
    signInWithOAuth: () => Promise.reject(new Error("Supabase not configured - using demo mode")),
    signUp: () => Promise.reject(new Error("Supabase not configured - using demo mode")),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.reject(new Error("Database not configured - using demo mode")),
    insert: () => Promise.reject(new Error("Database not configured - using demo mode")),
    update: () => Promise.reject(new Error("Database not configured - using demo mode")),
    delete: () => Promise.reject(new Error("Database not configured - using demo mode")),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
  }),
})

// Create the actual Supabase client or dummy client
let _supabaseClient: SupabaseClient | any = null

const getSupabaseClient = () => {
  if (_supabaseClient) return _supabaseClient

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured - creating dummy client for demo mode")
    _supabaseClient = createDummyClient()
    return _supabaseClient
  }

  console.log("Creating real Supabase client")
  _supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
  return _supabaseClient
}

// Export the client
export const supabase = getSupabaseClient()

// Rest of the file remains the same...
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

// Utility functions with better error handling
export const getCurrentUser = async () => {
  try {
    if (!isSupabaseConfigured()) {
      console.log("Supabase not configured - no user available")
      return null
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("getCurrentUser error:", error.message)
      return null
    }
    return user
  } catch (error) {
    console.log("Error getting current user:", error)
    return null
  }
}

export const getCommunityMembers = async (communityId: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured - using demo mode")
  }

  try {
    const { data, error } = await supabase.from("community_members").select("*").eq("community_id", communityId)

    if (error) {
      console.error("getCommunityMembers error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting community members:", error)
    throw error
  }
}

export const getUserCommunities = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured - using demo mode")
  }

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
    throw error
  }
}

export const joinCommunity = async (userId: string, communityId: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured - using demo mode")
  }

  try {
    console.log(`Attempting to join community ${communityId} for user ${userId}`)

    if (!userId || !communityId) {
      throw new Error("User ID and Community ID are required")
    }

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
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured - using demo mode")
  }

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
      throw error
    }

    console.log("Successfully left community")
  } catch (error) {
    console.error("leaveCommunity error:", error)
    throw error
  }
}

export const toggleStarCommunity = async (userId: string, communityId: string, isStarred: boolean) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured - using demo mode")
  }

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
      throw error
    }

    console.log("Successfully toggled star")
  } catch (error) {
    console.error("toggleStarCommunity error:", error)
    throw error
  }
}

export const checkDatabaseSetup = async (): Promise<boolean> => {
  console.log("🔍 Starting database setup check...")

  if (!isSupabaseConfigured()) {
    console.log("❌ Supabase not configured")
    return false
  }

  try {
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
          console.log(`❌ Table ${table} check failed:`, error.message)
          if (error.code === "42P01" || error.message?.includes("does not exist")) {
            console.log(`❌ Table ${table} does not exist`)
            return false
          }
        } else {
          console.log(`✅ Table ${table} exists`)
        }
      } catch (err) {
        console.log(`❌ Exception checking table ${table}:`, err)
        return false
      }
    }

    console.log("✅ Database setup verification complete!")
    return true
  } catch (error) {
    console.error("❌ Error during database setup check:", error)
    return false
  }
}
