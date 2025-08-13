import { supabase } from "../lib/supabase.js"

async function runDatabaseChecks() {
  console.log("🔍 Running comprehensive database checks...\n")

  // Check 1: Environment Variables
  console.log("1. Environment Variables:")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
  console.log("")

  // Check 2: Supabase Connection
  console.log("2. Supabase Connection:")
  try {
    const { data, error } = await supabase.from("communities").select("count", { count: "exact", head: true })
    if (error) {
      console.log("❌ Connection failed:", error.message)
      console.log("Error code:", error.code)
      console.log("Error details:", error.details)
    } else {
      console.log("✅ Connection successful")
    }
  } catch (err) {
    console.log("❌ Connection error:", err.message)
  }
  console.log("")

  // Check 3: Table Existence
  console.log("3. Table Existence:")
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
      const { data, error } = await supabase.from(table).select("id").limit(1)
      if (error) {
        console.log(`❌ ${table}:`, error.message)
      } else {
        console.log(`✅ ${table}: exists`)
      }
    } catch (err) {
      console.log(`❌ ${table}:`, err.message)
    }
  }
  console.log("")

  // Check 4: Data Verification
  console.log("4. Data Verification:")
  try {
    const { data: communities, error: commError } = await supabase.from("communities").select("*")
    if (commError) {
      console.log("❌ Communities data:", commError.message)
    } else {
      console.log(`✅ Communities: ${communities?.length || 0} records found`)
      if (communities && communities.length > 0) {
        console.log("Sample community:", communities[0].name)
      }
    }

    const { data: channels, error: chanError } = await supabase.from("channels").select("*")
    if (chanError) {
      console.log("❌ Channels data:", chanError.message)
    } else {
      console.log(`✅ Channels: ${channels?.length || 0} records found`)
    }

    const { data: members, error: memError } = await supabase.from("community_members").select("*")
    if (memError) {
      console.log("❌ Community members data:", memError.message)
    } else {
      console.log(`✅ Community members: ${members?.length || 0} records found`)
    }
  } catch (err) {
    console.log("❌ Data verification failed:", err.message)
  }
  console.log("")

  // Check 5: Authentication
  console.log("5. Authentication:")
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      console.log("❌ Auth check:", error.message)
    } else if (user) {
      console.log("✅ User authenticated:", user.email)
    } else {
      console.log("ℹ️ No user currently authenticated")
    }
  } catch (err) {
    console.log("❌ Auth error:", err.message)
  }
  console.log("")

  // Check 6: RLS Policies
  console.log("6. Row Level Security:")
  try {
    // Try to query without authentication context
    const { data, error } = await supabase.from("communities").select("*").limit(1)
    if (error) {
      console.log("❌ RLS might be blocking queries:", error.message)
    } else {
      console.log("✅ RLS policies allow public read access")
    }
  } catch (err) {
    console.log("❌ RLS check failed:", err.message)
  }

  console.log("\n🏁 Database checks complete!")
}

// Run the checks
runDatabaseChecks().catch(console.error)
