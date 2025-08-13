"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase, isSupabaseConfigured, type Message } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Reply, MoreHorizontal, Hash } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface Channel {
  id: string
  name: string
  topic?: string
}

interface EnhancedChatChannelProps {
  user: User
  channel: Channel
}

interface TypingUser {
  user_id: string
  user_name: string
  timestamp: number
}

export default function EnhancedChatChannel({ user, channel }: EnhancedChatChannelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const lastTypingRef = useRef<number>(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode - load mock messages
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hey everyone! Welcome to the channel 👋",
          user_id: "demo-user-1",
          channel_id: channel.id,
          user_name: "Alex Chen",
          user_avatar: "A",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          content: "Thanks for setting this up! This looks great 🎉",
          user_id: "demo-user-2",
          channel_id: channel.id,
          user_name: "Sarah Kim",
          user_avatar: "S",
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: "3",
          content: "Can't wait to start planning our trip!",
          user_id: "demo-user-3",
          channel_id: channel.id,
          user_name: "Mike Johnson",
          user_avatar: "M",
          created_at: new Date(Date.now() - 900000).toISOString(),
        },
      ]
      setMessages(mockMessages)
      setLoading(false)
      return
    }

    loadMessages()
    setupRealtimeSubscription()
  }, [channel.id])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channel.id)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    // Subscribe to new messages
    const messageSubscription = supabase
      .channel(`messages:${channel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    // Subscribe to typing events
    const typingSubscription = supabase
      .channel(`typing:${channel.id}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, user_name, is_typing } = payload.payload

        if (user_id === user.id) return // Don't show own typing

        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.user_id !== user_id)
          if (is_typing) {
            return [...filtered, { user_id, user_name, timestamp: Date.now() }]
          }
          return filtered
        })

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.user_id !== user_id))
        }, 3000)
      })
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
      typingSubscription.unsubscribe()
    }
  }

  const handleTyping = () => {
    const now = Date.now()
    if (now - lastTypingRef.current < 1000) return // Throttle typing events

    lastTypingRef.current = now

    if (!isTyping) {
      setIsTyping(true)
      supabase.channel(`typing:${channel.id}`).send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: user.id,
          user_name: user.name,
          is_typing: true,
        },
      })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      supabase.channel(`typing:${channel.id}`).send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: user.id,
          user_name: user.name,
          is_typing: false,
        },
      })
    }, 1000)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - add message locally
        const demoMessage: Message = {
          id: Date.now().toString(),
          content: messageContent,
          user_id: user.id,
          channel_id: channel.id,
          user_name: user.name,
          user_avatar: user.avatar,
          reply_to: replyTo?.id,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, demoMessage])
        setReplyTo(null)
        toast.success("Message sent (demo mode)")
        return
      }

      const { error } = await supabase.from("messages").insert({
        content: messageContent,
        channel_id: channel.id,
        user_name: user.name,
        user_avatar: user.avatar,
        reply_to: replyTo?.id,
      })

      if (error) throw error

      setReplyTo(null)
      toast.success("Message sent!")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const handleReply = (message: Message) => {
    setReplyTo(message)
  }

  const cancelReply = () => {
    setReplyTo(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">{channel.name}</h2>
        </div>
        {channel.topic && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{channel.topic}</p>}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group relative">
              {message.reply_to && (
                <div className="ml-12 mb-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Reply className="w-3 h-3" />
                  Replying to {messages.find((m) => m.id === message.reply_to)?.user_name || "someone"}
                </div>
              )}
              <div className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-ucsd-gold text-ucsd-navy flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {message.user_avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{message.user_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.created_at)}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleReply(message)}>
                    <Reply className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ml-12">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0].user_name} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Reply Preview */}
      {replyTo && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Reply className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Replying to <strong>{replyTo.user_name}</strong>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={cancelReply} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{replyTo.content}</p>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${channel.name}`}
            className="flex-1"
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
