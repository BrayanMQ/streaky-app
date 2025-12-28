"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui"
import { useCreateHabit } from "@/hooks/useHabits"

const colorOptions = [
  { name: "Orange", value: "bg-orange-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Cyan", value: "bg-cyan-500" },
  { name: "Yellow", value: "bg-yellow-500" },
]

/**
 * AddHabitModal component
 * 
 * Modal dialog for creating a new habit. Integrates with Zustand store
 * for state management and uses React Query for data mutation.
 * 
 * @example
 * ```tsx
 * import { AddHabitModal } from '@/components/AddHabitModal'
 * 
 * function Dashboard() {
 *   return (
 *     <>
 *       {/* Your dashboard content */}
 *       <AddHabitModal />
 *     </>
 *   )
 * }
 * ```
 */
export function AddHabitModal() {
  const { isAddHabitModalOpen, closeAddHabitModal } = useUIStore()
  const { createHabit, isCreating, createError } = useCreateHabit()
  
  const [habitTitle, setHabitTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isAddHabitModalOpen) {
      // Reset form state when modal closes
      setHabitTitle("")
      setSelectedColor(colorOptions[0].value)
      setValidationError(null)
    }
  }, [isAddHabitModalOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validate title
    if (!habitTitle.trim()) {
      setValidationError("Habit title is required")
      return
    }

    try {
      await createHabit({
        title: habitTitle.trim(),
        color: selectedColor,
        icon: null, // MVP - icon selector can be added later
        frequency: null, // MVP - daily by default
      })

      // Close modal on success (form reset happens in useEffect)
      closeAddHabitModal()
    } catch (error) {
      // Error is handled by createError state from the hook
      console.error("Failed to create habit:", error)
    }
  }

  const handleCancel = () => {
    closeAddHabitModal()
  }

  const displayError = validationError || createError?.message

  return (
    <Dialog open={isAddHabitModalOpen} onOpenChange={(open) => {
      if (!open) {
        closeAddHabitModal()
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new habit</DialogTitle>
          <DialogDescription>
            Start tracking a new daily habit to build consistency
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {displayError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{displayError}</p>
            </div>
          )}

          {/* Habit Title Input */}
          <div className="space-y-2">
            <Label htmlFor="habit-title">Habit Name</Label>
            <Input
              id="habit-title"
              placeholder="e.g., Morning Exercise, Read 30 mins"
              value={habitTitle}
              onChange={(e) => {
                setHabitTitle(e.target.value)
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError(null)
                }
              }}
              disabled={isCreating}
              required
            />
            <p className="text-muted-foreground text-sm">
              Keep it clear and actionable
            </p>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <Label>Choose a color</Label>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={cn(
                    "aspect-square h-12 w-12 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                    color.value,
                    selectedColor === color.value && "ring-4 ring-primary ring-offset-2",
                  )}
                  onClick={() => setSelectedColor(color.value)}
                  disabled={isCreating}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Footer with buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="sm:flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Habit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

