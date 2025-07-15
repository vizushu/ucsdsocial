"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Tent,
  MountainSnow,
  Map,
  Flame,
  Clock,
  Sunrise,
  MountainIcon as Hiking,
  Bed,
  Bike,
  Waves,
  Gamepad2,
  Luggage,
  Coffee,
  ShowerHead,
  CameraIcon,
  Car,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/error-handler"
import type { User } from "@/app/page"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  text: string
  time: string
  day_index: number
  icon_type: string
  icon_color: string
  border_color: string
  created_by: string
}

interface ItineraryDay {
  day: string
  subtitle: string
  activities: Activity[]
}

interface ItineraryChannelProps {
  user: User
  channelId: string
  communityId: string
}

const iconMap: Record<string, React.ElementType> = {
  tent: Tent,
  mountain: MountainSnow,
  map: Map,
  flame: Flame,
  clock: Clock,
  sunrise: Sunrise,
  hiking: Hiking,
  bed: Bed,
  bike: Bike,
  waves: Waves,
  gamepad: Gamepad2,
  luggage: Luggage,
  coffee: Coffee,
  shower: ShowerHead,
  camera: CameraIcon,
  car: Car,
}

const dayTemplates = [
  {
    day: "Day 1 – Thurs, June 19",
    subtitle: "(Arrival / Chill Climb Day)",
  },
  {
    day: "Day 2 – Fri, June 20",
    subtitle: "(Yosemite Falls / Scenic Day)",
  },
  {
    day: "Day 3 – Sat, June 21",
    subtitle: "(Half Dome Day)",
  },
  {
    day: "Day 4 – Sun, June 22",
    subtitle: "(Recovery / Adventure Flex Day)",
  },
  {
    day: "Day 5 – Mon, June 23",
    subtitle: "(Pack + Dip Day)",
  },
]

