"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ListChecks, Plus, Trash2, Edit3, Check, X, Package } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/app/page"
import type { ChecklistItem } from "@/lib/supabase"

interface ChecklistChannelProps {
  user: User
  channelId: string
  communityId: string
}

const categories = [
  { id: "gear", name: "Climbing Gear", icon: "🧗", color: "bg-blue-100 text-blue-800" },
  { id: "camping", name: "Camping", icon: "⛺", color: "bg-green-100 text-green-800" },
  { id: "food", name: "Food & Water", icon: "🍽️", color: "bg-orange-100 text-orange-800" },
  { id: "personal", name: "Personal Items", icon: "🎒", color: "bg-purple-100 text-purple-800" },
  { id: "safety", name: "Safety & First Aid", icon: "🏥", color: "bg-red-100 text-red-800" },
  { id: "other", name: "Other", icon: "📦", color: "bg-gray-100 text-gray-800" },
]

export default function ChecklistChannel({ user, channelId, communityId }: ChecklistChannelProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("gear")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
    subscribeToItems()
  }, [channelId])

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Error loading checklist items:", error)
      toast.error("Failed to load checklist")
    } finally {
      setLoading(false)
    }
  }

  const subscribeToItems = () => {
    const subscription = supabase
      .channel(`checklist:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklist_items",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          loadItems()
        },
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleAddItem = async () => {
    if (!newItem.trim()) return

    try {
      const { error } = await supabase.from("checklist_items").insert({
        text: newItem.trim(),
        checked: false,
        channel_id: channelId,
        created_by: user.id,
        category: selectedCategory,
      })

      if (error) throw error

      setNewItem("")
      toast.success("Item added to checklist!")
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error("Failed to add item")
    }
  }

  const handleToggleItem = async (id: string, checked: boolean) => {
    try {
      const { error } = await supabase.from("checklist_items").update({ checked }).eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Failed to update item")
    }
  }

  const handleEditItem = async (id: string) => {
    if (!editingText.trim()) return

    try {
      const { error } = await supabase.from("checklist_items").update({ text: editingText.trim() }).eq("id", id)

      if (error) throw error

      setEditingId(null)
      setEditingText("")
      toast.success("Item updated!")
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Failed to update item")
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id)

      if (error) throw error
      toast.success("Item deleted!")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    }
  }

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => (item as any).category === categoryId || (!item.category && categoryId === "other"))
  }

  const getTotalProgress = () => {
    if (items.length === 0) return 0
    const checkedItems = items.filter((item) => item.checked).length
    return Math.round((checkedItems / items.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <div className="w-8 h-8 border-2 border-ucsd-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading checklist...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="hidden lg:flex items-center space-x-2 border-b p-4 bg-gray-50">
        <ListChecks className="h-5 w-5 text-ucsd-blue" />
        <h1 className="text-xl font-bold text-ucsd-navy">Trip Checklist</h1>
        <p className="text-sm text-gray-600 mt-0.5">Track what to bring for the adventure</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Trip Preparation Progress</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {getTotalProgress()}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={getTotalProgress()} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {items.filter((item) => item.checked).length} of {items.length} items completed
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="grid gap-6">
            {categories.map((category) => {
              const categoryItems = getItemsByCategory(category.id)
              const completedItems = categoryItems.filter((item) => item.checked).length
              const categoryProgress = categoryItems.length > 0 ? (completedItems / categoryItems.length) * 100 : 0

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span>{category.name}</span>
                        <Badge className={category.color}>
                          {completedItems}/{categoryItems.length}
                        </Badge>
                      </div>
                      {categoryItems.length > 0 && <Badge variant="outline">{Math.round(categoryProgress)}%</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 group">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                          className="data-[state=checked]:bg-ucsd-gold data-[state=checked]:border-ucsd-gold"
                        />

                        {editingId === item.id ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <Input
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1"
                              onKeyDown={(e) => e.key === "Enter" && handleEditItem(item.id)}
                            />
                            <Button size="sm" onClick={() => handleEditItem(item.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null)
                                setEditingText("")
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className={`flex-1 ${item.checked ? "line-through text-gray-500" : "text-gray-800"}`}>
                              {item.text}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingId(item.id)
                                  setEditingText(item.text)
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {categoryItems.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No items in this category yet</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Add New Item */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Add New Item</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="What do you need to bring?"
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucsd-gold focus:border-ucsd-gold"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAddItem}
                className="w-full bg-ucsd-gold hover:bg-yellow-500 text-ucsd-navy"
                disabled={!newItem.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Checklist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
