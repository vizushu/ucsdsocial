console.log("🌐 Diagnosing Network Issues")
console.log("=".repeat(50))

async function diagnoseNetworkIssues() {
  // Test 1: Check if we're in a browser-like environment
  console.log("\n🌍 Environment Check:")
  console.log(`typeof window: ${typeof window}`)
  console.log(`typeof fetch: ${typeof fetch}`)
  console.log(`typeof globalThis: ${typeof globalThis}`)

  // Test 2: Check network connectivity
  console.log("\n📡 Network Connectivity Test:")

  if (typeof fetch !== "undefined") {
    try {
      console.log("Testing basic fetch capability...")

      // Test with a simple endpoint first
      const testUrl = "https://httpbin.org/json"
      console.log(`Attempting fetch to: ${testUrl}`)

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        console.log("✅ Basic fetch working")
        const data = await response.json()
        console.log(`   Response status: ${response.status}`)
      } else {
        console.log(`❌ Fetch failed with status: ${response.status}`)
      }
    } catch (fetchError) {
      console.log("❌ Basic fetch failed:", fetchError.message)
      console.log("   This suggests a fundamental network issue")
    }
  } else {
    console.log("❌ Fetch is not available in this environment")
  }

  // Test 3: Check Supabase URL accessibility
  console.log("\n🔗 Supabase URL Test:")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    console.log(`Testing Supabase URL: ${supabaseUrl}`)

    try {
      // Test if we can reach the Supabase endpoint
      const healthUrl = `${supabaseUrl}/rest/v1/`
      console.log(`Attempting to reach: ${healthUrl}`)

      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test",
          "Content-Type": "application/json",
        },
      })

      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      if (response.status === 200 || response.status === 401) {
        console.log("✅ Supabase endpoint is reachable")
      } else {
        console.log(`⚠️ Unexpected response status: ${response.status}`)
      }
    } catch (supabaseError) {
      console.log("❌ Supabase URL test failed:", supabaseError.message)

      // Check for specific error types
      if (supabaseError.message.includes("Failed to fetch")) {
        console.log("   This is likely a CORS or network connectivity issue")
      }
      if (supabaseError.message.includes("TypeError")) {
        console.log("   This suggests a configuration or environment issue")
      }
    }
  } else {
    console.log("❌ No Supabase URL configured")
  }

  // Test 4: Check for CORS issues
  console.log("\n🚫 CORS Check:")

  if (typeof window !== "undefined") {
    console.log(`Current origin: ${window.location.origin}`)
    console.log("CORS issues may occur if Supabase isn't configured for this domain")
  } else {
    console.log("Not in browser environment - CORS not applicable")
  }

  // Test 5: Environment-specific checks
  console.log("\n⚙️ Environment-Specific Checks:")

  console.log(`User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}`)
  console.log(`Platform: ${typeof navigator !== "undefined" ? navigator.platform : "N/A"}`)

  // Check for common development environment issues
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    const isHTTPS = window.location.protocol === "https:"

    console.log(`Is localhost: ${isLocalhost}`)
    console.log(`Is HTTPS: ${isHTTPS}`)

    if (!isHTTPS && !isLocalhost) {
      console.log("⚠️ Non-HTTPS production environment may cause issues")
    }
  }

  console.log("\n🔍 Recommendations:")

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("1. ❌ Add Supabase environment variables")
  } else {
    console.log("1. ✅ Supabase URL is configured")
  }

  console.log("2. 🔧 If errors persist, try:")
  console.log("   - Check Supabase project status")
  console.log("   - Verify API keys are correct")
  console.log("   - Check network connectivity")
  console.log("   - Try refreshing the page")

  console.log("\n✅ Network diagnosis completed!")
}

// Run the diagnosis
diagnoseNetworkIssues().catch((error) => {
  console.log("💥 Network diagnosis crashed:", error.message)
})
