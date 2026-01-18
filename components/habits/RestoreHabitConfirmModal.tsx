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
import { Loader2, RefreshCw } from "lucide-react"
import { useUIStore } from "@/store/ui"
import { useRestoreHabit } from "@/hooks/useHabits"
import { useTranslation } from "react-i18next"
import I18nProvider from "@/components/I18nProvider"

export function RestoreHabitConfirmModal() {
    const { t } = useTranslation()
    const { isRestoreHabitModalOpen, closeRestoreHabitModal, selectedHabit, clearSelectedHabit } = useUIStore()
    const { restoreHabit, isRestoring } = useRestoreHabit()

    const handleRestore = async () => {
        if (!selectedHabit) return

        try {
            await restoreHabit(selectedHabit.id)
            toast.success(t('modals.restoreHabit.successToast'), {
                description: t('modals.restoreHabit.successToastDesc', { title: selectedHabit.title }),
            })
            handleClose()
        } catch (error) {
            console.error("Error restoring habit:", error)
            toast.error(t('modals.restoreHabit.errorToast'), {
                description: t('modals.restoreHabit.errorToastDesc', { title: selectedHabit.title }),
            })
        }
    }

    const handleClose = () => {
        closeRestoreHabitModal()
        // Small delay to prevent flickering during transition
        setTimeout(clearSelectedHabit, 200)
    }

    if (!selectedHabit) return null

    return (
        <Dialog open={isRestoreHabitModalOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <I18nProvider>
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <div className="p-2 rounded-full bg-primary/10">
                                <RefreshCw className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-xl font-bold">{t('modals.restoreHabit.title')}</DialogTitle>
                        </div>
                        <DialogDescription asChild className="text-base pt-2">
                            <div>
                                {t('modals.restoreHabit.description', { title: selectedHabit.title })}
                                <div className="mt-2 p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                                    {t('modals.restoreHabit.warning')}
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 mt-8 sm:flex-row sm:justify-stretch">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isRestoring}
                            className="w-full h-11"
                        >
                            {t('modals.common.cancel')}
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleRestore}
                            disabled={isRestoring}
                            className="w-full h-11 shadow-lg shadow-primary/20"
                        >
                            {isRestoring ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('modals.restoreHabit.submitting')}
                                </>
                            ) : (
                                t('modals.restoreHabit.submit')
                            )}
                        </Button>
                    </DialogFooter>
                </I18nProvider>
            </DialogContent>
        </Dialog>
    )
}
