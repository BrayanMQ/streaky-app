"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
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
import { AlertCircle, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui"
import { useUpdateHabit } from "@/hooks/useHabits"
import { HABIT_COLORS } from "@/lib/habitColors"

const MIN_LENGTH = 2
const MAX_LENGTH = 100

export function EditHabitModal() {
  const { isEditHabitModalOpen, closeEditHabitModal, selectedHabit } = useUIStore()
  const { updateHabit, isUpdating, updateError } = useUpdateHabit()
  
  const [habitTitle, setHabitTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0])
  const [validationError, setValidationError] = useState<string | null>(null)

  // Initialize form when modal opens or selectedHabit changes
  useEffect(() => {
    if (isEditHabitModalOpen && selectedHabit) {
      setHabitTitle(selectedHabit.title || "")
      // Find the color in HABIT_COLORS or default to first
      const colorOption = HABIT_COLORS.find(
        (c) => c.value === selectedHabit.color
      ) || HABIT_COLORS[0]
      setSelectedColor(colorOption)
      setValidationError(null)
    }
  }, [isEditHabitModalOpen, selectedHabit])

  // Reset form when modal closes
  useEffect(() => {
    if (!isEditHabitModalOpen) {
      setHabitTitle("")
      setSelectedColor(HABIT_COLORS[0])
      setValidationError(null)
    }
  }, [isEditHabitModalOpen])

  const validate = () => {
    const trimmed = habitTitle.trim()
    if (!trimmed) return "Habit title is required"
    if (trimmed.length < MIN_LENGTH) return `Minimum ${MIN_LENGTH} characters required`
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHabit) return

    const error = validate()
    if (error) {
      setValidationError(error)
      return
    }

    try {
      await updateHabit({
        id: selectedHabit.id,
        title: habitTitle.trim(),
        color: selectedColor.value,
        icon: null,
        frequency: null,
      })
      toast.success('Habit updated', {
        description: `"${habitTitle.trim()}" has been successfully updated.`,
      })
      closeEditHabitModal()
    } catch (err) {
      console.error(err)
      toast.error('Error updating habit', {
        description: 'The habit could not be updated. Please try again.',
      })
    }
  }

  const buttonStyle = useMemo(() => ({
    backgroundColor: isUpdating ? undefined : selectedColor.hex,
    transition: 'background-color 0.3s ease'
  }), [selectedColor, isUpdating])

  if (!selectedHabit) {
    return null
  }

  return (
    <Dialog open={isEditHabitModalOpen} onOpenChange={open => !open && closeEditHabitModal()}>
      <DialogContent className="sm:max-w-[450px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
        {/* Decorative top bar with selected color */}
        <div 
          className="h-1.5 w-full transition-colors duration-500" 
          style={{ backgroundColor: selectedColor.hex }}
        />
        
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global API Error */}
            {updateError && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm font-medium text-destructive">Something went wrong. Please try again.</p>
              </div>
            )}

            {/* Input Section */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-habit-title" className="text-sm font-semibold">Name</Label>
                <span className={cn("text-[10px] font-mono uppercase tracking-wider", 
                  habitTitle.length > MAX_LENGTH ? "text-destructive" : "text-muted-foreground")}>
                  {habitTitle.length}/{MAX_LENGTH}
                </span>
              </div>
              <Input
                id="edit-habit-title"
                placeholder="Drinking water, Gym, Meditate..."
                value={habitTitle}
                onChange={(e) => {
                    setHabitTitle(e.target.value)
                    setValidationError(null)
                }}
                disabled={isUpdating}
                autoFocus
                className={cn(
                  "h-11 transition-all focus-visible:ring-offset-0",
                  validationError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {validationError && (
                <p className="text-destructive text-xs font-medium animate-in zoom-in-95">{validationError}</p>
              )}
            </div>

            {/* Color Picker Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-[#111827]">
                  Habit Color
                </Label>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full border border-[#E5E7EB]">
                  {selectedColor.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 p-1">
                {HABIT_COLORS.map((color) => {
                  const isSelected = selectedColor.value === color.value
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      disabled={isUpdating}
                      className={cn(
                        "group relative h-9 w-9 rounded-full transition-all duration-300 active:scale-95 touch-manipulation shadow-sm",
                        color.value,
                        isSelected 
                          ? "ring-2 ring-offset-2 ring-[#2563EB] scale-110 shadow-md" 
                          : "hover:scale-110 opacity-90 hover:opacity-100"
                      )}
                      aria-label={`Select ${color.name} color`}
                    >
                      {isSelected && (
                        <Check 
                          className="h-5 w-5 text-white absolute inset-0 m-auto animate-in zoom-in-50 duration-300" 
                          strokeWidth={3} 
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isUpdating || habitTitle.length < MIN_LENGTH}
                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:brightness-110"
                style={buttonStyle}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Habit"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={closeEditHabitModal}
                disabled={isUpdating}
                className="w-full h-11 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

