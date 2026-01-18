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
import { Loader2, Archive } from "lucide-react"
import { useUIStore } from "@/store/ui"
import { useArchiveHabit } from "@/hooks/useHabits"
import { useTranslation } from "react-i18next"
import I18nProvider from "@/components/I18nProvider"

export function ArchiveHabitConfirmModal() {
    const { t } = useTranslation()
    const { isArchiveHabitModalOpen, closeArchiveHabitModal, selectedHabit, clearSelectedHabit } = useUIStore()
    const { archiveHabit, isArchiving } = useArchiveHabit()

    const handleArchive = async () => {
        if (!selectedHabit) return

        try {
            await archiveHabit(selectedHabit.id)
            toast.success(t('modals.archiveHabit.successToast'), {
                description: t('modals.archiveHabit.successToastDesc', { title: selectedHabit.title }),
            })
            handleClose()
        } catch (error) {
            console.error("Error archiving habit:", error)
            toast.error(t('modals.archiveHabit.errorToast'), {
                description: t('modals.archiveHabit.errorToastDesc', { title: selectedHabit.title }),
            })
        }
    }

    const handleClose = () => {
        closeArchiveHabitModal()
        // Small delay to prevent flickering during transition
        setTimeout(clearSelectedHabit, 200)
    }

    if (!selectedHabit) return null

    return (
        <Dialog open={isArchiveHabitModalOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <I18nProvider>
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Archive className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-xl font-bold">{t('modals.archiveHabit.title')}</DialogTitle>
                        </div>
                        <DialogDescription asChild className="text-base pt-2">
                            <div>
                                {t('modals.archiveHabit.description', { title: selectedHabit.title })}
                                <div className="mt-2 p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                                    {t('modals.archiveHabit.warning')}
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 mt-8 sm:flex-row sm:justify-stretch">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isArchiving}
                            className="w-full h-11"
                        >
                            {t('modals.common.cancel')}
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleArchive}
                            disabled={isArchiving}
                            className="w-full h-11 shadow-lg shadow-primary/20"
                        >
                            {isArchiving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('modals.archiveHabit.submitting')}
                                </>
                            ) : (
                                t('modals.archiveHabit.submit')
                            )}
                        </Button>
                    </DialogFooter>
                </I18nProvider>
            </DialogContent>
        </Dialog>
    )
}
