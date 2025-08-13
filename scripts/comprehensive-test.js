console.log("🚀 Starting Comprehensive App Test Suite")
console.log("=".repeat(60))

// Test 1: Environment Variables
console.log("\n📋 TEST 1: Environment Variables")
console.log("-".repeat(40))

const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
}

let envScore = 0
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

for (const [key, value] of Object.entries(envVars)) {
  const isRequired = requiredEnvVars.includes(key)
  const status = value ? "✅" : isRequired ? "❌" : "⚪"
  console.log(`${status} ${key}: ${value ? "SET" : "NOT SET"}`)

  if (value && isRequired) envScore++
  if (value && key === "NEXT_PUBLIC_SUPABASE_URL") {
    console.log(`   URL Preview: ${value.substring(0, 30)}...`)
  }
  if (value && key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
    console.log(`   Key Preview: ${value.substring(0, 30)}...`)
  }
}

console.log(`\nEnvironment Score: ${envScore}/${requiredEnvVars.length}`)

// Test 2: Supabase Configuration Check
console.log("\n🔧 TEST 2: Supabase Configuration")
console.log("-".repeat(40))

const hasRequiredEnvVars = envScore === requiredEnvVars.length
console.log(`Required env vars present: ${hasRequiredEnvVars ? "✅" : "❌"}`)

if (hasRequiredEnvVars) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate URL format
  const urlValid = url && url.startsWith("https://") && url.includes(".supabase.co")
  console.log(`URL format valid: ${urlValid ? "✅" : "❌"}`)

  // Validate key format (should be a long string)
  const keyValid = key && key.length > 100
  console.log(`Key format valid: ${keyValid ? "✅" : "❌"}`)

  if (!urlValid) {
    console.log(`❌ URL should be in format: https://your-project.supabase.co`)
  }
  if (!keyValid) {
    console.log(`❌ Anon key should be a long JWT token (100+ characters)`)
  }
} else {
  console.log("❌ Cannot validate configuration - missing required environment variables")
}

console.log("\n🔍 TEST 3: Module Import Test")
console.log("-".repeat(40))

try {
  // Test if we can import our modules
  const { isSupabaseConfigured } = await import("../lib/supabase.js")
  console.log("✅ Supabase module imported successfully")

  const configured = isSupabaseConfigured()
  console.log(`Supabase configured: ${configured ? "✅" : "❌"}`)

  if (configured) {
    console.log("✅ Configuration check passed")
  } else {
    console.log("❌ Configuration check failed - will use demo mode")
  }
} catch (error) {
  console.log("❌ Module import failed:", error.message)
}

console.log("\n📊 TEST SUMMARY")
console.log("=".repeat(60))
console.log(`Environment Variables: ${envScore}/${requiredEnvVars.length} required vars set`)
console.log(`Supabase Configuration: ${hasRequiredEnvVars ? "CONFIGURED" : "NOT CONFIGURED"}`)
console.log(`Expected App Mode: ${hasRequiredEnvVars ? "DATABASE MODE" : "DEMO MODE"}`)

if (!hasRequiredEnvVars) {
  console.log("\n🔧 SETUP INSTRUCTIONS:")
  console.log("1. Add Supabase integration in v0 project settings, OR")
  console.log("2. Manually set these environment variables:")
  console.log("   - NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co")
  console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here")
  console.log("3. Run the SQL scripts to create database tables")
  console.log("4. Refresh the application")
}

console.log("\n✅ Comprehensive test completed!")
