console.log("🔧 Environment Variables Check:")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("Supabase URL (first 30 chars):", process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "...")
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log("Anon Key (first 30 chars):", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + "...")
}

console.log("\n🔍 Additional Environment Variables:")
Object.keys(process.env)
  .filter((key) => key.includes("SUPABASE"))
  .forEach((key) => {
    console.log(`${key}:`, !!process.env[key] ? "Set" : "Not set")
  })
