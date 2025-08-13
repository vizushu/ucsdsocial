"use client"

import { useState, useEffect, useRef } from "react"
import { supabase, isDemoMode, demoData } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Reply, MoreHorizontal } from "lucide-react"
import type { User } from "@/app/page"

interface Message {
  id: string
  content: string
  user_id: string
  channel_id: string
  reply_to?: string | null
  created_at: string
  user?: {
    id: string
    email: string
    full_name: string | null
  }
}

interface EnhancedChatChannelProps {
  channelId: string
  channelName: string
  user: User
}

export default function EnhancedChatChannel({ channelId, channelName, user }: EnhancedChatChannelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadMessages()

    if (!isDemoMode() && supabase) {
      // Subscribe to new messages
      const messagesSubscription = supabase
        .channel(`messages:${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${channelId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            setMessages((prev) => [...prev, newMessage])
          },
        )
        .subscribe()

      // Subscribe to typing indicators
      const typingChannel = supabase.channel(`typing:${channelId}`)

      typingChannel
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          const { user_id, is_typing } = payload
          setTypingUsers((prev) => {
            if (is_typing && user_id !== user.id) {
              return prev.includes(user_id) ? prev : [...prev, user_id]
            } else {
              return prev.filter((id) => id !== user_id)
            }
          })
        })
        .subscribe()

      return () => {
        messagesSubscription.unsubscribe()
        typingChannel.unsubscribe()
      }
    }
  }, [channelId, user.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      if (isDemoMode() || !supabase) {
        // Load demo messages
        const channelMessages = demoData.messages.filter((m) => m.channel_id === channelId)
        setMessages(channelMessages)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          user:profiles(id, email, full_name)
        `)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) {
        console.error("Error loading messages:", error)
        // Fallback to demo data
        const channelMessages = demoData.messages.filter((m) => m.channel_id === channelId)
        setMessages(channelMessages)
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error("Error in loadMessages:", error)
      const channelMessages = demoData.messages.filter((m) => m.channel_id === channelId)
      setMessages(channelMessages)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    setNewMessage("")
    setReplyTo(null)

    try {
      if (isDemoMode() || !supabase) {
        // Demo mode - add message locally
        const demoMessage: Message = {
          id: `demo-msg-${Date.now()}`,
          content: messageContent,
          user_id: user.id,
          channel_id: channelId,
          reply_to: replyTo?.id || null,
          created_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email,
            full_name: user.name,
          },
        }
        setMessages((prev) => [...prev, demoMessage])
        return
      }

      const { error } = await supabase.from("messages").insert({
        content: messageContent,
        user_id: user.id,
        channel_id: channelId,
        reply_to: replyTo?.id || null,
      })

      if (error) {
        console.error("Error sending message:", error)
        // Add message locally as fallback
        const fallbackMessage: Message = {
          id: `fallback-${Date.now()}`,
          content: messageContent,
          user_id: user.id,
          channel_id: channelId,
          reply_to: replyTo?.id || null,
          created_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email,
            full_name: user.name,
          },
        }
        setMessages((prev) => [...prev, fallbackMessage])
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
    }
  }

  const handleTyping = () => {
    if (isDemoMode() || !supabase) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing indicator
    supabase.channel(`typing:${channelId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id, is_typing: true },
    })

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(`typing:${channelId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: user.id, is_typing: false },
      })
    }, 3000)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUserName = (message: Message) => {
    if (message.user?.full_name) return message.user.full_name
    if (message.user?.email) return message.user.email.split("@")[0]
    return "Unknown User"
  }

  const getUserAvatar = (message: Message) => {
    const name = getUserName(message)
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">#{channelName}</h2>
        <p className="text-sm text-muted-foreground">Welcome to #{channelName}</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {message.reply_to && (
                <div className="ml-12 mb-1 text-xs text-muted-foreground flex items-center">
                  <Reply className="h-3 w-3 mr-1" />
                  Replying to message
                </div>
              )}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-ucsd-gold rounded-full flex items-center justify-center text-ucsd-navy font-semibold text-sm">
                  {getUserAvatar(message)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{getUserName(message)}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                  </div>
                  <p className="text-sm mt-1 break-words">{message.content}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => setReplyTo(message)}>
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <span>Someone is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyTo && (
        <div className="border-t border-b p-2 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Reply className="h-4 w-4" />
              <span>Replying to {getUserName(replyTo)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
              ×
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{replyTo.content}</p>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder={`Message #${channelName}`}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
