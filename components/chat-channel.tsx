"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, MessageSquareText, Smile, Reply, MoreVertical, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/error-handler"
import type { User } from "@/app/page"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  content: string
  user_id: string
  user_name: string
  user_avatar: string
  created_at: string
  reply_to?: string
}

interface ChatChannelProps {
  user: User
  channelId: string
  communityId: string
}

export default function ChatChannel({ user, channelId, communityId }: ChatChannelProps) {
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
  }, [channelId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(100)

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      handleSupabaseError(error)
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

    return () => {
      subscription.unsubscribe()
    }
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
        reply_to: replyingTo,
      })

      if (error) throw error

      setNewMessage("")
      setReplyingTo(null)
    } catch (error) {
      handleSupabaseError(error)
    } finally {
      setSending(false)
    }
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    inputRef.current?.focus()
  }

  const getReplyMessage = (replyId: string) => {
    return messages.find((msg) => msg.id === replyId)
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
        <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Desktop Channel Header */}
      <div className="hidden lg:flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 p-4">
        <MessageSquareText className="h-5 w-5 text-ucsd-blue" />
        <h1 className="text-xl font-bold text-ucsd-navy dark:text-gray-100">chat</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          General discussion, trip announcements, and quick updates.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="group flex items-start space-x-2.5 sm:space-x-3">
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0",
                  msg.user_id === user.id ? "bg-ucsd-gold text-ucsd-blue" : "bg-ucsd-blue text-white",
                )}
              >
                {msg.user_avatar}
              </div>
              <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800/50 p-2.5 sm:p-3 rounded-md shadow-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                      {msg.user_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>
                  <div className="hidden sm:flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReply(msg.id)}>
                      <Reply size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>

                {msg.reply_to && getReplyMessage(msg.reply_to) && (
                  <div className="mb-1.5 pl-2.5 py-1.5 border-l-2 border-ucsd-gold bg-ucsd-gold/10 rounded text-xs">
                    <div className="font-medium text-ucsd-blue/80 dark:text-ucsd-gold/90">
                      Replying to {getReplyMessage(msg.reply_to)?.user_name}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 truncate">
                      {getReplyMessage(msg.reply_to)?.content}
                    </p>
                  </div>
                )}

                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                  {msg.content}
                </p>

                <div className="sm:hidden flex items-center space-x-1 mt-2 pt-1.5 border-t border-gray-200 dark:border-gray-700/50">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs py-1" onClick={() => handleReply(msg.id)}>
                    <Reply size={14} className="mr-1.5" /> Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs py-1">
                    <MoreVertical size={14} className="mr-1.5" /> More
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {replyingTo && getReplyMessage(replyingTo) && (
        <div className="border-t dark:border-gray-700 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 min-w-0">
              <Reply className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                Replying to {getReplyMessage(replyingTo)?.user_name}:{" "}
                <em className="truncate">{getReplyMessage(replyingTo)?.content}</em>
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
              className="h-7 w-7 text-gray-500 dark:text-gray-400 flex-shrink-0"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 text-gray-500 dark:text-gray-400 hover:text-ucsd-blue dark:hover:text-ucsd-gold flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={replyingTo ? "Reply..." : "Type a message..."}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-700 focus:border-ucsd-gold focus-visible:ring-ucsd-gold h-10 sm:h-11 rounded-lg text-sm sm:text-base pr-10"
              disabled={sending}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-ucsd-blue dark:hover:text-ucsd-gold"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            className="bg-ucsd-blue hover:bg-ucsd-navy text-white rounded-lg h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
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
