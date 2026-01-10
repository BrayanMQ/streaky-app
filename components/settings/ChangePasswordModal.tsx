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
import { Loader2, AlertCircle, Lock, Eye, EyeOff } from "lucide-react"
import { updatePassword } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { changePasswordSchema } from "@/lib/validations"
import { useTranslation } from "react-i18next"
import I18nProvider from "@/components/I18nProvider"

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setValidationError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate using Zod schema
    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    if (!result.success) {
      // Extract the first error message (Zod handles all validations)
      const error = result.error.issues[0]
      setValidationError(error.message)
      return
    }

    setIsUpdating(true)
    setValidationError(null)

    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        setValidationError(error.message || t("settings.modals.changeEmail.validation.error"))
        setIsUpdating(false)
        return
      }

      toast.success(t("settings.modals.changePassword.successToast"), {
        description: t("settings.modals.changePassword.successToastDesc"),
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating password:", error)
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
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">{t("settings.modals.changePassword.title")}</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {t("settings.modals.changePassword.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-semibold">
                {t("settings.modals.changePassword.currentPasswordLabel")}
              </Label>
              <div className="relative w-full" >
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder={t("settings.modals.changePassword.currentPasswordPlaceholder")}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setValidationError(null)
                  }}
                  disabled={isUpdating}
                  autoFocus
                  className={cn(
                    "h-11 pr-10",
                    validationError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-semibold">
                {t("settings.modals.changePassword.newPasswordLabel")}
              </Label>
              <div className="relative w-full">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t("settings.modals.changePassword.newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setValidationError(null)
                  }}
                  disabled={isUpdating}
                  className={cn(
                    "h-11 w-full pr-10",
                    validationError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.modals.changePassword.requirements")}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-semibold">
                {t("settings.modals.changePassword.confirmPasswordLabel")}
              </Label>
              <div className="relative w-full">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("settings.modals.changePassword.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setValidationError(null)
                  }}
                  disabled={isUpdating}
                  className={cn(
                    "h-11 pr-10 w-full",
                    validationError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{validationError}</p>
              </div>
            )}

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
                disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("settings.modals.changePassword.submitting")}
                  </>
                ) : (
                  t("settings.modals.changePassword.submit")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </I18nProvider>
  )
}
