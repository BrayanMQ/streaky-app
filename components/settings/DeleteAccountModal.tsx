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
import { useTranslation } from "react-i18next"
import I18nProvider from "@/components/I18nProvider"

interface DeleteAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CONFIRMATION_TEXT = "DELETE"

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const { t } = useTranslation()
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
      setError(t("settings.modals.deleteAccount.confirmError", { confirmText: CONFIRMATION_TEXT }))
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await deleteUserAccount()

      if (deleteError) {
        setError(deleteError.message || t("settings.modals.changeEmail.validation.error"))
        setIsDeleting(false)
        return
      }

      toast.success(t("settings.modals.deleteAccount.successToast"), {
        description: t("settings.modals.deleteAccount.successToastDesc"),
      })

      // Redirect to login page after successful deletion
      router.push('/auth/login')
    } catch (error) {
      console.error("Error deleting account:", error)
      setError(t("settings.modals.changeEmail.validation.error"))
      setIsDeleting(false)
    }
  }

  const isConfirmValid = confirmationText === CONFIRMATION_TEXT

  return (
    <I18nProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-bold">{t("settings.modals.deleteAccount.title")}</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {t("settings.modals.deleteAccount.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDelete} className="space-y-4">
            {/* Warning Box */}
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-destructive">
                    {t("settings.modals.deleteAccount.warningTitle")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.modals.deleteAccount.warningText")}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm font-semibold">
                {t("settings.modals.deleteAccount.confirmPrompt", { confirmText: CONFIRMATION_TEXT })}
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
                {t("modals.common.cancel")}
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
                    {t("settings.modals.deleteAccount.submitting")}
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("settings.modals.deleteAccount.submit")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </I18nProvider>
  )
}
