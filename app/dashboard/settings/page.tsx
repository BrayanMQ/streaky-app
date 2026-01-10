"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"
import { Bell, Moon, Smartphone, LogOut, Sun, Monitor, Languages } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useUserSettings } from "@/hooks/useUserSettings"
import { usePWAInstall } from "@/hooks/usePWAInstall"
import { ChangeEmailModal } from "@/components/settings/ChangeEmailModal"
import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal"
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
import I18nProvider from "@/components/I18nProvider"

export default function SettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, signOut, signOutPending } = useAuth()
  const { settings, updateTheme, isUpdating: isUpdatingTheme } = useUserSettings()
  const { isInstallable, isInstalled, install: installPWA } = usePWAInstall()

  // Modal states
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleInstallPWA = async () => {
    try {
      await installPWA()
    } catch (error) {
      console.error("Error installing PWA:", error)
    }
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const currentTheme = settings?.theme || "system"

  // Normalize language code (e.g., 'es-ES' -> 'es')
  const currentLanguageCode = (i18n.language || "en").split("-")[0]

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷", disabled: true },
    { code: "fr", label: "Français", flag: "🇫🇷", disabled: true },
    { code: "de", label: "Deutsch", flag: "🇩🇪", disabled: true },
  ]

  const currentLanguage = languages.find(l => l.code === currentLanguageCode) || languages[0]

  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-muted/30">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="container mx-auto flex-1 px-4 py-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.account.title")}</CardTitle>
                <CardDescription>{t("settings.account.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("settings.account.email")}</p>
                    <p className="text-muted-foreground text-sm">
                      {user?.email || t("auth.loading")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangeEmailModalOpen(true)}
                  >
                    {t("settings.account.change")}
                  </Button>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="font-medium">{t("settings.account.password")}</p>
                    <p className="text-muted-foreground text-sm">••••••••</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    {t("settings.account.change")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications - Coming Soon */}
            <Card className="relative overflow-hidden">
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center space-y-2 p-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{t("settings.notifications.comingSoon")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {t("settings.notifications.comingSoonDesc")}
                  </p>
                </div>
              </div>

              {/* Blurred Content */}
              <div className="blur-sm opacity-50 pointer-events-none">
                <CardHeader>
                  <CardTitle>{t("settings.notifications.title")}</CardTitle>
                  <CardDescription>{t("settings.notifications.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="size-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="daily-reminders">{t("settings.notifications.dailyReminders")}</Label>
                        <p className="text-muted-foreground text-sm">{t("settings.notifications.dailyRemindersDesc")}</p>
                      </div>
                    </div>
                    <Switch id="daily-reminders" disabled />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Bell className="size-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="streak-alerts">{t("settings.notifications.streakAlerts")}</Label>
                        <p className="text-muted-foreground text-sm">{t("settings.notifications.streakAlertsDesc")}</p>
                      </div>
                    </div>
                    <Switch id="streak-alerts" disabled defaultChecked />
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.appearance.title")}</CardTitle>
                <CardDescription>{t("settings.appearance.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("settings.appearance.theme")}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateTheme("light")}
                      disabled={isUpdatingTheme}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        currentTheme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Sun className="h-5 w-5" />
                      <span className="text-xs font-medium">{t("settings.appearance.light")}</span>
                    </button>
                    <button
                      onClick={() => updateTheme("dark")}
                      disabled={isUpdatingTheme}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        currentTheme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Moon className="h-5 w-5" />
                      <span className="text-xs font-medium">{t("settings.appearance.dark")}</span>
                    </button>
                    <button
                      onClick={() => updateTheme("system")}
                      disabled={isUpdatingTheme}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        currentTheme === "system"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Monitor className="h-5 w-5" />
                      <span className="text-xs font-medium">{t("settings.appearance.system")}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.language.title")}</CardTitle>
                <CardDescription>{t("settings.language.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Languages className="size-5 text-muted-foreground" />
                    <div>
                      <Label>{t("settings.language.appLanguage")}</Label>
                      <p className="text-muted-foreground text-sm">{currentLanguage.label}</p>
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <span className="text-lg">{currentLanguage.flag}</span>
                        {t("settings.account.change")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2" align="end">
                      <div className="grid gap-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            disabled={lang.disabled}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                              currentLanguageCode === lang.code
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground",
                              lang.disabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform">
                              {lang.flag}
                            </span>
                            <span>{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.app.title")}</CardTitle>
                <CardDescription>{t("settings.app.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="size-5 text-muted-foreground" />
                    <div>
                      <Label>{t("settings.app.installApp")}</Label>
                      <p className="text-muted-foreground text-sm">
                        {isInstalled
                          ? t("settings.app.installed")
                          : t("settings.app.installDesc")}
                      </p>
                    </div>
                  </div>
                  {isInstalled ? (
                    <Button variant="outline" disabled>
                      {t("settings.app.installedBtn")}
                    </Button>
                  ) : isInstallable ? (
                    <Button variant="outline" onClick={handleInstallPWA}>
                      {t("settings.app.installBtn")}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      {t("settings.app.notAvailable")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">{t("settings.dangerZone.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("settings.dangerZone.deleteAccount")}</p>
                    <p className="text-muted-foreground text-sm">
                      {t("settings.dangerZone.deleteAccountDesc")}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                  >
                    {t("settings.dangerZone.deleteBtn")}
                  </Button>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-3">
                    <LogOut className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t("settings.dangerZone.signOut")}</p>
                      <p className="text-muted-foreground text-sm">{t("settings.dangerZone.signOutDesc")}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={signOutPending}
                  >
                    {signOutPending ? t("settings.dangerZone.signingOut") : t("settings.dangerZone.signOut")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />

        {/* Modals */}
        <ChangeEmailModal
          open={isChangeEmailModalOpen}
          onOpenChange={setIsChangeEmailModalOpen}
          currentEmail={user?.email || ""}
        />
        <ChangePasswordModal
          open={isChangePasswordModalOpen}
          onOpenChange={setIsChangePasswordModalOpen}
        />
        <DeleteAccountModal
          open={isDeleteAccountModalOpen}
          onOpenChange={setIsDeleteAccountModalOpen}
        />
      </div>
    </I18nProvider>
  )
}
