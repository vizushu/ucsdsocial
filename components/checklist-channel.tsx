"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ListChecks, Plus, Edit3, Trash2, Check, X } from "lucide-react" // Changed Mountain to ListChecks
import type { User } from "@/app/page" // Assuming User type is still relevant

// Props will likely change when connected to Supabase
interface ChecklistChannelProps {
  user?: User // Made optional for now
  channelId?: string
  communityId?: string
}

export default function ChecklistChannel({ user, channelId, communityId }: ChecklistChannelProps) {
  // Data fetching from Supabase based on channelId would go here
  // For now, keeping the static data structure
  const [gearItems, setGearItems] = useState([
    { id: 1, text: "Crash pads (Umair?)", checked: false },
    { id: 2, text: "Chalk & chalk bag", checked: true },
    { id: 3, text: "Climbing shoes", checked: false },
    { id: 4, text: "Tape + brushes", checked: false },
    { id: 5, text: "First aid kit", checked: false },
    { id: 6, text: "Harnesses", checked: false },
    { id: 7, text: "Water bottle / hydration pack", checked: true },
    { id: 8, text: "Sunscreen, hat", checked: false },
    { id: 9, text: "Warm layers", checked: false },
    { id: 10, text: "Hiking poles (recommended for Half Dome)", checked: false },
    { id: 11, text: "Snacks / protein bars", checked: false },
  ])
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingItemText, setEditingItemText] = useState("")
  const [newItemText, setNewItemText] = useState("")

  const handleCheckedChange = (id: number, checked: boolean) => {
    setGearItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
  }

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: Date.now(), // Will be replaced by Supabase-generated ID
        text: newItemText.trim(),
        checked: false,
      }
      setGearItems((prev) => [...prev, newItem])
      setNewItemText("")
    }
  }

  const handleDeleteItem = (id: number) => {
    setGearItems((prev) => prev.filter((item) => item.id !== id))
  }

  const startEditing = (item: (typeof gearItems)[0]) => {
    setEditingItemId(item.id)
    setEditingItemText(item.text)
  }

  const cancelEditing = () => {
    setEditingItemId(null)
    setEditingItemText("")
  }

  const saveEditing = () => {
    if (editingItemId !== null && editingItemText.trim()) {
      setGearItems((prev) =>
        prev.map((item) => (item.id === editingItemId ? { ...item, text: editingItemText.trim() } : item)),
      )
    }
    cancelEditing()
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Updated Channel Header - applied to all screen sizes */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <ListChecks className="h-5 w-5 mr-3 text-ucsd-blue dark:text-ucsd-gold flex-shrink-0" />
        <h1 className="text-lg font-semibold text-ucsd-navy dark:text-gray-100 truncate">Gear Checklist</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-2 mt-0.5 truncate hidden sm:block">
          Track and manage climbing and hiking gear
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 w-full">
          {/* Removed redundant inner title as it's now in the main header */}
          {/* <div className="mb-6">
            <h2 className="text-2xl font-bold text-ucsd-navy dark:text-gray-100">Gear Checklist</h2>
            <p className="text-gray-500 dark:text-gray-400">Bouldering + Hiking</p>
          </div> */}

          <div className="space-y-2 mt-2">
            {" "}
            {/* Added small margin-top */}
            {gearItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-lg group hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {editingItemId === item.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editingItemText}
                      onChange={(e) => setEditingItemText(e.target.value)}
                      className="flex-1 h-9"
                      onKeyPress={(e) => e.key === "Enter" && saveEditing()}
                    />
                    <Button size="icon" onClick={saveEditing} className="h-9 w-9 bg-green-500 hover:bg-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-9 w-9">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        id={`gear-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={(checked) => handleCheckedChange(item.id, checked as boolean)}
                        className="h-5 w-5 data-[state=checked]:bg-ucsd-gold data-[state=checked]:border-ucsd-gold border-gray-400 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`gear-${item.id}`}
                        className={`text-base ${
                          item.checked
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : "text-ucsd-navy dark:text-gray-200"
                        }`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(item)}
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Gear Form */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-ucsd-navy dark:text-gray-100 mb-3">Add New Gear</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Gear description"
                className="bg-white dark:bg-gray-700/50"
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Button onClick={handleAddItem} className="w-full bg-ucsd-gold hover:bg-ucsd-gold/90 text-ucsd-navy">
                <Plus className="h-4 w-4 mr-2" />
                Add to Gear List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
