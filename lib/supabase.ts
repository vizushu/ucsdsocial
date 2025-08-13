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

  const createDummyQuery = (table: string) => ({
    select: (columns?: string) => {
      console.log(`🎭 Demo mode: Attempted to query ${table} table`)
      return Promise.reject(new Error(`Demo mode: Cannot query ${table} table`))
    },
    insert: (data: any) => {
      console.log(`🎭 Demo mode: Attempted to insert into ${table} table`)
      return Promise.reject(new Error(`Demo mode: Cannot insert into ${table} table`))
    },
    update: (data: any) => {
      console.log(`🎭 Demo mode: Attempted to update ${table} table`)
      return Promise.reject(new Error(`Demo mode: Cannot update ${table} table`))
    },
    delete: () => {
      console.log(`🎭 Demo mode: Attempted to delete from ${table} table`)
      return Promise.reject(new Error(`Demo mode: Cannot delete from ${table} table`))
    },
    upsert: (data: any) => {
      console.log(`🎭 Demo mode: Attempted to upsert ${table} table`)
      return Promise.reject(new Error(`Demo mode: Cannot upsert ${table} table`))
    },
    eq: function (column: string, value: any) {
      return this
    },
    neq: function (column: string, value: any) {
      return this
    },
    gt: function (column: string, value: any) {
      return this
    },
    gte: function (column: string, value: any) {
      return this
    },
    lt: function (column: string, value: any) {
      return this
    },
    lte: function (column: string, value: any) {
      return this
    },
    like: function (column: string, pattern: string) {
      return this
    },
    ilike: function (column: string, pattern: string) {
      return this
    },
    is: function (column: string, value: any) {
      return this
    },
    in: function (column: string, values: any[]) {
      return this
    },
    contains: function (column: string, value: any) {
      return this
    },
    containedBy: function (column: string, value: any) {
      return this
    },
    rangeGt: function (column: string, range: string) {
      return this
    },
    rangeGte: function (column: string, range: string) {
      return this
    },
    rangeLt: function (column: string, range: string) {
      return this
    },
    rangeLte: function (column: string, range: string) {
      return this
    },
    rangeAdjacent: function (column: string, range: string) {
      return this
    },
    overlaps: function (column: string, value: any) {
      return this
    },
    textSearch: function (column: string, query: string) {
      return this
    },
    match: function (query: Record<string, any>) {
      return this
    },
    not: function (column: string, operator: string, value: any) {
      return this
    },
    or: function (filters: string) {
      return this
    },
    filter: function (column: string, operator: string, value: any) {
      return this
    },
    order: function (column: string, options?: { ascending?: boolean }) {
      return this
    },
    limit: function (count: number) {
      return this
    },
    range: function (from: number, to: number) {
      return this
    },
    abortSignal: function (signal: AbortSignal) {
      return this
    },
    single: function () {
      return this
    },
    maybeSingle: function () {
      return this
    },
    csv: function () {
      return this
    },
    geojson: function () {
      return this
    },
    explain: function (options?: any) {
      return this
    },
    rollback: function () {
      return this
    },
    returns: function () {
      return this
    },
  })

  return {
    auth: {
      // Add the missing getSession method
      getSession: () => {
        console.log("🎭 Demo mode: getSession called")
        return Promise.resolve({
          data: { session: null },
          error: null,
        })
      },
      signInWithPassword: (credentials: any) => {
        console.log("🎭 Demo mode: signInWithPassword called")
        // Simulate successful login for @ucsd.edu emails
        if (credentials.email && credentials.email.endsWith("@ucsd.edu")) {
          const mockUser = {
            id: "demo-user-" + Math.random().toString(36).substr(2, 9),
            email: credentials.email,
            user_metadata: {
              name: credentials.email
                .split("@")[0]
                .replace(/[._]/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            },
          }

          // Simulate auth state change
          setTimeout(() => {
            const authCallback = (window as any).__supabase_auth_callback
            if (authCallback) {
              authCallback("SIGNED_IN", { user: mockUser })
            }
          }, 100)

          return Promise.resolve({
            data: { user: mockUser, session: { user: mockUser } },
            error: null,
          })
        } else {
          return Promise.resolve({
            data: { user: null, session: null },
            error: { message: "Please use your UCSD email address" },
          })
        }
      },
      signInWithOAuth: () => {
        console.log("🎭 Demo mode: signInWithOAuth called")
        return Promise.resolve({
          data: { url: null },
          error: { message: "Demo mode: OAuth not available. Use any @ucsd.edu email instead." },
        })
      },
      signUp: (credentials: any) => {
        console.log("🎭 Demo mode: signUp called")
        if (credentials.email && credentials.email.endsWith("@ucsd.edu")) {
          const mockUser = {
            id: "demo-user-" + Math.random().toString(36).substr(2, 9),
            email: credentials.email,
            user_metadata: credentials.options?.data || {
              name: credentials.email
                .split("@")[0]
                .replace(/[._]/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            },
          }

          // Simulate auth state change
          setTimeout(() => {
            const authCallback = (window as any).__supabase_auth_callback
            if (authCallback) {
              authCallback("SIGNED_IN", { user: mockUser })
            }
          }, 100)

          return Promise.resolve({
            data: { user: mockUser, session: { user: mockUser } },
            error: null,
          })
        } else {
          return Promise.resolve({
            data: { user: null, session: null },
            error: { message: "Please use your UCSD email address" },
          })
        }
      },
      signOut: () => {
        console.log("🎭 Demo mode: signOut called")
        // Simulate auth state change
        setTimeout(() => {
          const authCallback = (window as any).__supabase_auth_callback
          if (authCallback) {
            authCallback("SIGNED_OUT", null)
          }
        }, 100)
        return Promise.resolve({ error: null })
      },
      getUser: () => {
        console.log("🎭 Demo mode: getUser called")
        return Promise.resolve({ data: { user: null }, error: null })
      },
      onAuthStateChange: (callback: Function) => {
        console.log("🎭 Demo mode: onAuthStateChange called")
        // Store callback for later use
        ;(window as any).__supabase_auth_callback = callback

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                console.log("🎭 Demo auth subscription unsubscribed")
                delete (window as any).__supabase_auth_callback
              },
            },
          },
        }
      },
    },
    from: (table: string) => createDummyQuery(table),
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

// Database types
export interface Community {
  id: string
  name: string
  description: string
  icon: string
  member_count: number
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
  user_name: string
  user_avatar: string
  reply_to?: string
  created_at: string
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
