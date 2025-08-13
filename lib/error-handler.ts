import { toast } from "sonner"

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const handleError = (error: unknown, fallbackMessage = "An unexpected error occurred"): string => {
  console.error("🚨 Error Details:", {
    error,
    type: typeof error,
    constructor: error?.constructor?.name,
    keys: error && typeof error === "object" ? Object.keys(error) : "N/A",
  })

  let message = fallbackMessage

  try {
    // Handle null/undefined
    if (error == null) {
      message = fallbackMessage
    }
    // Handle Error instances
    else if (error instanceof Error) {
      message = error.message || fallbackMessage
    }
    // Handle AppError instances
    else if (error instanceof AppError) {
      message = error.message
    }
    // Handle strings
    else if (typeof error === "string" && error.trim()) {
      message = error.trim()
    }
    // Handle objects with message properties
    else if (error && typeof error === "object") {
      const errorObj = error as any

      if (errorObj.message && typeof errorObj.message === "string" && errorObj.message.trim()) {
        message = errorObj.message.trim()
      } else if (errorObj.error && typeof errorObj.error === "string" && errorObj.error.trim()) {
        message = errorObj.error.trim()
      } else if (errorObj.error && errorObj.error.message) {
        message = errorObj.error.message
      } else if (errorObj.details && typeof errorObj.details === "string") {
        message = errorObj.details
      } else if (errorObj.hint && typeof errorObj.hint === "string") {
        message = errorObj.hint
      } else {
        message = fallbackMessage
      }
    }
    // Handle everything else
    else {
      message = fallbackMessage
    }
  } catch (parseError) {
    console.error("❌ Error parsing error:", parseError)
    message = fallbackMessage
  }

  // Clean up demo mode messages
  if (message.includes("Demo mode:")) {
    message = message.replace("Demo mode: ", "")
  }

  // Final validation
  if (!message || typeof message !== "string" || message.trim() === "") {
    message = fallbackMessage
  }

  // Show toast notification
  toast.error(message)
  return message
}

export const handleSupabaseError = (error: any, context = "database operation"): string => {
  console.error(`🔥 Supabase error in ${context}:`, error)

  // Handle demo mode errors gracefully
  if (error?.message?.includes("Demo mode:")) {
    return handleError(new AppError("This feature requires database setup. Currently in demo mode."))
  }

  // Handle specific Supabase error codes
  if (error?.code) {
    switch (error.code) {
      case "PGRST116":
        return handleError(new AppError("No data found"))
      case "23505":
        return handleError(new AppError("This item already exists"))
      case "42P01":
        return handleError(new AppError("Database table not found. Please set up the database first."))
      case "42501":
        return handleError(new AppError("Permission denied. Please check your authentication."))
      case "PGRST301":
        return handleError(new AppError("Database connection failed. Please check your configuration."))
      default:
        break
    }
  }

  // Handle authentication errors
  if (error?.message && typeof error.message === "string") {
    const msg = error.message.toLowerCase()
    if (msg.includes("jwt") || msg.includes("auth")) {
      return handleError(new AppError("Authentication error. Please log in again."))
    }
    if (msg.includes("fetch") || msg.includes("network")) {
      return handleError(new AppError("Network error. Please check your connection."))
    }
    if (msg.includes("cannot query") || msg.includes("cannot insert")) {
      return handleError(new AppError("Database not configured. Using demo mode."))
    }
  }

  // Default handling
  return handleError(error, `A ${context} error occurred. Please try again.`)
}

// Utility function to check if error is a demo mode error
export const isDemoModeError = (error: any): boolean => {
  return (
    error?.message?.includes("Demo mode:") ||
    error?.message?.includes("cannot query") ||
    error?.message?.includes("cannot insert")
  )
}
