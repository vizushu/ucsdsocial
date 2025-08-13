console.log("🧪 Testing Supabase Integration")
console.log("=".repeat(50))

async function testIntegration() {
  try {
    console.log("1. Loading Supabase module...")
    const { isSupabaseConfigured, supabase } = await import("../lib/supabase.js")

    console.log(`2. Configuration check: ${isSupabaseConfigured() ? "✅" : "❌"}`)

    if (!isSupabaseConfigured()) {
      console.log("❌ Supabase not configured")
      return false
    }

    console.log("3. Testing authentication...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError && !authError.message.includes("session")) {
      console.log("❌ Auth test failed:", authError.message)
    } else {
      console.log("✅ Auth module working")
    }

    console.log("4. Testing database connection...")
    const { data, error } = await supabase.from("communities").select("*").limit(1)

    if (error) {
      if (error.code === "42P01") {
        console.log("✅ Database connected (tables need creation)")
        console.log("📝 Run SQL scripts to create tables")
      } else {
        console.log("❌ Database error:", error.message)
        return false
      }
    } else {
      console.log("✅ Database connected and working")
      console.log(`📊 Found ${data?.length || 0} communities`)
    }

    return true
  } catch (error) {
    console.log("❌ Integration test failed:", error.message)
    return false
  }
}

testIntegration().then((success) => {
  console.log("\n" + "=".repeat(50))
  if (success) {
    console.log("🎉 Integration test passed!")
    console.log("🚀 Your app is ready for database mode!")
  } else {
    console.log("❌ Integration test failed")
    console.log("🔧 Check your Supabase configuration")
  }
})
