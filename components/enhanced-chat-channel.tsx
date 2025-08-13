"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase, isDemoMode, demoData } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Reply, Hash, Users, Settings } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  user_id: string
  channel_id: string
  reply_to: string | null
  created_at: string
  user?: {
    id: string
    email: string
    full_name: string | null
  }
}

interface Channel {
  id: string
  name: string
  type: string
  topic?: string
  member_count?: number
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface EnhancedChatChannelProps {
  channel: Channel
  user: User
}

export default function EnhancedChatChannel({ channel, user }: EnhancedChatChannelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadMessages()

    if (!isDemoMode() && supabase) {
      // Set up real-time subscription
      const subscription = supabase
        .channel(`messages:${channel.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${channel.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message
              setMessages((prev) => [...prev, newMessage])
              scrollToBottom()
            }
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [channel.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    try {
      if (isDemoMode() || !supabase) {
        // Use demo messages
        const channelMessages = demoData.messages.filter((msg) => msg.channel_id === channel.id)
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
        .eq("channel_id", channel.id)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load messages")
      // Fallback to demo data
      const channelMessages = demoData.messages.filter((msg) => msg.channel_id === channel.id)
      setMessages(channelMessages)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    try {
      if (isDemoMode() || !supabase) {
        // Demo mode - add message locally
        const demoMessage: Message = {
          id: `demo-msg-${Date.now()}`,
          content: messageContent,
          user_id: user.id,
          channel_id: channel.id,
          reply_to: replyTo?.id || null,
          created_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email,
            full_name: user.name,
          },
        }
        setMessages((prev) => [...prev, demoMessage])
        setReplyTo(null)
        scrollToBottom()
        return
      }

      const { error } = await supabase.from("messages").insert({
        content: messageContent,
        user_id: user.id,
        channel_id: channel.id,
        reply_to: replyTo?.id || null,
      })

      if (error) throw error
      setReplyTo(null)
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
      setNewMessage(messageContent) // Restore message
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

  const getUserDisplayName = (message: Message) => {
    if (message.user?.full_name) return message.user.full_name
    if (message.user?.email) return message.user.email.split("@")[0]
    return "Unknown User"
  }

  const getUserAvatar = (message: Message) => {
    const name = getUserDisplayName(message)
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <Hash className="h-5 w-5 text-gray-500" />
          <div>
            <h2 className="font-semibold text-lg">{channel.name}</h2>
            {channel.topic && <p className="text-sm text-gray-500">{channel.topic}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {channel.member_count && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{channel.member_count}</span>
            </Badge>
          )}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="group flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserAvatar(message)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{getUserDisplayName(message)}</span>
                  <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                </div>
                {message.reply_to && (
                  <div className="text-xs text-gray-500 mb-1 pl-4 border-l-2 border-gray-300">
                    Replying to a message
                  </div>
                )}
                <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{message.content}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(message)} className="h-6 w-6 p-0">
                  <Reply className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Replying to </span>
              <span className="font-semibold">{getUserDisplayName(replyTo)}</span>
              <p className="text-gray-600 dark:text-gray-300 truncate">{replyTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${channel.name}`}
            className="flex-1"
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