export default function ItineraryChannel({ user, channelId, communityId }: ItineraryChannelProps) {
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [newActivityText, setNewActivityText] = useState("")
  const [newActivityTime, setNewActivityTime] = useState("8:00 PM")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadActivities()
    subscribeToActivities()
  }, [channelId])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("itinerary_activities")
        .select("*")
        .eq("channel_id", channelId)
        .order("day_index", { ascending: true })
        .order("time", { ascending: true })

      if (error) throw error

      // Group activities by day
      const groupedActivities: ItineraryDay[] = dayTemplates.map((template, index) => ({
        ...template,
        activities: (data || []).filter((activity) => activity.day_index === index),
      }))

      setItineraryDays(groupedActivities)
    } catch (error) {
      handleSupabaseError(error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToActivities = () => {
    const subscription = supabase
      .channel(`itinerary:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "itinerary_activities",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          loadActivities() // Reload on any change
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivityId(activity.id)
    setEditingValue(activity.text)
  }

  const handleSaveEdit = async () => {
    if (!editingActivityId || !editingValue.trim() || saving) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from("itinerary_activities")
        .update({ text: editingValue.trim() })
        .eq("id", editingActivityId)

      if (error) throw error

      setEditingActivityId(null)
      setEditingValue("")
    } catch (error) {
      handleSupabaseError(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (saving) return

    try {
      setSaving(true)
      const { error } = await supabase.from("itinerary_activities").delete().eq("id", activityId)

      if (error) throw error

      if (editingActivityId === activityId) {
        setEditingActivityId(null)
        setEditingValue("")
      }
    } catch (error) {
      handleSupabaseError(error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddActivity = async () => {
    if (!newActivityText.trim() || !newActivityTime.trim() || saving) return

    try {
      setSaving(true)
      const { error } = await supabase.from("itinerary_activities").insert({
        text: newActivityText.trim(),
        time: newActivityTime.trim(),
        day_index: selectedDayIndex,
        channel_id: channelId,
        created_by: user.id,
        icon_type: "clock",
        icon_color: "bg-gray-100 dark:bg-gray-700",
        border_color: "border-gray-500 dark:border-gray-400",
      })

      if (error) throw error

      setNewActivityText("")
      // Auto-increment time by 30 minutes
      const lastTime = newActivityTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (lastTime) {
        let hours = Number.parseInt(lastTime[1])
        const minutes = Number.parseInt(lastTime[2])
        const period = lastTime[3].toUpperCase()
        if (period === "PM" && hours !== 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0

        const date = new Date()
        date.setHours(hours, minutes + 30)

        let nextHours = date.getHours()
        const nextMinutes = date.getMinutes()
        const nextPeriod = nextHours >= 12 ? "PM" : "AM"
        if (nextHours > 12) nextHours -= 12
        if (nextHours === 0) nextHours = 12

        setNewActivityTime(`${nextHours}:${nextMinutes.toString().padStart(2, "0")} ${nextPeriod}`)
      }
    } catch (error) {
      handleSupabaseError(error)
    } finally {
      setSaving(false)
    }
  }

  const currentDayData = itineraryDays[selectedDayIndex]
  const currentActivities = currentDayData?.activities || []

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950 items-center justify-center">
        <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading itinerary...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <Calendar className="h-5 w-5 mr-3 text-ucsd-blue dark:text-ucsd-gold flex-shrink-0" />
        <h1 className="text-lg font-semibold text-ucsd-navy dark:text-gray-100 truncate">Itinerary</h1>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Select value={String(selectedDayIndex)} onValueChange={(value) => setSelectedDayIndex(Number.parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[280px] text-base py-2.5 h-auto bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-ucsd-gold">
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent>
            {itineraryDays.map((day, index) => (
              <SelectItem key={index} value={String(index)} className="text-base py-2.5">
                Day {index + 1}: {day.day.split("–")[1]?.trim().split(",")[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {currentDayData && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-ucsd-navy dark:text-white">{currentDayData.day}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentDayData.subtitle}</p>
            </div>
          )}

          {currentActivities.map((activity, index) => {
            const IconComponent = iconMap[activity.icon_type] || Clock
            return (
              <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 relative pb-8">
                <div className="flex flex-col items-center">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1 w-16 text-right">
                    {activity.time}
                  </p>
                  {index < currentActivities.length - 1 && (
                    <div className="mt-2 w-px h-full bg-gray-300 dark:bg-gray-700 min-h-[40px]"></div>
                  )}
                </div>
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 -ml-[22px] sm:-ml-[26px] border-2 z-10 relative",
                    activity.icon_color,
                    activity.border_color,
                  )}
                >
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  {editingActivityId === activity.id ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm space-y-2">
                      <Textarea
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="w-full text-sm min-h-[60px] bg-white dark:bg-gray-700 border-ucsd-gold focus:ring-ucsd-gold"
                        rows={3}
                        disabled={saving}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingActivityId(null)} disabled={saving}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="bg-ucsd-blue text-white"
                          disabled={saving}
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md shadow-sm group relative">
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                        {activity.text}
                      </p>
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-ucsd-blue"
                          onClick={() => handleEditActivity(activity)}
                          disabled={saving}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-red-500"
                          onClick={() => handleDeleteActivity(activity.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-3 text-ucsd-navy dark:text-white">Add New Activity</h3>
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow">
              <Input
                placeholder="Activity description"
                value={newActivityText}
                onChange={(e) => setNewActivityText(e.target.value)}
                className="bg-white dark:bg-gray-700"
                disabled={saving}
              />
              <Input
                placeholder="Time (e.g., 7:00 PM)"
                value={newActivityTime}
                onChange={(e) => setNewActivityTime(e.target.value)}
                className="bg-white dark:bg-gray-700"
                disabled={saving}
              />
              <Button
                onClick={handleAddActivity}
                className="w-full bg-ucsd-gold hover:bg-ucsd-gold/90 text-ucsd-navy"
                disabled={!newActivityText.trim() || !newActivityTime.trim() || saving}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-ucsd-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add to Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
