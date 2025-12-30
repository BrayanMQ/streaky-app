"use client"

import { useState, useEffect } from "react"
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
import { Loader2, AlertCircle, Mail } from "lucide-react"
import { updateEmail } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface ChangeEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}

/**
 * Validates email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function ChangeEmailModal({ open, onOpenChange, currentEmail }: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setNewEmail("")
      setValidationError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    const trimmedEmail = newEmail.trim()
    if (!trimmedEmail) {
      setValidationError("Email is required")
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setValidationError("Please enter a valid email address")
      return
    }

    if (trimmedEmail === currentEmail) {
      setValidationError("New email must be different from current email")
      return
    }

    setIsUpdating(true)
    setValidationError(null)

    try {
      const { error } = await updateEmail(trimmedEmail)

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('already registered')) {
          setValidationError("This email is already registered")
        } else {
          setValidationError(error.message || "Failed to update email. Please try again.")
        }
        setIsUpdating(false)
        return
      }

      toast.success('Email updated', {
        description: `A confirmation email has been sent to ${trimmedEmail}. Please check your inbox.`,
        duration: 5000,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating email:", error)
      setValidationError("An unexpected error occurred. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Change Email</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Enter your new email address. A confirmation email will be sent to verify the change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Email Display */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Current Email</Label>
            <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
              {currentEmail}
            </div>
          </div>

          {/* New Email Input */}
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-sm font-semibold">
              New Email
            </Label>
            <Input
              id="new-email"
              type="email"
              placeholder="newemail@example.com"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value)
                setValidationError(null)
              }}
              disabled={isUpdating}
              autoFocus
              className={cn(
                "h-11",
                validationError && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {validationError && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-3 w-3" />
                <p>{validationError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !newEmail.trim()}
              className="w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

