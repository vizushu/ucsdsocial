"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Edit3, Check, X, Utensils } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FoodItem {
  id: string
  text: string
  checked: boolean
}

const initialFoodItems: FoodItem[] = [
  { id: "1", text: "S'mores supplies (graham crackers, marshmallows, chocolate)", checked: false },
  { id: "2", text: "BBQ items (burgers, hot dogs, buns, condiments)", checked: false },
  { id: "3", text: "Soup (canned or instant)", checked: false },
  { id: "4", text: "Rice / Pasta / Quinoa", checked: false },
  { id: "5", text: "Drinks (juice, soda, coffee, tea)", checked: false },
  { id: "6", text: "Water (lots of it!)", checked: true },
  { id: "7", text: "Fruits (apples, bananas, oranges)", checked: false },
  { id: "8", text: "PB&J supplies (bread, peanut butter, jelly)", checked: false },
  { id: "9", text: "Snacks (trail mix, granola bars, chips)", checked: false },
]

export default function FoodPlanningChannel() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems)
  const [newItemText, setNewItemText] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemText, setEditingItemText] = useState("")

  const handleAddItem = () => {
    if (newItemText.trim() === "") return
    setFoodItems([...foodItems, { id: Date.now().toString(), text: newItemText.trim(), checked: false }])
    setNewItemText("")
  }

  const handleDeleteItem = (id: string) => {
    setFoodItems(foodItems.filter((item) => item.id !== id))
  }

  const handleToggleChecked = (id: string) => {
    setFoodItems(foodItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const startEditItem = (item: FoodItem) => {
    setEditingItemId(item.id)
    setEditingItemText(item.text)
  }

  const handleEditItem = () => {
    if (editingItemId === null || editingItemText.trim() === "") return
    setFoodItems(
      foodItems.map((item) => (item.id === editingItemId ? { ...item, text: editingItemText.trim() } : item)),
    )
    setEditingItemId(null)
    setEditingItemText("")
  }

  const cancelEditItem = () => {
    setEditingItemId(null)
    setEditingItemText("")
  }

  // Effect to scroll to bottom when new item is added (optional)
  const [listRef, setListRef] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (listRef) {
      listRef.scrollTop = listRef.scrollHeight
    }
  }, [foodItems, listRef])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Desktop Header (Optional, if needed for consistency with CommunityPage structure) */}
      <div className="hidden sm:flex items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <Utensils className="h-5 w-5 mr-2 text-ucsd-blue dark:text-ucsd-gold" />
        <h1 className="text-lg font-semibold text-ucsd-navy dark:text-gray-100">Food Planning</h1>
      </div>

      <ScrollArea className="flex-1" ref={setListRef}>
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-1">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between py-3 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
            >
              {editingItemId === item.id ? (
                <div className="flex-grow flex items-center space-x-2">
                  <Input
                    type="text"
                    value={editingItemText}
                    onChange={(e) => setEditingItemText(e.target.value)}
                    className="flex-grow h-9 text-sm sm:text-base bg-white dark:bg-gray-700 border-ucsd-gold focus-visible:ring-ucsd-gold"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleEditItem()}
                  />
                  <Button
                    onClick={handleEditItem}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-600 hover:text-green-700"
                  >
                    <Check size={18} />
                  </Button>
                  <Button
                    onClick={cancelEditItem}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 flex-grow">
                    <Checkbox
                      id={`food-${item.id}`}
                      checked={item.checked}
                      onCheckedChange={() => handleToggleChecked(item.id)}
                      className="data-[state=checked]:bg-ucsd-gold data-[state=checked]:border-ucsd-gold border-gray-400 dark:border-gray-600"
                    />
                    <label
                      htmlFor={`food-${item.id}`}
                      className={`text-sm sm:text-base cursor-pointer ${
                        item.checked
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {item.text}
                    </label>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => startEditItem(item)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-ucsd-blue dark:text-ucsd-aqua hover:text-ucsd-navy dark:hover:text-ucsd-gold"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(item.id)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add New Food Item Form */}
      <div className="p-4 sm:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800/70 rounded-lg p-4 sm:p-5 shadow">
          <h3 className="text-md sm:text-lg font-semibold mb-3 text-ucsd-navy dark:text-gray-100">Add New Food Item</h3>
          <div className="flex flex-col space-y-3">
            <Input
              type="text"
              placeholder="e.g., Extra marshmallows"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="h-10 text-sm sm:text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ucsd-gold focus-visible:ring-ucsd-gold"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <Button
              onClick={handleAddItem}
              className="w-full h-10 bg-ucsd-gold hover:bg-yellow-500 text-ucsd-navy font-semibold text-sm sm:text-base"
            >
              <Plus size={18} className="mr-2" /> Add to Food List
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
