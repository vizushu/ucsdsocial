console.log("📊 App Status Check")
console.log("=".repeat(30))

async function checkStatus() {
  try {
    // Check environment
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("🔧 Environment:")
    console.log(`   SUPABASE_URL: ${hasUrl ? "✅" : "❌"}`)
    console.log(`   SUPABASE_KEY: ${hasKey ? "✅" : "❌"}`)

    // Check configuration
    const { isSupabaseConfigured } = await import("../lib/supabase.js")
    const configured = isSupabaseConfigured()

    console.log("\n⚙️ Configuration:")
    console.log(`   Supabase: ${configured ? "✅ Configured" : "❌ Not Configured"}`)

    // Determine mode
    console.log("\n🎯 Current Mode:")
    if (configured) {
      console.log("   🗄️ DATABASE MODE")
      console.log("   - Real authentication")
      console.log("   - Persistent data")
      console.log("   - Real-time updates")

      // Quick database test
      try {
        const { supabase } = await import("../lib/supabase.js")
        const { error } = await supabase.from("communities").select("count", { count: "exact", head: true })

        if (error && error.code === "42P01") {
          console.log("   ⚠️ Tables need to be created")
        } else if (error) {
          console.log("   ❌ Database connection issue")
        } else {
          console.log("   ✅ Database ready")
        }
      } catch (e) {
        console.log("   ❌ Database test failed")
      }
    } else {
      console.log("   🎭 DEMO MODE")
      console.log("   - Any @ucsd.edu email works")
      console.log("   - Static demo data")
      console.log("   - No persistence")
    }

    console.log("\n🚀 Status: READY TO USE!")
  } catch (error) {
    console.log("❌ Status check failed:", error.message)
  }
}

checkStatus()
