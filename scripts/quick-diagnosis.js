// Quick diagnosis script to run immediately
console.log("⚡ Quick Diagnosis")
console.log("=".repeat(30))

// Check 1: Environment
console.log("1. Environment Variables:")
const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
console.log(`   SUPABASE_URL: ${hasUrl ? "✅" : "❌"}`)
console.log(`   SUPABASE_KEY: ${hasKey ? "✅" : "❌"}`)

// Check 2: Configuration
console.log("\n2. App Configuration:")
if (hasUrl && hasKey) {
  console.log("   ✅ Should run in DATABASE mode")
} else {
  console.log("   ⚠️ Will run in DEMO mode")
}

// Check 3: Expected behavior
console.log("\n3. Expected Behavior:")
if (hasUrl && hasKey) {
  console.log("   - Real authentication with Supabase")
  console.log("   - Database-backed communities and messages")
  console.log("   - Persistent data")
} else {
  console.log("   - Demo authentication (any @ucsd.edu email)")
  console.log("   - Static demo communities")
  console.log("   - No data persistence")
}

// Check 4: Error analysis
console.log("\n4. Error Analysis:")
console.log("   The 'Failed to fetch' error suggests:")
console.log("   - Supabase client is being created even without config")
console.log("   - Network request attempted to invalid/missing URL")
console.log("   - Need better environment variable checking")

console.log("\n✅ Quick diagnosis complete!")
console.log("\n🔧 Recommended action:")
if (!hasUrl || !hasKey) {
  console.log("   Add Supabase integration to enable database mode")
} else {
  console.log("   Check Supabase project settings and API keys")
}
