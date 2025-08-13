import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Environment variable checking with better validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Supabase Environment Check:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValid: supabaseUrl ? supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co") : false,
  keyValid: supabaseAnonKey ? supabaseAnonKey.length > 100 : false,
})

// Robust configuration check
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("❌ Missing Supabase environment variables")
    return false
  }

  if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    console.log("❌ Invalid Supabase URL format")
    return false
  }

  if (supabaseAnonKey.length < 100) {
    console.log("❌ Invalid Supabase key format")
    return false
  }

  console.log("✅ Supabase is properly configured")
  return true
}

// Create a comprehensive dummy client for demo mode
const createDummyClient = () => {
  console.log("🎭 Creating dummy Supabase client for demo mode")

  return {
    auth: {
      signInWithPassword: () => Promise.reject(new Error("Demo mode: Use any @ucsd.edu email")),
      signInWithOAuth: () => Promise.reject(new Error("Demo mode: Social login not available")),
      signUp: () => Promise.reject(new Error("Demo mode: Use any @ucsd.edu email")),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => console.log("🎭 Demo auth subscription unsubscribed"),
          },
        },
      }),
    },
    from: (table: string) => ({
      select: () => Promise.reject(new Error(`Demo mode: Cannot query ${table} table`)),
      insert: () => Promise.reject(new Error(`Demo mode: Cannot insert into ${table} table`)),
      update: () => Promise.reject(new Error(`Demo mode: Cannot update ${table} table`)),
      delete: () => Promise.reject(new Error(`Demo mode: Cannot delete from ${table} table`)),
      upsert: () => Promise.reject(new Error(`Demo mode: Cannot upsert ${table} table`)),
    }),
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => {
          console.log(`🎭 Demo channel subscription: ${name}`)
          return { unsubscribe: () => {} }
        },
      }),
    }),
  }
}

// Singleton pattern for client creation
let _supabaseClient: SupabaseClient | any = null

const getSupabaseClient = () => {
  if (_supabaseClient) {
    return _supabaseClient
  }

  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured - using demo client")
    _supabaseClient = createDummyClient()
    return _supabaseClient
  }

  try {
    console.log("🚀 Creating real Supabase client")
    _supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
    return _supabaseClient
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    console.warn("🎭 Falling back to demo client")
    _supabaseClient = createDummyClient()
    return _supabaseClient
  }
}

// Export the client
export const supabase = getSupabaseClient()

// Type definitions
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

// Utility functions with comprehensive error handling
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    console.log("🎭 Demo mode: No user authentication")
    return null
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("⚠️ Auth error:", error.message)
      return null
    }

    return user
  } catch (error) {
    console.error("❌ Error getting current user:", error)
    return null
  }
}

export const joinCommunity = async (userId: string, communityId: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Demo mode: Database operations not available")
  }

  if (!userId || !communityId) {
    throw new Error("User ID and Community ID are required")
  }

  try {
    // Check if already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("community_members")
      .select("id")
      .eq("user_id", userId)
      .eq("community_id", communityId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking membership:", checkError)
      throw new Error(`Failed to check membership: ${checkError.message}`)
    }

    if (existingMember) {
      throw new Error("Already a member of this community")
    }

    // Join the community
    const { data, error } = await supabase
      .from("community_members")
      .insert({
        user_id: userId,
        community_id: communityId,
        is_starred: false,
      })
      .select()

    if (error) {
      console.error("Error joining community:", error)
      throw new Error(`Failed to join community: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("joinCommunity error:", error)
    throw error
  }
}

export const leaveCommunity = async (userId: string, communityId: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Demo mode: Database operations not available")
  }

  if (!userId || !communityId) {
    throw new Error("User ID and Community ID are required")
  }

  try {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("user_id", userId)
      .eq("community_id", communityId)

    if (error) {
      console.error("Error leaving community:", error)
      throw new Error(`Failed to leave community: ${error.message}`)
    }
  } catch (error) {
    console.error("leaveCommunity error:", error)
    throw error
  }
}

export const toggleStarCommunity = async (userId: string, communityId: string, isStarred: boolean) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Demo mode: Database operations not available")
  }

  if (!userId || !communityId) {
    throw new Error("User ID and Community ID are required")
  }

  try {
    const { error } = await supabase
      .from("community_members")
      .update({ is_starred: isStarred })
      .eq("user_id", userId)
      .eq("community_id", communityId)

    if (error) {
      console.error("Error toggling star:", error)
      throw new Error(`Failed to toggle star: ${error.message}`)
    }
  } catch (error) {
    console.error("toggleStarCommunity error:", error)
    throw error
  }
}

export const checkDatabaseSetup = async (): Promise<boolean> => {
  console.log("🔍 Checking database setup...")

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

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1)

        if (error) {
          if (error.code === "42P01" || error.message?.includes("does not exist")) {
            console.log(`❌ Table ${table} does not exist`)
            return false
          }
          console.log(`⚠️ Table ${table} error:`, error.message)
        } else {
          console.log(`✅ Table ${table} exists`)
        }
      } catch (err) {
        console.log(`❌ Error checking table ${table}:`, err)
        return false
      }
    }

    console.log("✅ Database setup verified")
    return true
  } catch (error) {
    console.error("❌ Database setup check failed:", error)
    return false
  }
}
