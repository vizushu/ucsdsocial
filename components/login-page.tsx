"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { handleError } from "@/lib/error-handler"
import type { User } from "@/app/page"
import { ChromeIcon, GithubIcon } from "lucide-react"

interface LoginPageProps {
  onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email.endsWith("@ucsd.edu")) {
      setError("Please use your UCSD email address (@ucsd.edu)")
      setIsLoading(false)
      return
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setIsLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email
                .split("@")[0]
                .replace(/[._]/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            },
          },
        })

        if (signUpError) throw signUpError

        if (data.user && !data.session) {
          setError("Please check your email for a confirmation link")
          setIsLoading(false)
          return
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError
      }
    } catch (err: any) {
      handleError(err)
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      handleError(err)
      setError(err.message || "Social login failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/images/ucsd-social-poster.png" alt="UCSD Social Poster" layout="fill" objectFit="cover" priority />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-[70vh] sm:h-[60vh] 
                   bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
                   rounded-t-3xl shadow-2xl p-6 sm:p-8 flex flex-col 
                   transition-transform duration-700 ease-in-out transform z-10 ${
                     isMounted ? "translate-y-0" : "translate-y-full"
                   }`}
      >
        <div className="flex-grow overflow-y-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-ucsd-navy dark:text-white leading-tight">
              The Best <span className="text-ucsd-gold">UCSD</span>
              <br />
              Experience
            </h1>
          </div>

          <form onSubmit={handleEmailPasswordSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                UCSD Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@ucsd.edu"
                className="mt-1 py-2.5 border-0 border-b-2 border-gray-400/70 dark:border-gray-500/70 rounded-none bg-transparent px-0 focus:border-ucsd-gold focus:ring-0 text-ucsd-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 py-2.5 border-0 border-b-2 border-gray-400/70 dark:border-gray-500/70 rounded-none bg-transparent px-0 focus:border-ucsd-gold focus:ring-0 text-ucsd-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                disabled={isLoading}
              />
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 py-2.5 border-0 border-b-2 border-gray-400/70 dark:border-gray-500/70 rounded-none bg-transparent px-0 focus:border-ucsd-gold focus:ring-0 text-ucsd-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-100/80 dark:bg-red-900/70 p-2.5 rounded-lg border border-red-300 dark:border-red-700">
                {error}
              </div>
            )}

            <div className="flex items-end justify-between pt-6">
              <div className="text-left">
                <p className="text-gray-600 dark:text-gray-300 text-xs mb-0.5">
                  {isSignUp ? "Already have an account?" : "New here?"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError("")
                  }}
                  className="text-ucsd-navy dark:text-ucsd-gold font-semibold text-sm hover:text-ucsd-blue dark:hover:text-yellow-300 transition-colors"
                  disabled={isLoading}
                >
                  {isSignUp ? "Log in" : "Sign up"} →
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-ucsd-gold hover:bg-yellow-500 active:bg-yellow-600 disabled:bg-yellow-300 text-ucsd-navy rounded-full w-20 h-20 sm:w-24 sm:h-24 text-lg font-semibold shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-ucsd-navy border-t-transparent rounded-full animate-spin"></div>
                ) : isSignUp ? (
                  "Sign up"
                ) : (
                  "Log in"
                )}
              </Button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300/70 dark:border-gray-600/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/60 dark:bg-gray-800/60 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <Button
              variant="outline"
              className="w-full bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70 border-gray-300/70 dark:border-gray-600/70 text-gray-700 dark:text-gray-200"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <ChromeIcon className="mr-2 h-5 w-5 text-red-500" />
              )}
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70 border-gray-300/70 dark:border-gray-600/70 text-gray-700 dark:text-gray-200"
              onClick={() => handleSocialLogin("github")}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <GithubIcon className="mr-2 h-5 w-5" />
              )}
              Sign in with GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
