console.log("🗄️ Setting up Supabase Database")
console.log("=".repeat(50))

async function setupDatabase() {
  try {
    // Check if Supabase is configured
    const { isSupabaseConfigured, supabase } = await import("../lib/supabase.js")

    if (!isSupabaseConfigured()) {
      console.log("❌ Supabase not configured. Please add the integration first.")
      console.log("\n🔧 Steps to configure:")
      console.log("1. Add Supabase integration in v0 project settings")
      console.log("2. Or manually set environment variables:")
      console.log("   - NEXT_PUBLIC_SUPABASE_URL")
      console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
      return false
    }

    console.log("✅ Supabase is configured!")
    console.log("🔍 Testing connection...")

    // Test basic connection
    const { data, error } = await supabase.from("communities").select("count", { count: "exact", head: true })

    if (error && error.code === "42P01") {
      console.log("📋 Tables don't exist yet - this is expected for new setup")
      console.log("🚀 Ready to create database tables!")
      return true
    } else if (error) {
      console.log("❌ Connection error:", error.message)
      return false
    } else {
      console.log("✅ Database connection successful!")
      console.log("ℹ️ Tables may already exist")
      return true
    }
  } catch (error) {
    console.log("❌ Setup failed:", error.message)
    return false
  }
}

// Run setup check
setupDatabase().then((success) => {
  if (success) {
    console.log("\n🎉 Database setup check completed!")
    console.log("📝 Next: Run the SQL scripts to create tables")
  } else {
    console.log("\n❌ Database setup failed. Check configuration.")
  }
})
