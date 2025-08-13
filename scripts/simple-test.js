console.log("🔧 Simple Environment Test:")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("URL starts with:", process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20))
}

console.log("\n🔍 All SUPABASE env vars:")
Object.keys(process.env)
  .filter((key) => key.includes("SUPABASE"))
  .forEach((key) => {
    console.log(`${key}: ${process.env[key] ? "SET" : "NOT SET"}`)
  })
