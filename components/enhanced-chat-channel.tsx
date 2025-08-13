"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { Send, Reply, MoreHorizontal, Hash } from "lucide-react"

interface Message {
  id: string
  content: string
  user_id: string
  channel_id: string
  reply_to?: string
  created_at: string
  user?: {
    id: string
    email: string
    full_name?: string
  }
  reply_message?: {
    id: string
    content: string
    user?: {
      full_name?: string
      email: string
    }
  }
}

interface TypingUser {
  user_id: string
  user_email: string
  timestamp: number
}

interface EnhancedChatChannelProps {
  channel: {
    id: string
    name: string
    topic?: string
    community_id: string
  }
  currentUser: any
}

export default function EnhancedChatChannel({ channel, currentUser }: EnhancedChatChannelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          user:profiles(id, email, full_name),
          reply_message:messages!reply_to(
            id,
            content,
            user:profiles(id, email, full_name)
          )
        `)
        .eq("channel_id", channel.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading messages:", error)
        return
      }

      setMessages(data || [])
    }

    loadMessages()
  }, [channel.id])

  // Real-time message subscription
  useEffect(() => {
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
        async (payload) => {
          // Fetch the complete message with user data
          const { data } = await supabase
            .from("messages")
            .select(`
              *,
              user:profiles(id, email, full_name),
              reply_message:messages!reply_to(
                id,
                content,
                user:profiles(id, email, full_name)
              )
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])
          }
        },
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [channel.id])

  // Typing indicators
  useEffect(() => {
    const typingChannel = supabase.channel(`typing:${channel.id}`)

    typingChannel
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, user_email, is_typing } = payload.payload

        if (user_id === currentUser?.id) return

        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.user_id !== user_id)
          if (is_typing) {
            return [...filtered, { user_id, user_email, timestamp: Date.now() }]
          }
          return filtered
        })
      })
      .subscribe()

    // Clean up old typing indicators
    const cleanupInterval = setInterval(() => {
      setTypingUsers((prev) => prev.filter((user) => Date.now() - user.timestamp < 5000))
    }, 1000)

    return () => {
      typingChannel.unsubscribe()
      clearInterval(cleanupInterval)
    }
  }, [channel.id, currentUser?.id])

  const handleTyping = () => {
    if (!isTyping && currentUser) {
      setIsTyping(true)
      supabase.channel(`typing:${channel.id}`).send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: currentUser.id,
          user_email: currentUser.email,
          is_typing: true,
        },
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      supabase.channel(`typing:${channel.id}`).send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: currentUser.id,
          user_email: currentUser.email,
          is_typing: false,
        },
      })
    }, 2000)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const messageData = {
      content: newMessage.trim(),
      channel_id: channel.id,
      user_id: currentUser.id,
      reply_to: replyingTo?.id || null,
    }

    const { error } = await supabase.from("messages").insert([messageData])

    if (error) {
      console.error("Error sending message:", error)
      return
    }

    setNewMessage("")
    setReplyingTo(null)
    setIsTyping(false)

    // Stop typing indicator
    supabase.channel(`typing:${channel.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: currentUser.id,
        user_email: currentUser.email,
        is_typing: false,
      },
    })
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getUserDisplayName = (user: any) => {
    return user?.full_name || user?.email?.split("@")[0] || "Unknown User"
  }

  const getUserAvatar = (user: any) => {
    const name = getUserDisplayName(user)
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Channel Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Hash className="w-5 h-5 text-gray-500" />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900 dark:text-white">{channel.name}</h2>
          {channel.topic && <p className="text-sm text-gray-500 dark:text-gray-400">{channel.topic}</p>}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group relative">
              {message.reply_to && message.reply_message && (
                <div className="ml-12 mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Reply className="w-3 h-3" />
                  <span>Replying to {getUserDisplayName(message.reply_message.user)}</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs max-w-xs truncate">
                    {message.reply_message.content}
                  </span>
                </div>
              )}

              <div className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {getUserAvatar(message.user)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {getUserDisplayName(message.user)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>

                  <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words">
                    {message.content}
                  </div>
                </div>

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(message)} className="h-6 w-6 p-0">
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
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0].user_email.split("@")[0]} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Reply className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Replying to {getUserDisplayName(replyingTo.user)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 max-w-xs truncate">{replyingTo.content}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder={`Message #${channel.name}`}
            className="flex-1"
            disabled={!currentUser}
          />
          <Button type="submit" disabled={!newMessage.trim() || !currentUser}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
