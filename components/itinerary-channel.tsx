"use client"

import type React from "react"

import { useState } from "react"
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
  Camera,
  Car,
} from "lucide-react"
import type { User } from "@/app/page"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  text: string
  time: string
  icon: React.ElementType
  iconColor: string
  borderColor: string
}

interface ItineraryDay {
  day: string
  subtitle: string
  activities: Activity[]
}

interface ItineraryChannelProps {
  user: User
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export default function ItineraryChannel({ user }: ItineraryChannelProps) {
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([
    // Day 1 (Validated - Kept existing richer descriptions)
    {
      day: "Day 1 – Thurs, June 19",
      subtitle: "(Arrival / Chill Climb Day)",
      activities: [
        {
          id: generateId(),
          text: "Arrive early, set up camp at Upper Pines",
          time: "2:00 PM", // Adjusted time for arrival/setup
          icon: Tent,
          iconColor: "bg-green-100 dark:bg-green-800",
          borderColor: "border-green-500 dark:border-green-400",
        },
        {
          id: generateId(),
          text: "Warm-up bouldering session at Camp 4 boulders",
          time: "4:00 PM",
          icon: MountainSnow,
          iconColor: "bg-sky-100 dark:bg-sky-800",
          borderColor: "border-sky-500 dark:border-sky-400",
        },
        {
          id: generateId(),
          text: "Cruise around Yosemite Village, explore Ansel Adams Gallery & gift shop",
          time: "5:30 PM",
          icon: Map,
          iconColor: "bg-yellow-100 dark:bg-yellow-800",
          borderColor: "border-yellow-500 dark:border-yellow-400",
        },
        {
          id: generateId(),
          text: "Chill cookout at camp, group hang, s'mores",
          time: "7:30 PM",
          icon: Flame,
          iconColor: "bg-orange-100 dark:bg-orange-800",
          borderColor: "border-orange-500 dark:border-orange-400",
        },
      ],
    },
    // Day 2 (Updated based on user's list)
    {
      day: "Day 2 – Fri, June 20",
      subtitle: "(Yosemite Falls / Scenic Day)",
      activities: [
        {
          id: generateId(),
          text: "Bouldering Sesh Continued",
          time: "9:00 AM",
          icon: MountainSnow,
          iconColor: "bg-sky-100 dark:bg-sky-800",
          borderColor: "border-sky-500 dark:border-sky-400",
        },
        {
          id: generateId(),
          text: "Explore valley floor / Sentinel Meadow / Mirror Lake",
          time: "1:00 PM",
          icon: Camera, // Using Camera for scenic exploration
          iconColor: "bg-purple-100 dark:bg-purple-800",
          borderColor: "border-purple-500 dark:border-purple-400",
        },
        {
          id: generateId(),
          text: "Night campfire, hangout",
          time: "8:00 PM",
          icon: Flame,
          iconColor: "bg-orange-100 dark:bg-orange-800",
          borderColor: "border-orange-500 dark:border-orange-400",
        },
      ],
    },
    // Day 3 (Updated based on user's list)
    {
      day: "Day 3 – Sat, June 21",
      subtitle: "(Half Dome Day)",
      activities: [
        {
          id: generateId(),
          text: "Early start (4–5am)",
          time: "4:30 AM",
          icon: Sunrise,
          iconColor: "bg-pink-100 dark:bg-pink-800",
          borderColor: "border-pink-500 dark:border-pink-400",
        },
        {
          id: generateId(),
          text: "Climb the cables (permits pending)",
          time: "7:00 AM", // Assuming start of climb after prep
          icon: Hiking,
          iconColor: "bg-teal-100 dark:bg-teal-800",
          borderColor: "border-teal-500 dark:border-teal-400",
        },
        {
          id: generateId(),
          text: "Bring poles, snacks, water. It's 10–12 hrs roundtrip",
          time: "7:05 AM", // Reminder right after starting
          icon: Luggage, // Representing gear
          iconColor: "bg-gray-100 dark:bg-gray-700",
          borderColor: "border-gray-500 dark:border-gray-400",
        },
        {
          id: generateId(),
          text: "Yosemite Falls (view or quick visit during/after Half Dome)",
          time: "5:00 PM", // Placeholder, could be flexible
          icon: Waves,
          iconColor: "bg-blue-100 dark:bg-blue-800",
          borderColor: "border-blue-500 dark:border-blue-400",
        },
        {
          id: generateId(),
          text: "Dinner & early crash",
          time: "7:30 PM",
          icon: Bed, // Using Bed for "early crash"
          iconColor: "bg-indigo-100 dark:bg-indigo-800",
          borderColor: "border-indigo-500 dark:border-indigo-400",
        },
      ],
    },
    // Day 4 (Updated based on user's list)
    {
      day: "Day 4 – Sun, June 22",
      subtitle: "(Recovery / Adventure Flex Day)",
      activities: [
        {
          id: generateId(),
          text: "Sleep in or do a short hike",
          time: "9:00 AM",
          icon: Bed, // Or Hiking if they choose hike
          iconColor: "bg-purple-100 dark:bg-purple-800",
          borderColor: "border-purple-500 dark:border-purple-400",
        },
        {
          id: generateId(),
          text: "Explore other Yosemite boulders",
          time: "11:00 AM",
          icon: MountainSnow,
          iconColor: "bg-sky-100 dark:bg-sky-800",
          borderColor: "border-sky-500 dark:border-sky-400",
        },
        {
          id: generateId(),
          text: "Optional: explore rental bikes or river float",
          time: "2:00 PM",
          icon: Bike, // Or Waves
          iconColor: "bg-lime-100 dark:bg-lime-800",
          borderColor: "border-lime-500 dark:border-lime-400",
        },
        {
          id: generateId(),
          text: "Last night camp vibes, hangout, games",
          time: "7:00 PM",
          icon: Gamepad2,
          iconColor: "bg-rose-100 dark:bg-rose-800",
          borderColor: "border-rose-500 dark:border-rose-400",
        },
      ],
    },
    // Day 5 (New day added)
    {
      day: "Day 5 – Mon, June 23",
      subtitle: "(Pack + Dip Day)",
      activities: [
        {
          id: generateId(),
          text: "Pack up + Brekky",
          time: "8:00 AM",
          icon: Coffee, // Representing Brekky, Luggage for pack up
          iconColor: "bg-amber-100 dark:bg-amber-800",
          borderColor: "border-amber-500 dark:border-amber-400",
        },
        {
          id: generateId(),
          text: "Optional shower at Curry Village",
          time: "9:30 AM",
          icon: ShowerHead,
          iconColor: "bg-cyan-100 dark:bg-cyan-800",
          borderColor: "border-cyan-500 dark:border-cyan-400",
        },
        {
          id: generateId(),
          text: "Final Group Pics",
          time: "10:30 AM",
          icon: Camera,
          iconColor: "bg-pink-100 dark:bg-pink-800",
          borderColor: "border-pink-500 dark:border-pink-400",
        },
        {
          id: generateId(),
          text: "Drive back to SD",
          time: "11:00 AM",
          icon: Car,
          iconColor: "bg-slate-100 dark:bg-slate-700",
          borderColor: "border-slate-500 dark:border-slate-400",
        },
      ],
    },
  ])

  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [newActivityText, setNewActivityText] = useState("")
  const [newActivityTime, setNewActivityTime] = useState("8:00 PM") // Default for new activity

  // --- All other functions (handleEditActivity, handleSaveEdit, etc.) remain the same ---
  // --- The JSX for rendering the dropdown and timeline also remains the same ---

  const handleEditActivity = (activity: Activity) => {
    setEditingActivityId(activity.id)
    setEditingValue(activity.text)
  }

  const handleSaveEdit = () => {
    if (editingActivityId && editingValue.trim()) {
      const updatedDays = itineraryDays.map((day, dayIdx) => {
        if (dayIdx === selectedDayIndex) {
          return {
            ...day,
            activities: day.activities.map((act) =>
              act.id === editingActivityId ? { ...act, text: editingValue.trim() } : act,
            ),
          }
        }
        return day
      })
      setItineraryDays(updatedDays)
    }
    setEditingActivityId(null)
    setEditingValue("")
  }

  const handleDeleteActivity = (activityId: string) => {
    const updatedDays = itineraryDays.map((day, dayIdx) => {
      if (dayIdx === selectedDayIndex) {
        return {
          ...day,
          activities: day.activities.filter((act) => act.id !== activityId),
        }
      }
      return day
    })
    setItineraryDays(updatedDays)
    if (editingActivityId === activityId) {
      setEditingActivityId(null)
      setEditingValue("")
    }
  }

  const handleAddActivity = () => {
    if (newActivityText.trim() && newActivityTime.trim()) {
      const newActivity: Activity = {
        id: generateId(),
        text: newActivityText.trim(),
        time: newActivityTime.trim(),
        icon: Clock,
        iconColor: "bg-gray-100 dark:bg-gray-700",
        borderColor: "border-gray-500 dark:border-gray-400",
      }
      const updatedDays = itineraryDays.map((day, dayIdx) => {
        if (dayIdx === selectedDayIndex) {
          const updatedActivities = [...day.activities, newActivity].sort((a, b) =>
            a.time.localeCompare(b.time, undefined, { numeric: true }),
          )
          return { ...day, activities: updatedActivities }
        }
        return day
      })
      setItineraryDays(updatedDays)
      setNewActivityText("")
      // Increment default time for next new activity slightly
      const lastTime = newActivityTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (lastTime) {
        let hours = Number.parseInt(lastTime[1])
        const minutes = Number.parseInt(lastTime[2])
        const period = lastTime[3].toUpperCase()
        if (period === "PM" && hours !== 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0 // Midnight case

        const date = new Date()
        date.setHours(hours, minutes + 30) // Add 30 mins

        let nextHours = date.getHours()
        const nextMinutes = date.getMinutes()
        const nextPeriod = nextHours >= 12 ? "PM" : "AM"
        if (nextHours > 12) nextHours -= 12
        if (nextHours === 0) nextHours = 12 // Midnight to 12 AM

        setNewActivityTime(`${nextHours}:${nextMinutes.toString().padStart(2, "0")} ${nextPeriod}`)
      } else {
        setNewActivityTime("8:30 PM") // Fallback
      }
    }
  }

  const currentDayData = itineraryDays[selectedDayIndex]
  const currentActivities = currentDayData?.activities || []

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header Area */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="hidden lg:flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-ucsd-blue" />
            <h1 className="text-xl font-bold text-ucsd-navy dark:text-white">Itinerary</h1>
          </div>
        </div>
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

      {/* Timeline Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {currentDayData && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-ucsd-navy dark:text-white">{currentDayData.day}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentDayData.subtitle}</p>
            </div>
          )}

          {currentActivities.map((activity, index) => (
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
                  activity.iconColor,
                  activity.borderColor,
                )}
              >
                <activity.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 pt-1 min-w-0">
                {editingActivityId === activity.id ? (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm space-y-2">
                    <Textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full text-sm min-h-[60px] bg-white dark:bg-gray-700 border-ucsd-gold focus:ring-ucsd-gold"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingActivityId(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} className="bg-ucsd-blue text-white">
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md shadow-sm group">
                    <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                      {activity.text}
                    </p>
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-500 hover:text-ucsd-blue"
                        onClick={() => handleEditActivity(activity)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-500 hover:text-red-500"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-3 text-ucsd-navy dark:text-white">Add New Activity</h3>
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow">
              <Input
                placeholder="Activity description"
                value={newActivityText}
                onChange={(e) => setNewActivityText(e.target.value)}
                className="bg-white dark:bg-gray-700"
              />
              <Input
                placeholder="Time (e.g., 7:00 PM)"
                value={newActivityTime}
                onChange={(e) => setNewActivityTime(e.target.value)}
                className="bg-white dark:bg-gray-700"
              />
              <Button
                onClick={handleAddActivity}
                className="w-full bg-ucsd-gold hover:bg-ucsd-gold/90 text-ucsd-navy"
                disabled={!newActivityText.trim() || !newActivityTime.trim()}
              >
                <Plus className="h-4 w-4 mr-2" /> Add to Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
