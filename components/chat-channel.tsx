"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, MessageSquareText, Smile, ThumbsUp, Heart, Reply, MoreVertical, X } from "lucide-react"
import type { User } from "@/app/page"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  user: string
  avatar: string
  avatarColor: string
  time: string
  message: string
  isNew?: boolean
  reactions?: { emoji: string; count: number; users: string[] }[]
  replyTo?: string
}

interface ChatChannelProps {
  user: User
}

const initialMessages: Message[] = [
  {
    id: "1",
    user: "Renier",
    avatar: "R",
    avatarColor: "bg-ucsd-blue text-white",
    time: "Today 2:15 PM",
    message:
      "4 days off grid with UCSD climbers at Yosemite's legendary Camp 4. Morning sends, afternoon waterfall swims, sunset hangs, soup and s'mores by the camper (ft. Levi the husky). If you know, you know. If you don't—well, you'll just be watching the IG stories wishing you came. 🏔️",
    reactions: [
      { emoji: "🔥", count: 3, users: ["Alex", "Sarah", "Mike"] },
      { emoji: "🧗", count: 2, users: ["Jess", "Alex"] },
    ],
  },
  {
    id: "2",
    user: "Alex",
    avatar: "A",
    avatarColor: "bg-ucsd-navy text-white",
    time: "2:18 PM",
    message: "Count me in! Been wanting to try some Yosemite granite 🧗‍♂️",
    reactions: [{ emoji: "💪", count: 1, users: ["Renier"] }],
  },
  {
    id: "3",
    user: "Sarah",
    avatar: "S",
    avatarColor: "bg-ucsd-gold text-ucsd-blue",
    time: "2:22 PM",
    message: "Levi the husky?? 😍 I'm definitely coming now",
    reactions: [{ emoji: "😍", count: 2, users: ["Jess", "Mike"] }],
  },
  {
    id: "4",
    user: "Mike",
    avatar: "M",
    avatarColor: "bg-gray-500 text-white",
    time: "2:45 PM",
    message: "What's the climbing grade range we're looking at? I'm still pretty new to outdoor climbing",
  },
  {
    id: "5",
    user: "Renier",
    avatar: "R",
    avatarColor: "bg-ucsd-blue text-white",
    time: "2:47 PM",
    message: "Perfect for beginners! Lots of 5.6-5.9 routes. Plus I'm bringing extra gear for anyone who needs it 👍",
    replyTo: "4",
  },
  {
    id: "6",
    user: "Jess",
    avatar: "J",
    avatarColor: "bg-ucsd-navy text-white",
    time: "3:12 PM",
    message: "Just submitted my RSVP! Can't wait for this adventure 🎒✨",
    reactions: [{ emoji: "🎉", count: 1, users: ["Sarah"] }],
  },
]

const TypingIndicator = ({ typingUsers }: { typingUsers: string[] }) => {
  if (typingUsers.length === 0) return null

  const names = typingUsers.join(", ")
  return (
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-4 pb-2">
      <div className="flex space-x-1 items-center">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-ucsd-gold rounded-full animate-bounce"></div>
        <div
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-ucsd-gold rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-ucsd-gold rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <span>
        {names} {typingUsers.length === 1 ? "is" : "are"} typing...
      </span>
    </div>
  )
}

