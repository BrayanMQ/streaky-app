"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"
import { Bell, Moon, Smartphone, LogOut, Sun, Monitor } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useUserSettings } from "@/hooks/useUserSettings"
import { usePWAInstall } from "@/hooks/usePWAInstall"
import { ChangeEmailModal } from "@/components/settings/ChangeEmailModal"
import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal"
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
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

  const currentTheme = settings?.theme || "system"

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground text-sm">
                    {user?.email || "Loading..."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsChangeEmailModalOpen(true)}
                >
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-muted-foreground text-sm">••••••••</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                >
                  Change
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
                  <span className="text-sm font-semibold text-primary">Coming Soon</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Notification settings will be available in a future update
                </p>
              </div>
            </div>

            {/* Blurred Content */}
            <div className="blur-sm opacity-50 pointer-events-none">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="size-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="daily-reminders">Daily Reminders</Label>
                      <p className="text-muted-foreground text-sm">Get reminded to track your habits</p>
                    </div>
                  </div>
                  <Switch id="daily-reminders" disabled />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-3">
                    <Bell className="size-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="streak-alerts">Streak Alerts</Label>
                      <p className="text-muted-foreground text-sm">Celebrate your milestones</p>
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
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Streaky looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Theme</Label>
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
                    <span className="text-xs font-medium">Light</span>
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
                    <span className="text-xs font-medium">Dark</span>
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
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardHeader>
              <CardTitle>App</CardTitle>
              <CardDescription>Progressive Web App settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="size-5 text-muted-foreground" />
                  <div>
                    <Label>Install App</Label>
                    <p className="text-muted-foreground text-sm">
                      {isInstalled
                        ? "App is installed on your device"
                        : "Add Streaky to your home screen"}
                    </p>
                  </div>
                </div>
                {isInstalled ? (
                  <Button variant="outline" disabled>
                    Installed
                  </Button>
                ) : isInstallable ? (
                  <Button variant="outline" onClick={handleInstallPWA}>
                    Install
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Not Available
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteAccountModalOpen(true)}
                >
                  Delete
                </Button>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-3">
                  <LogOut className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Sign Out</p>
                    <p className="text-muted-foreground text-sm">Sign out of your account</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={signOutPending}
                >
                  {signOutPending ? "Signing out..." : "Sign Out"}
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
  )
}
