import { checkDatabaseSetup } from "../lib/supabase.js"

async function testDatabaseSetup() {
  console.log("🧪 Testing database setup function...\n")

  try {
    const isSetup = await checkDatabaseSetup()
    console.log("Database setup result:", isSetup ? "✅ TRUE" : "❌ FALSE")

    if (!isSetup) {
      console.log("❌ checkDatabaseSetup() returned false - this is why you're in demo mode")
    } else {
      console.log("✅ checkDatabaseSetup() returned true - database should be working")
    }
  } catch (error) {
    console.log("❌ Error in checkDatabaseSetup():", error.message)
  }
}

testDatabaseSetup().catch(console.error)
