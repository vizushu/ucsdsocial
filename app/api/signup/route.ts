import { NextResponse } from "next/server"
import type { User } from "@/app/page"

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

    // Mock user creation logic:
    // In a real application, you would:
    // 1. Check if the user already exists in the database.
    // 2. Hash the password.
    // 3. Save the new user to the database.

    const userName = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase())

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userName,
      email: email,
      avatar: userName.charAt(0).toUpperCase(),
    }

    // Return the newly created user, simulating an auto-login after signup.
    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 })
  }
}