export default function ChatChannel({ user }: ChatChannelProps) {
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Simulate typing users
    const interval = setInterval(
      () => {
        setTypingUsers((currentTyping) => {
          const isTyping = Math.random() > 0.5
          const randomUser = initialMessages[Math.floor(Math.random() * initialMessages.length)].user
          if (randomUser === user.name) return currentTyping // Current user doesn't show as typing to themselves

          if (isTyping && !currentTyping.includes(randomUser)) {
            return [...currentTyping, randomUser].slice(0, 3) // Limit to 3 typing users
          } else if (!isTyping && currentTyping.includes(randomUser)) {
            return currentTyping.filter((u) => u !== randomUser)
          }
          return currentTyping
        })
      },
      3000 + Math.random() * 2000,
    ) // Add some randomness to typing simulation

    return () => clearInterval(interval)
  }, [user.name])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const now = new Date()
      const timeString = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

      const newMsg: Message = {
        id: Date.now().toString(),
        user: user.name,
        avatar: user.avatar,
        avatarColor: "bg-ucsd-gold text-ucsd-blue",
        time: timeString,
        message: newMessage.trim(),
        isNew: true,
        replyTo: replyingTo || undefined,
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")
      setReplyingTo(null)
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || []
          const existingReaction = reactions.find((r) => r.emoji === emoji)

          if (existingReaction) {
            if (existingReaction.users.includes(user.name)) {
              return {
                ...msg,
                reactions: reactions
                  .map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter((u) => u !== user.name) } : r,
                  )
                  .filter((r) => r.count > 0),
              }
            } else {
              return {
                ...msg,
                reactions: reactions.map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, user.name] } : r,
                ),
              }
            }
          } else {
            return {
              ...msg,
              reactions: [...reactions, { emoji, count: 1, users: [user.name] }],
            }
          }
        }
        return msg
      }),
    )
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    inputRef.current?.focus()
  }

  const getReplyMessage = (replyId: string) => {
    return messages.find((msg) => msg.id === replyId)
  }

  const formatTime = (timeString: string) => {
    if (timeString.includes("Today")) return timeString
    return timeString
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Desktop Channel Header - Styled like ChecklistChannel */}
      <div className="hidden lg:flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 p-4">
        <MessageSquareText className="h-5 w-5 text-ucsd-blue" />
        <h1 className="text-xl font-bold text-ucsd-navy dark:text-gray-100">chat</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          General discussion, trip announcements, and quick updates.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {" "}
          {/* Consistent padding with Itinerary/Checklist */}
          {messages.map((msg) => (
            <div key={msg.id} className="group flex items-start space-x-2.5 sm:space-x-3">
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0",
                  msg.avatarColor,
                )}
              >
                {msg.avatar}
              </div>
              {/* Message bubble style consistent with Itinerary/Checklist item cards */}
              <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800/50 p-2.5 sm:p-3 rounded-md shadow-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                      {msg.user}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(msg.time)}</span>
                  </div>
                  <div className="hidden sm:flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReaction(msg.id, "👍")}
                    >
                      {" "}
                      <ThumbsUp size={16} />{" "}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReaction(msg.id, "❤️")}>
                      {" "}
                      <Heart size={16} />{" "}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReply(msg.id)}>
                      {" "}
                      <Reply size={16} />{" "}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      {" "}
                      <MoreVertical size={16} />{" "}
                    </Button>
                  </div>
                </div>

                {msg.replyTo && getReplyMessage(msg.replyTo) && (
                  <div className="mb-1.5 pl-2.5 py-1.5 border-l-2 border-ucsd-gold bg-ucsd-gold/10 rounded text-xs">
                    <div className="font-medium text-ucsd-blue/80 dark:text-ucsd-gold/90">
                      Replying to {getReplyMessage(msg.replyTo)?.user}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 truncate">{getReplyMessage(msg.replyTo)?.message}</p>
                  </div>
                )}

                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                  {msg.message}
                </p>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleReaction(msg.id, reaction.emoji)}
                        className={cn(
                          "inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs transition-colors border",
                          reaction.users.includes(user.name)
                            ? "bg-ucsd-gold/30 text-ucsd-navy dark:bg-ucsd-gold/70 dark:text-ucsd-blue border-ucsd-gold"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600",
                        )}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="font-medium">{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="sm:hidden flex items-center space-x-1 mt-2 pt-1.5 border-t border-gray-200 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs py-1"
                    onClick={() => handleReaction(msg.id, "👍")}
                  >
                    {" "}
                    <ThumbsUp size={14} className="mr-1.5" /> Like{" "}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs py-1" onClick={() => handleReply(msg.id)}>
                    {" "}
                    <Reply size={14} className="mr-1.5" /> Reply{" "}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs py-1">
                    {" "}
                    <MoreVertical size={14} className="mr-1.5" /> More{" "}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <TypingIndicator typingUsers={typingUsers} />

      {replyingTo && getReplyMessage(replyingTo) && (
        <div className="border-t dark:border-gray-700 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 min-w-0">
              <Reply className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                Replying to {getReplyMessage(replyingTo)?.user}:{" "}
                <em className="truncate">{getReplyMessage(replyingTo)?.message}</em>
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

      {/* Input area styling consistent with Itinerary/Checklist "Add New" sections */}
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
              placeholder={
                replyingTo ? "Reply..." : `Message #${channels.find((c) => c.id === "chat")?.name || "chat"}`
              }
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-700 focus:border-ucsd-gold focus-visible:ring-ucsd-gold h-10 sm:h-11 rounded-lg text-sm sm:text-base pr-10"
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
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Dummy channels array for placeholder - in a real app this might come from props or context
const channels = [{ id: "chat", name: "chat" }]
