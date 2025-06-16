import { NextResponse } from "next/server"
import type { User } from "@/app/page" // Assuming User type is exported from here

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!email.endsWith("@ucsd.edu")) {
      return NextResponse.json({ error: "Please use your UCSD email address (@ucsd.edu)" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Mock authentication logic:
    // In a real application, you would:
    // 1. Hash the incoming password.
    // 2. Query your database for the user by email.
    // 3. Compare the hashed password from the database with the hashed incoming password.
    if (password === "password123") {
      // Replace with secure comparison
      const userName = email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())

      const user: User = {
        id: Math.random().toString(36).substr(2, 9), // Generate a mock ID
        name: userName,
        email: email,
        avatar: userName.charAt(0).toUpperCase(), // Simple avatar from first letter of name
      }

      // In a real app, you might issue a JWT or session cookie here
      return NextResponse.json({ user }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    // Avoid sending detailed error messages to the client in production
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 })
  }
}
