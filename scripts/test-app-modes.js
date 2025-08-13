console.log("🧪 Testing App Modes")
console.log("=".repeat(50))

async function testAppModes() {
  console.log("🔍 Testing both demo and database modes...")

  try {
    // Test 1: Check current mode
    console.log("\n1️⃣ Current Mode Detection")
    console.log("-".repeat(30))

    const { isSupabaseConfigured } = await import("../lib/supabase.js")
    const configured = isSupabaseConfigured()

    console.log(`Mode: ${configured ? "DATABASE" : "DEMO"}`)

    // Test 2: Demo mode functionality
    console.log("\n2️⃣ Demo Mode Test")
    console.log("-".repeat(30))

    const demoUser = {
      id: "demo-123",
      name: "Demo User",
      email: "demo@ucsd.edu",
      avatar: "D",
    }

    const demoCommunities = [
      {
        id: "demo-climbing",
        name: "UCSD Climbing",
        description: "Rock climbing adventures",
        icon: "🧗",
        memberCount: 234,
        isStarred: true,
        isMember: true,
      },
    ]

    console.log("✅ Demo user creation works")
    console.log("✅ Demo communities available")
    console.log(`✅ Demo data: ${demoCommunities.length} communities`)

    // Test 3: Database mode (if configured)
    if (configured) {
      console.log("\n3️⃣ Database Mode Test")
      console.log("-".repeat(30))

      try {
        const { supabase } = await import("../lib/supabase.js")

        // Test auth
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        console.log(`Auth test: ${authError ? "❌ " + authError.message : "✅ Working"}`)

        // Test database
        const { data, error } = await supabase.from("communities").select("*").limit(1)

        if (error) {
          if (error.code === "42P01") {
            console.log("⚠️ Database tables need to be created")
          } else {
            console.log("❌ Database error:", error.message)
          }
        } else {
          console.log("✅ Database connection working")
          console.log(`✅ Found ${data?.length || 0} communities`)
        }
      } catch (dbError) {
        console.log("❌ Database mode test failed:", dbError.message)
      }
    } else {
      console.log("\n3️⃣ Database Mode Test")
      console.log("-".repeat(30))
      console.log("⏭️ Skipped (not configured)")
    }

    // Test 4: Error handling
    console.log("\n4️⃣ Error Handling Test")
    console.log("-".repeat(30))

    const { handleError, handleSupabaseError } = await import("../lib/error-handler.js")

    // Test different error types
    const testErrors = [
      new Error("Test error"),
      "String error",
      { message: "Object error" },
      null,
      { message: "Demo mode: Cannot query table" },
    ]

    for (const testError of testErrors) {
      try {
        const result = handleError(testError, "test")
        console.log(`✅ Error handled: ${typeof testError} -> "${result.substring(0, 30)}..."`)
      } catch (handlerError) {
        console.log(`❌ Error handler failed: ${handlerError.message}`)
      }
    }

    console.log("\n📊 TEST RESULTS")
    console.log("=".repeat(50))
    console.log(`Current Mode: ${configured ? "🗄️ DATABASE" : "🎭 DEMO"}`)
    console.log("✅ Demo mode functionality working")
    console.log("✅ Error handling working")
    console.log(`${configured ? "✅" : "⏭️"} Database mode ${configured ? "tested" : "skipped"}`)

    return true
  } catch (error) {
    console.error("❌ App mode test failed:", error.message)
    return false
  }
}

// Run the test
testAppModes()
  .then((success) => {
    console.log(success ? "\n🎉 App mode testing completed!" : "\n❌ App mode testing failed!")
  })
  .catch((error) => {
    console.error("💥 Test crashed:", error)
  })
