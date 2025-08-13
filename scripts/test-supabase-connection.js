console.log("🔌 Testing Supabase Connection")
console.log("=".repeat(50))

async function testSupabaseConnection() {
  try {
    // Check environment first
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log(`Environment check: URL=${hasUrl}, KEY=${hasKey}`)

    if (!hasUrl || !hasKey) {
      console.log("❌ Missing environment variables - cannot test connection")
      return false
    }

    // Import and test Supabase
    const { supabase, isSupabaseConfigured } = await import("../lib/supabase.js")

    console.log(`Configuration check: ${isSupabaseConfigured() ? "✅" : "❌"}`)

    if (!isSupabaseConfigured()) {
      console.log("❌ Supabase not configured properly")
      return false
    }

    // Test 1: Basic connection
    console.log("\n🔍 Testing basic connection...")
    try {
      const { data, error } = await supabase.from("communities").select("count", { count: "exact", head: true })

      if (error) {
        console.log("❌ Connection test failed:", error.message)
        console.log("Error code:", error.code)
        console.log("Error details:", error.details)
        return false
      } else {
        console.log("✅ Basic connection successful")
      }
    } catch (connError) {
      console.log("❌ Connection exception:", connError.message)
      return false
    }

    // Test 2: Table existence
    console.log("\n📋 Testing table existence...")
    const tables = [
      "communities",
      "channels",
      "community_members",
      "messages",
      "itinerary_activities",
      "checklist_items",
      "food_items",
    ]
    let tablesExist = 0

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("id").limit(1)
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          if (error.code === "42P01") {
            console.log(`   Table '${table}' does not exist`)
          }
        } else {
          console.log(`✅ ${table}: exists`)
          tablesExist++
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    console.log(`\nTables found: ${tablesExist}/${tables.length}`)

    // Test 3: Data queries
    if (tablesExist > 0) {
      console.log("\n📊 Testing data queries...")

      try {
        const { data: communities, error: commError } = await supabase.from("communities").select("*").limit(5)

        if (commError) {
          console.log("❌ Communities query failed:", commError.message)
        } else {
          console.log(`✅ Communities query successful: ${communities?.length || 0} records`)
          if (communities && communities.length > 0) {
            console.log(`   Sample: "${communities[0].name}"`)
          }
        }
      } catch (queryError) {
        console.log("❌ Query exception:", queryError.message)
      }
    }

    // Test 4: Auth check
    console.log("\n🔐 Testing authentication...")
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        if (authError.message.includes("session") || authError.message.includes("Auth")) {
          console.log("ℹ️ No active session (expected)")
        } else {
          console.log("❌ Auth error:", authError.message)
        }
      } else if (user) {
        console.log("✅ User authenticated:", user.email)
      } else {
        console.log("ℹ️ No user currently authenticated (expected)")
      }
    } catch (authException) {
      console.log("❌ Auth exception:", authException.message)
    }

    return tablesExist === tables.length
  } catch (error) {
    console.log("❌ Test suite failed:", error.message)
    return false
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    console.log("\n" + "=".repeat(50))
    if (success) {
      console.log("🎉 All Supabase tests passed! Database is ready.")
    } else {
      console.log("⚠️ Some tests failed. Check the output above.")
      console.log("\n🔧 Next steps:")
      console.log("1. Ensure Supabase integration is added to your v0 project")
      console.log("2. Run the SQL scripts to create missing tables")
      console.log("3. Check your Supabase project settings")
    }
  })
  .catch((error) => {
    console.log("💥 Test suite crashed:", error.message)
  })
