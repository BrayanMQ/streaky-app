"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle, Trash2 } from "lucide-react"
import { deleteUserAccount } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface DeleteAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CONFIRMATION_TEXT = "DELETE"

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const router = useRouter()
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmationText("")
      setError(null)
    }
  }, [open])

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (confirmationText !== CONFIRMATION_TEXT) {
      setError(`Please type "${CONFIRMATION_TEXT}" to confirm`)
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await deleteUserAccount()

      if (deleteError) {
        setError(deleteError.message || "Failed to delete account. Please try again.")
        setIsDeleting(false)
        return
      }

      toast.success('Account deleted', {
        description: "Your account and all associated data have been deleted.",
      })

      // Redirect to login page after successful deletion
      router.push('/auth/login')
    } catch (error) {
      console.error("Error deleting account:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsDeleting(false)
    }
  }

  const isConfirmValid = confirmationText === CONFIRMATION_TEXT

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Delete Account</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            This action cannot be undone. This will permanently delete your account and remove all
            of your data from our servers. This includes all your habits, logs, and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDelete} className="space-y-4">
          {/* Warning Box */}
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">
                  Warning: This action is permanent
                </p>
                <p className="text-xs text-muted-foreground">
                  All your data will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm font-semibold">
              Type <span className="font-mono font-bold">{CONFIRMATION_TEXT}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              type="text"
              placeholder={CONFIRMATION_TEXT}
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value)
                setError(null)
              }}
              disabled={isDeleting}
              autoFocus
              className={cn(
                "h-11 font-mono",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertTriangle className="h-3 w-3" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting || !isConfirmValid}
              className="w-full sm:w-auto shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

