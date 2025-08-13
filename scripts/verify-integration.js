console.log("🔍 Verifying Supabase Integration")
console.log("=".repeat(50))

async function verifyIntegration() {
  console.log("1. Checking Environment Variables...")

  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  let allSet = true
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      console.log(`✅ ${key}: SET`)
      if (key === "NEXT_PUBLIC_SUPABASE_URL") {
        console.log(`   URL: ${value}`)
        // Validate URL format
        if (!value.startsWith("https://") || !value.includes(".supabase.co")) {
          console.log(`⚠️ URL format may be incorrect`)
        }
      }
      if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        console.log(`   Key: ${value.substring(0, 20)}...`)
      }
    } else {
      console.log(`❌ ${key}: NOT SET`)
      allSet = false
    }
  }

  if (!allSet) {
    console.log("\n❌ Integration not complete")
    console.log("🔧 Please add Supabase integration in v0 project settings")
    return false
  }

  console.log("\n2. Testing Supabase Connection...")

  try {
    const { supabase } = await import("../lib/supabase.js")

    // Test connection with a simple query
    const { data, error } = await supabase.from("communities").select("count", { count: "exact", head: true })

    if (error) {
      if (error.code === "42P01") {
        console.log("✅ Connection successful (tables need to be created)")
        return true
      } else {
        console.log("❌ Connection failed:", error.message)
        return false
      }
    } else {
      console.log("✅ Connection successful and tables exist")
      return true
    }
  } catch (error) {
    console.log("❌ Connection test failed:", error.message)
    return false
  }
}

verifyIntegration().then((success) => {
  console.log("\n" + "=".repeat(50))
  if (success) {
    console.log("🎉 Supabase integration verified!")
    console.log("📝 Next steps:")
    console.log("1. Run SQL scripts to create database tables")
    console.log("2. Test the application")
  } else {
    console.log("❌ Integration verification failed")
    console.log("🔧 Please check your Supabase configuration")
  }
})
