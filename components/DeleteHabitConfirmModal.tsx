"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"
import { useUIStore } from "@/store/ui"
import { useDeleteHabit } from "@/hooks/useHabits"

export function DeleteHabitConfirmModal() {
  const { isDeleteHabitModalOpen, closeDeleteHabitModal, selectedHabit, clearSelectedHabit } = useUIStore()
  const { deleteHabit, isDeleting } = useDeleteHabit()

  const handleDelete = async () => {
    if (!selectedHabit) return

    try {
      await deleteHabit(selectedHabit.id)
      handleClose()
    } catch (error) {
      console.error("Error deleting habit:", error)
    }
  }

  const handleClose = () => {
    closeDeleteHabitModal()
    // Small delay to prevent flickering during transition
    setTimeout(clearSelectedHabit, 200)
  }

  if (!selectedHabit) return null

  return (
    <Dialog open={isDeleteHabitModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Delete Habit</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Are you sure you want to delete <span className="font-bold text-foreground">"{selectedHabit.title}"</span>?
            This action cannot be undone and all history for this habit will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Habit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

