"use client"

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
import { Loader2, AlertTriangle } from "lucide-react"
import { useUIStore } from "@/store/ui"
import { useDeleteHabit } from "@/hooks/useHabits"
import { useTranslation } from "react-i18next"
import I18nProvider from "@/components/I18nProvider"

export function DeleteHabitConfirmModal() {
  const { t } = useTranslation()
  const { isDeleteHabitModalOpen, closeDeleteHabitModal, selectedHabit, clearSelectedHabit } = useUIStore()
  const { deleteHabit, isDeleting } = useDeleteHabit()

  const handleDelete = async () => {
    if (!selectedHabit) return

    try {
      await deleteHabit(selectedHabit.id)
      toast.success(t('modals.deleteHabit.successToast'), {
        description: t('modals.deleteHabit.successToastDesc', { title: selectedHabit.title }),
      })
      handleClose()
    } catch (error) {
      console.error("Error deleting habit:", error)
      toast.error(t('modals.deleteHabit.errorToast'), {
        description: t('modals.deleteHabit.errorToastDesc', { title: selectedHabit.title }),
      })
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
        <I18nProvider>
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-bold">{t('modals.deleteHabit.title')}</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {t('modals.deleteHabit.description', { title: selectedHabit.title })}
              {" "}{t('modals.deleteHabit.warning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-8 sm:flex-row sm:justify-stretch">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isDeleting}
              className="w-full h-11"
            >
              {t('modals.common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full h-11 shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('modals.deleteHabit.submitting')}
                </>
              ) : (
                t('modals.deleteHabit.submit')
              )}
            </Button>
          </DialogFooter>
        </I18nProvider>
      </DialogContent>
    </Dialog>
  )
}

