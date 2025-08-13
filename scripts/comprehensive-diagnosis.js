console.log("🔍 Comprehensive App Diagnosis")
console.log("=".repeat(60))

async function runComprehensiveDiagnosis() {
  const results = {
    environment: false,
    configuration: false,
    connection: false,
    database: false,
    overall: false,
  }

  try {
    // Test 1: Environment Variables
    console.log("\n📋 TEST 1: Environment Variables")
    console.log("-".repeat(40))

    const requiredVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    let envScore = 0
    for (const [key, value] of Object.entries(requiredVars)) {
      if (value) {
        console.log(`✅ ${key}: SET`)
        if (key === "NEXT_PUBLIC_SUPABASE_URL") {
          const isValid = value.startsWith("https://") && value.includes(".supabase.co")
          console.log(`   Format: ${isValid ? "✅ Valid" : "❌ Invalid"}`)
          if (isValid) envScore++
        }
        if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
          const isValid = value.length > 100
          console.log(`   Length: ${isValid ? "✅ Valid" : "❌ Too short"}`)
          if (isValid) envScore++
        }
      } else {
        console.log(`❌ ${key}: NOT SET`)
      }
    }

    results.environment = envScore === 2
    console.log(`Environment Score: ${envScore}/2`)

    // Test 2: Configuration Check
    console.log("\n🔧 TEST 2: Configuration Check")
    console.log("-".repeat(40))

    try {
      // Use dynamic import to avoid module loading issues
      const supabaseModule = await import("../lib/supabase.js")
      const isConfigured = supabaseModule.isSupabaseConfigured()

      console.log(`Configuration Status: ${isConfigured ? "✅ Configured" : "❌ Not Configured"}`)
      results.configuration = isConfigured

      if (isConfigured) {
        console.log("✅ Supabase client should be created successfully")
      } else {
        console.log("🎭 App will run in demo mode")
      }
    } catch (importError) {
      console.log("❌ Failed to import Supabase module:", importError.message)
      results.configuration = false
    }

    // Test 3: Connection Test (only if configured)
    console.log("\n🔌 TEST 3: Connection Test")
    console.log("-".repeat(40))

    if (results.configuration) {
      try {
        const { supabase } = await import("../lib/supabase.js")

        // Test basic connection
        const { data, error } = await supabase.from("communities").select("count", { count: "exact", head: true })

        if (error) {
          if (error.code === "42P01") {
            console.log("✅ Connection successful (tables need to be created)")
            results.connection = true
          } else {
            console.log("❌ Connection failed:", error.message)
            console.log("   Error code:", error.code)
            results.connection = false
          }
        } else {
          console.log("✅ Connection successful and tables exist")
          results.connection = true
        }
      } catch (connectionError) {
        console.log("❌ Connection test failed:", connectionError.message)
        results.connection = false
      }
    } else {
      console.log("⏭️ Skipped (not configured)")
      results.connection = false
    }

    // Test 4: Database Setup Check
    console.log("\n🗄️ TEST 4: Database Setup")
    console.log("-".repeat(40))

    if (results.connection) {
      try {
        const { checkDatabaseSetup } = await import("../lib/supabase.js")
        const isSetup = await checkDatabaseSetup()

        console.log(`Database Setup: ${isSetup ? "✅ Complete" : "❌ Incomplete"}`)
        results.database = isSetup

        if (!isSetup) {
          console.log("📝 Run SQL scripts to create database tables")
        }
      } catch (dbError) {
        console.log("❌ Database check failed:", dbError.message)
        results.database = false
      }
    } else {
      console.log("⏭️ Skipped (no connection)")
      results.database = false
    }

    // Overall Assessment
    results.overall = results.environment && results.configuration && results.connection

    console.log("\n📊 DIAGNOSIS SUMMARY")
    console.log("=".repeat(60))
    console.log(`Environment Variables: ${results.environment ? "✅" : "❌"}`)
    console.log(`Supabase Configuration: ${results.configuration ? "✅" : "❌"}`)
    console.log(`Database Connection: ${results.connection ? "✅" : "❌"}`)
    console.log(`Database Setup: ${results.database ? "✅" : "❌"}`)
    console.log(`Overall Status: ${results.overall ? "✅ READY" : "❌ NEEDS SETUP"}`)

    // Recommendations
    console.log("\n💡 RECOMMENDATIONS")
    console.log("-".repeat(40))

    if (!results.environment) {
      console.log("🔧 1. Add Supabase integration in v0 project settings")
      console.log("   OR manually set environment variables:")
      console.log("   - NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co")
      console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key")
    }

    if (!results.connection && results.configuration) {
      console.log("🔧 2. Check your Supabase project status")
      console.log("   - Verify project is not paused")
      console.log("   - Check API keys are correct")
    }

    if (!results.database && results.connection) {
      console.log("🔧 3. Run SQL scripts to create database tables")
      console.log("   - Execute scripts/01-create-tables.sql")
      console.log("   - Execute scripts/02-create-policies.sql")
      console.log("   - Execute scripts/03-seed-data.sql")
    }

    if (!results.overall) {
      console.log("🎭 4. App will run in DEMO MODE until setup is complete")
    } else {
      console.log("🎉 5. App is ready for DATABASE MODE!")
    }

    return results
  } catch (error) {
    console.error("💥 Diagnosis failed:", error.message)
    return results
  }
}

// Run diagnosis
runComprehensiveDiagnosis()
  .then((results) => {
    console.log("\n✅ Comprehensive diagnosis completed!")
    process.exit(results.overall ? 0 : 1)
  })
  .catch((error) => {
    console.error("💥 Diagnosis crashed:", error)
    process.exit(1)
  })
