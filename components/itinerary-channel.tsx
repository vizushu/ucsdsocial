"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  Camera,
  Utensils,
  Tent,
  Mountain,
} from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/app/page"
import type { ItineraryActivity } from "@/lib/supabase"

interface ItineraryChannelProps {
  user: User
  channelId: string
  communityId: string
}

const iconMap = {
  clock: Clock,
  map: MapPin,
  users: Users,
  camera: Camera,
  utensils: Utensils,
  tent: Tent,
  mountain: Mountain,
}

const dayTemplates = [
  { day: "Day 1 - Thursday", subtitle: "Arrival & Setup" },
  { day: "Day 2 - Friday", subtitle: "Adventure Day" },
  { day: "Day 3 - Saturday", subtitle: "Main Activity" },
  { day: "Day 4 - Sunday", subtitle: "Recovery & Departure" },
]

export default function ItineraryChannel({ user, channelId, communityId }: ItineraryChannelProps) {
  const [activities, setActivities] = useState<ItineraryActivity[]>([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [newActivity, setNewActivity] = useState({
    text: "",
    time: "9:00 AM",
    icon_type: "clock",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
    subscribeToActivities()
  }, [channelId])

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("itinerary_activities")
        .select("*")
        .eq("channel_id", channelId)
        .order("day_index", { ascending: true })
        .order("time", { ascending: true })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error("Error loading activities:", error)
      toast.error("Failed to load itinerary")
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
          loadActivities()
        },
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleAddActivity = async () => {
    if (!newActivity.text.trim()) return

    try {
      const { error } = await supabase.from("itinerary_activities").insert({
        text: newActivity.text.trim(),
        time: newActivity.time,
        day_index: selectedDay,
        channel_id: channelId,
        created_by: user.id,
        icon_type: newActivity.icon_type,
        icon_color: getIconColor(newActivity.icon_type),
        border_color: getBorderColor(newActivity.icon_type),
      })

      if (error) throw error

      setNewActivity({ text: "", time: "9:00 AM", icon_type: "clock" })
      toast.success("Activity added!")
    } catch (error) {
      console.error("Error adding activity:", error)
      toast.error("Failed to add activity")
    }
  }

  const handleEditActivity = async (id: string) => {
    if (!editingText.trim()) return

    try {
      const { error } = await supabase.from("itinerary_activities").update({ text: editingText.trim() }).eq("id", id)

      if (error) throw error

      setEditingId(null)
      setEditingText("")
      toast.success("Activity updated!")
    } catch (error) {
      console.error("Error updating activity:", error)
      toast.error("Failed to update activity")
    }
  }

  const handleDeleteActivity = async (id: string) => {
    try {
      const { error } = await supabase.from("itinerary_activities").delete().eq("id", id)

      if (error) throw error
      toast.success("Activity deleted!")
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast.error("Failed to delete activity")
    }
  }

  const getIconColor = (iconType: string) => {
    const colors = {
      clock: "bg-blue-100 text-blue-600",
      map: "bg-green-100 text-green-600",
      users: "bg-purple-100 text-purple-600",
      camera: "bg-pink-100 text-pink-600",
      utensils: "bg-orange-100 text-orange-600",
      tent: "bg-emerald-100 text-emerald-600",
      mountain: "bg-slate-100 text-slate-600",
    }
    return colors[iconType as keyof typeof colors] || colors.clock
  }

  const getBorderColor = (iconType: string) => {
    const colors = {
      clock: "border-blue-300",
      map: "border-green-300",
      users: "border-purple-300",
      camera: "border-pink-300",
      utensils: "border-orange-300",
      tent: "border-emerald-300",
      mountain: "border-slate-300",
    }
    return colors[iconType as keyof typeof colors] || colors.clock
  }

  const currentDayActivities = activities.filter((activity) => activity.day_index === selectedDay)

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading itinerary...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="hidden lg:flex items-center space-x-2 border-b p-4 bg-gray-50">
        <Calendar className="h-5 w-5 text-ucsd-blue" />
        <h1 className="text-xl font-bold text-ucsd-navy">Trip Itinerary</h1>
        <p className="text-sm text-gray-600 mt-0.5">Plan your adventure day by day</p>
      </div>

      {/* Day Selector */}
      <div className="p-4 border-b bg-gray-50">
        <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(Number.parseInt(value))}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dayTemplates.map((template, index) => (
              <SelectItem key={index} value={index.toString()}>
                {template.day} - {template.subtitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Current Day Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-ucsd-navy">{dayTemplates[selectedDay]?.day}</h2>
            <p className="text-gray-600">{dayTemplates[selectedDay]?.subtitle}</p>
          </div>

          {/* Activities Timeline */}
          <div className="space-y-4">
            {currentDayActivities.map((activity, index) => {
              const IconComponent = iconMap[activity.icon_type as keyof typeof iconMap] || Clock
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  {/* Time */}
                  <div className="w-20 text-right">
                    <Badge variant="outline" className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getIconColor(activity.icon_type)} ${getBorderColor(activity.icon_type)}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {index < currentDayActivities.length - 1 && <div className="w-px h-8 bg-gray-300 mt-2" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {editingId === activity.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleEditActivity(activity.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditingText("")
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Card className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <p className="text-gray-800 whitespace-pre-wrap">{activity.text}</p>
                          <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(activity.id)
                                setEditingText(activity.text)
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )
            })}

            {currentDayActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activities planned for this day yet.</p>
                <p className="text-sm">Add your first activity below!</p>
              </div>
            )}
          </div>

          {/* Add New Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time</label>
                  <Input
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    placeholder="9:00 AM"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Icon</label>
                  <Select
                    value={newActivity.icon_type}
                    onValueChange={(value) => setNewActivity({ ...newActivity, icon_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clock">⏰ General</SelectItem>
                      <SelectItem value="map">🗺️ Location</SelectItem>
                      <SelectItem value="users">👥 Group Activity</SelectItem>
                      <SelectItem value="camera">📸 Photo Op</SelectItem>
                      <SelectItem value="utensils">🍽️ Food</SelectItem>
                      <SelectItem value="tent">⛺ Camping</SelectItem>
                      <SelectItem value="mountain">🏔️ Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Activity Description</label>
                <Textarea
                  value={newActivity.text}
                  onChange={(e) => setNewActivity({ ...newActivity, text: e.target.value })}
                  placeholder="Describe the activity, location, or what to bring..."
                  className="min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleAddActivity}
                className="w-full bg-ucsd-gold hover:bg-yellow-500 text-ucsd-navy"
                disabled={!newActivity.text.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to {dayTemplates[selectedDay]?.day}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
