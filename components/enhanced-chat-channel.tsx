"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Reply, MoreHorizontal, Smile, Hash } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/app/page"
import type { Message } from "@/lib/supabase"

interface EnhancedChatChannelProps {
  user: User
  channelId: string
  channelName: string
  channelTopic?: string
  communityId: string
}

interface ExtendedMessage extends Message {
  reply_to_message?: Message
  reactions?: { emoji: string; count: number; users: string[] }[]
}

export default function EnhancedChatChannel({
  user,
  channelId,
  channelName,
  channelTopic,
  communityId,
}: EnhancedChatChannelProps) {
  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
    subscribeToTyping()
  }, [channelId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          reply_to_message:reply_to(*)
        `)
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
        async (payload) => {
          const newMessage = payload.new as Message

          // If this is a reply, fetch the parent message
          if (newMessage.reply_to) {
            const { data: replyData } = await supabase
              .from("messages")
              .select("*")
              .eq("id", newMessage.reply_to)
              .single()

            if (replyData) {
              ;(newMessage as ExtendedMessage).reply_to_message = replyData
            }
          }

          setMessages((prev) => [...prev, newMessage as ExtendedMessage])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages((prev) => prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg)))
        },
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const subscribeToTyping = () => {
    const subscription = supabase
      .channel(`typing:${channelId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_name, is_typing } = payload.payload

        if (user_name === user.name) return // Don't show own typing

        setTypingUsers((prev) => {
          if (is_typing) {
            return prev.includes(user_name) ? prev : [...prev, user_name]
          } else {
            return prev.filter((name) => name !== user_name)
          }
        })

        // Auto-remove typing indicator after 3 seconds
        if (is_typing) {
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((name) => name !== user_name))
          }, 3000)
        }
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleTyping = useCallback(() => {
    // Send typing indicator
    supabase.channel(`typing:${channelId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_name: user.name, is_typing: true },
    })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(`typing:${channelId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { user_name: user.name, is_typing: false },
      })
    }, 2000)
  }, [channelId, user.name])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)

      // Stop typing indicator
      supabase.channel(`typing:${channelId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { user_name: user.name, is_typing: false },
      })

      const messageData = {
        content: newMessage.trim(),
        channel_id: channelId,
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar,
        reply_to: replyingTo?.id || null,
      }

      const { error } = await supabase.from("messages").insert(messageData)

      if (error) throw error

      setNewMessage("")
      setReplyingTo(null)
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    inputRef.current?.focus()
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

  const renderMessage = (msg: ExtendedMessage) => {
    const isOwnMessage = msg.user_id === user.id

    return (
      <div key={msg.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-2 transition-colors">
        {/* Reply indicator */}
        {msg.reply_to_message && (
          <div className="ml-14 mb-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Reply className="h-3 w-3 mr-1" />
            <span className="font-medium">{msg.reply_to_message.user_name}</span>
            <span className="ml-1 truncate max-w-xs">{msg.reply_to_message.content}</span>
          </div>
        )}

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-ucsd-blue text-white flex items-center justify-center font-bold flex-shrink-0">
            {msg.user_avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className={`font-semibold ${isOwnMessage ? "text-ucsd-gold" : "text-ucsd-navy dark:text-white"}`}>
                {msg.user_name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(msg.created_at)}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-200 break-words whitespace-pre-wrap">{msg.content}</p>
          </div>

          {/* Message actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => handleReply(msg)} className="h-8 w-8 p-0">
              <Reply className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
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
      {/* Channel Header */}
      <div className="flex items-center justify-between border-b dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Hash className="h-5 w-5 text-gray-500" />
          <h1 className="text-xl font-bold text-ucsd-navy dark:text-white">{channelName}</h1>
          {channelTopic && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{channelTopic}</p>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {messages.map(renderMessage)}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.slice(0, -1).join(", ")} and ${typingUsers[typingUsers.length - 1]} are typing...`}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Reply className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Replying to <span className="font-medium">{replyingTo.user_name}</span>
              </span>
              <span className="text-gray-500 truncate max-w-xs">{replyingTo.content}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 w-6 p-0">
              ✕
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder={`Message #${channelName}`}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-ucsd-gold focus-visible:ring-ucsd-gold rounded-lg"
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
