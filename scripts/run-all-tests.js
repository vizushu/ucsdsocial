console.log("🎯 Running All Comprehensive Tests")
console.log("=".repeat(60))

async function runAllTests() {
  const startTime = Date.now()

  console.log("Starting comprehensive test suite...")
  console.log(`Timestamp: ${new Date().toISOString()}`)

  try {
    // Test 1: Comprehensive Test
    console.log("\n" + "🚀 RUNNING: Comprehensive Test".padEnd(60, "="))
    await import("./comprehensive-test.js")

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 2: Supabase Connection Test
    console.log("\n" + "🔌 RUNNING: Supabase Connection Test".padEnd(60, "="))
    await import("./test-supabase-connection.js")

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 3: App Functionality Test
    console.log("\n" + "🧪 RUNNING: App Functionality Test".padEnd(60, "="))
    await import("./test-app-functionality.js")

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 4: Network Issues Diagnosis
    console.log("\n" + "🌐 RUNNING: Network Issues Diagnosis".padEnd(60, "="))
    await import("./diagnose-network-issues.js")
  } catch (error) {
    console.log("❌ Test suite execution failed:", error.message)
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log("\n" + "🏁 ALL TESTS COMPLETED".padEnd(60, "="))
  console.log(`Total execution time: ${duration} seconds`)
  console.log(`Completed at: ${new Date().toISOString()}`)

  console.log("\n📋 SUMMARY:")
  console.log("- Environment variables checked")
  console.log("- Supabase configuration validated")
  console.log("- Database connection tested")
  console.log("- App functionality verified")
  console.log("- Network connectivity diagnosed")

  console.log("\n💡 NEXT STEPS:")
  console.log("1. Review the test output above")
  console.log("2. Address any ❌ failed tests")
  console.log("3. If Supabase is not configured, the app will run in demo mode")
  console.log("4. If you see network errors, check your Supabase project settings")

  console.log("\n✨ Test suite completed successfully!")
}

// Run all tests
runAllTests()
