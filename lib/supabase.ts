import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced types for the new schema
export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          created_by: string
          member_count: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
          created_by: string
          member_count?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          created_by?: string
          member_count?: number
        }
      }
      channel_categories: {
        Row: {
          id: string
          name: string
          community_id: string
          position: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          community_id: string
          position?: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          community_id?: string
          position?: number
          created_at?: string
          created_by?: string
        }
      }
      channels: {
        Row: {
          id: string
          name: string
          type: string
          community_id: string
          category_id: string | null
          topic: string | null
          position: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          community_id: string
          category_id?: string | null
          topic?: string | null
          position?: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          community_id?: string
          category_id?: string | null
          topic?: string | null
          position?: number
          created_at?: string
          created_by?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          user_id: string
          channel_id: string
          reply_to: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          channel_id: string
          reply_to?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          channel_id?: string
          reply_to?: string | null
          created_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Demo mode fallback data
export const demoData = {
  communities: [
    {
      id: "demo-yosemite",
      name: "Yosemite Trip 2024",
      description: "Planning our epic Yosemite adventure!",
      member_count: 8,
      created_at: new Date().toISOString(),
      created_by: "demo-user",
    },
    {
      id: "demo-study",
      name: "UCSD Study Group",
      description: "Collaborative studying for finals",
      member_count: 15,
      created_at: new Date().toISOString(),
      created_by: "demo-user",
    },
  ],
  channels: [
    {
      id: "demo-general",
      name: "general",
      type: "text",
      community_id: "demo-yosemite",
      category_id: "demo-general-cat",
      topic: "General discussion about the trip",
      position: 0,
      created_at: new Date().toISOString(),
      created_by: "demo-user",
    },
    {
      id: "demo-planning",
      name: "trip-planning",
      type: "text",
      community_id: "demo-yosemite",
      category_id: "demo-planning-cat",
      topic: "Plan our itinerary and activities",
      position: 1,
      created_at: new Date().toISOString(),
      created_by: "demo-user",
    },
  ],
  categories: [
    {
      id: "demo-general-cat",
      name: "General",
      community_id: "demo-yosemite",
      position: 0,
      created_at: new Date().toISOString(),
      created_by: "demo-user",
    },
    {
      id: "demo-planning-cat",
      name: "Trip Planning",
      community_id: "demo-yosemite",
      position: 1,
      created_at: new Date().toISOString(),
      created_by: "demo-user",
    },
  ],
  messages: [
    {
      id: "demo-msg-1",
      content: "Hey everyone! Super excited for our Yosemite trip! 🏔️",
      user_id: "demo-user-1",
      channel_id: "demo-general",
      reply_to: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user: {
        id: "demo-user-1",
        email: "alex@ucsd.edu",
        full_name: "Alex Chen",
      },
    },
    {
      id: "demo-msg-2",
      content: "Same here! I've been looking forward to this for months. The weather looks perfect for hiking.",
      user_id: "demo-user-2",
      channel_id: "demo-general",
      reply_to: null,
      created_at: new Date(Date.now() - 3000000).toISOString(),
      user: {
        id: "demo-user-2",
        email: "sarah@ucsd.edu",
        full_name: "Sarah Johnson",
      },
    },
  ],
}

// Helper function to check if we're in demo mode
export const isDemoMode = () => {
  return !supabaseUrl || supabaseUrl.includes("placeholder") || !supabaseAnonKey
}

// Enhanced error handling
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error)

  if (isDemoMode()) {
    console.log("Running in demo mode - using fallback data")
    return null
  }

  return error
}
