"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquareText } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/app/page"
import type { Message } from "@/lib/supabase"

interface ChatChannelProps {
  user: User
  channelId: string
  communityId: string
}

export default function ChatChannel({ user, channelId, communityId }: ChatChannelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
  }, [channelId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(100)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const subscription = supabase
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

    return () => subscription.unsubscribe()
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        channel_id: channelId,
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar,
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950 items-center justify-center">
        <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Desktop Channel Header */}
      <div className="hidden lg:flex items-center space-x-2 border-b dark:border-gray-700 p-4">
        <MessageSquareText className="h-5 w-5 text-ucsd-blue" />
        <h1 className="text-xl font-bold text-ucsd-navy">chat</h1>
        <p className="text-sm text-gray-600 mt-0.5">General discussion and updates</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-ucsd-blue text-white flex items-center justify-center font-bold flex-shrink-0">
                {msg.user_avatar}
              </div>
              <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="font-semibold text-ucsd-navy dark:text-white">{msg.user_name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(msg.created_at)}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-200 break-words whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-white border-gray-300 dark:border-gray-700 focus:border-ucsd-gold focus-visible:ring-ucsd-gold rounded-lg"
              disabled={sending}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="bg-ucsd-blue hover:bg-ucsd-navy text-white rounded-lg"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
