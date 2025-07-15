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

export const handleError = (error: unknown, fallbackMessage = "An unexpected error occurred") => {
  console.error("Full error object:", error)
  console.error("Error type:", typeof error)
  console.error("Error constructor:", error?.constructor?.name)
  console.error("Error keys:", error && typeof error === "object" ? Object.keys(error) : "N/A")

  let message = fallbackMessage

  try {
    // Handle null or undefined
    if (error == null) {
      console.warn("Null or undefined error")
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
    // Handle non-empty strings
    else if (typeof error === "string" && error.trim()) {
      message = error
    }
    // Handle objects
    else if (error && typeof error === "object") {
      const errorObj = error as any

      // Check if it's an empty object
      const keys = Object.keys(errorObj)
      if (keys.length === 0) {
        console.warn("Empty error object detected")
        message = fallbackMessage
      }
      // Try to extract meaningful error message
      else if (errorObj.message && typeof errorObj.message === "string" && errorObj.message.trim()) {
        message = errorObj.message
      } else if (errorObj.error && typeof errorObj.error === "string" && errorObj.error.trim()) {
        message = errorObj.error
      } else if (errorObj.error && errorObj.error.message && typeof errorObj.error.message === "string") {
        message = errorObj.error.message
      } else if (errorObj.details && typeof errorObj.details === "string" && errorObj.details.trim()) {
        message = errorObj.details
      } else if (errorObj.hint && typeof errorObj.hint === "string" && errorObj.hint.trim()) {
        message = errorObj.hint
      } else {
        console.warn("Object error without useful message properties:", errorObj)
        message = fallbackMessage
      }
    }
    // Handle everything else
    else {
      console.warn("Unhandled error type:", typeof error, error)
      message = fallbackMessage
    }
  } catch (parseError) {
    console.error("Error while parsing error:", parseError)
    message = fallbackMessage
  }

  // Final safety check
  if (!message || typeof message !== "string" || message.trim() === "") {
    message = fallbackMessage
  }

  toast.error(message)
  return message
}

export const handleSupabaseError = (error: any, context = "database operation") => {
  console.error(`Supabase error in ${context}:`, error)

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
      default:
        break
    }
  }

  // Handle authentication errors
  if (error?.message && typeof error.message === "string") {
    if (error.message.includes("JWT") || error.message.includes("auth")) {
      return handleError(new AppError("Authentication error. Please log in again."))
    }
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return handleError(new AppError("Network error. Please check your connection."))
    }
  }

  // If we have any error, pass it to the general handler
  return handleError(error, `A ${context} error occurred. Please try again.`)
}
