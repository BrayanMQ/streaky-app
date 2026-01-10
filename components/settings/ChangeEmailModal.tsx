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
import { changeEmailSchema } from "@/lib/validations"
import { useTranslation } from "react-i18next"
import I18nProvider from "@/components/I18nProvider"

interface ChangeEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}

export function ChangeEmailModal({ open, onOpenChange, currentEmail }: ChangeEmailModalProps) {
  const { t } = useTranslation()
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

    // Validate using Zod schema
    const trimmedEmail = newEmail.trim()
    const result = changeEmailSchema.safeParse({ email: trimmedEmail })

    if (!result.success) {
      const error = result.error.issues[0]
      setValidationError(error.message)
      return
    }

    // Additional validation: email must be different from current
    if (trimmedEmail === currentEmail) {
      setValidationError(t("settings.modals.changeEmail.validation.different"))
      return
    }

    setIsUpdating(true)
    setValidationError(null)

    try {
      const { error } = await updateEmail(trimmedEmail)

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('already registered')) {
          setValidationError(t("settings.modals.changeEmail.validation.alreadyRegistered"))
        } else {
          setValidationError(error.message || t("settings.modals.changeEmail.validation.error"))
        }
        setIsUpdating(false)
        return
      }

      toast.success(t("settings.modals.changeEmail.successToast"), {
        description: t("settings.modals.changeEmail.successToastDesc", { email: trimmedEmail }),
        duration: 5000,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating email:", error)
      setValidationError(t("settings.modals.changeEmail.validation.error"))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <I18nProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">{t("settings.modals.changeEmail.title")}</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {t("settings.modals.changeEmail.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Email Display */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("settings.modals.changeEmail.currentEmail")}</Label>
              <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                {currentEmail}
              </div>
            </div>

            {/* New Email Input */}
            <div className="space-y-2">
              <Label htmlFor="new-email" className="text-sm font-semibold">
                {t("settings.modals.changeEmail.newEmailLabel")}
              </Label>
              <Input
                id="new-email"
                type="email"
                placeholder={t("settings.modals.changeEmail.newEmailPlaceholder")}
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
                {t("modals.common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !newEmail.trim()}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("settings.modals.changeEmail.submitting")}
                  </>
                ) : (
                  t("settings.modals.changeEmail.submit")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </I18nProvider>
  )
}
