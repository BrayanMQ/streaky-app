"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Target, Zap, Trophy, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHabits } from "@/hooks/useHabits"
import { useHabitLogs } from "@/hooks/useHabitLogs"
import { getHabitColor } from "@/lib/habitColors"
import { getLongestStreak, formatDateLocal } from "@/lib/streaks"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { habits, isLoading: isLoadingHabits } = useHabits()

  // Auto-scroll selected habit chip to the left
  useEffect(() => {
    if (selectedHabitId && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const selectedElement = container.querySelector(`[data-habit-id="${selectedHabitId}"]`) as HTMLElement
      
      if (selectedElement) {
        const targetScrollPos = selectedElement.offsetLeft - 16 // 16px padding for breathing room
        
        container.scrollTo({
          left: targetScrollPos,
          behavior: "smooth"
        })
      }
    }
  }, [selectedHabitId])

  // Define a broad range for preloading (selected year ± 1 year)
  // This ensures that navigation between months and years is instantaneous
  // and logs from previous/next years are available when navigating
  const preloadRange = useMemo(() => {
    const startYear = selectedYear - 1
    const endYear = selectedYear + 1
    return {
      startDate: `${startYear}-01-01`,
      endDate: `${endYear}-12-31`
    }
  }, [selectedYear])

  // Fetch ALL logs for ALL habits in this broad range at once
  // By not passing habitId, we get logs for all user's habits
  const { logs: allLogs, isLoading: isLoadingLogs } = useHabitLogs({
    startDate: preloadRange.startDate,
    endDate: preloadRange.endDate,
  })

  // Select the first habit automatically when habits are loaded
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id)
    }
  }, [habits, selectedHabitId])

  // Filter logs in memory for the selected habit
  const currentHabitLogs = useMemo(() => {
    if (!selectedHabitId || !allLogs) return []
    return allLogs.filter(log => log.habit_id === selectedHabitId)
  }, [allLogs, selectedHabitId])

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  // Map logs to days of the month from the preloaded data
  const completionMap = useMemo(() => {
    const map = new Map<number, boolean>()
    
    currentHabitLogs.forEach((log) => {
      // Use formatDateLocal to get date string in YYYY-MM-DD format
      const dateStr = formatDateLocal(log.date)
      // Extract year, month, and day directly from string to avoid timezone issues
      const [year, month, day] = dateStr.split('-').map(Number)
      
      // Verify log belongs to selected month (month is 1-indexed in the string)
      if (month - 1 === selectedMonth && year === selectedYear) {
        map.set(day, log.completed)
      }
    })
    
    return map
  }, [currentHabitLogs, selectedMonth, selectedYear])

  // Calculate statistics using preloaded habit logs
  const stats = useMemo(() => {
    let completedDays = 0
    let missedDays = 0
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isCompleted = completionMap.get(day)
      if (isCompleted === true) {
        completedDays++
      } else {
        missedDays++
      }
    }
    
    const completionRate = daysInMonth > 0 ? Math.round((completedDays / daysInMonth) * 100) : 0
    // Use all preloaded logs for the habit to get the true best streak
    const bestStreak = selectedHabitId ? getLongestStreak(selectedHabitId, currentHabitLogs) : 0
    
    return { completedDays, missedDays, completionRate, bestStreak }
  }, [completionMap, daysInMonth, selectedHabitId, currentHabitLogs])

  // Get selected habit color
  const selectedHabit = habits.find((h) => h.id === selectedHabitId)
  const habitColorClass = selectedHabit 
    ? getHabitColor(selectedHabit, habits.findIndex((h) => h.id === selectedHabitId))
    : "bg-primary"
  
  // Add shadow class based on color
  const habitColorWithShadow = habitColorClass + " shadow-md"

  // Month navigation handlers
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Check if a day is today
  const isToday = (dayNumber: number) => {
    const today = new Date()
    return (
      dayNumber === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    )
  }

  const isLoading = isLoadingHabits || isLoadingLogs

  // Edge case: No habits
  if (!isLoading && habits.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-8 max-w-full">
          <Card className="border-none bg-card shadow-xl ring-1 ring-border">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-muted-foreground">No habits created yet.</p>
              <Button asChild className="mt-4">
                <a href="/dashboard/habits">Create your first habit</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-muted/50 to-background">
      <Header />

      {/* Main Content - Improved spacing and layout */}
      <main className="flex-1 px-4 py-4 md:px-10 lg:px-16 w-full max-w-[1600px] mx-auto pb-20 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Habit Selector - More intuitive and prominent */}
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 scroll-smooth"
              >
                {habits.map((habit, index) => {
                  const isSelected = selectedHabitId === habit.id
                  const habitColor = getHabitColor(habit, index)
                  
                  return (
                    <Button
                      key={habit.id}
                      data-habit-id={habit.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedHabitId(habit.id)}
                      className={cn(
                        "h-10 whitespace-nowrap rounded-xl px-5 py-2 transition-all duration-500 font-semibold text-sm border-2",
                        isSelected 
                          ? cn(habitColor, "text-white shadow-md scale-105 border-transparent ring-2 ring-primary/20 hover:opacity-90") 
                          : "hover:bg-muted hover:border-muted-foreground/20 hover:scale-[1.02] border-muted"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {habit.icon && <span>{habit.icon}</span>}
                        {habit.title}
                      </span>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats Grid - More compact for better visibility */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
            {[
              { 
                label: "Completed", 
                value: isLoading ? "..." : stats.completedDays,
                icon: CheckCircle2,
                color: "text-green-500",
                bg: "bg-green-500/10"
              },
              { 
                label: "Missed", 
                value: isLoading ? "..." : stats.missedDays,
                icon: XCircle,
                color: "text-red-500",
                bg: "bg-red-500/10"
              },
              { 
                label: "Success Rate", 
                value: isLoading ? "..." : `${stats.completionRate}%`,
                icon: Target,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              { 
                label: "Best Streak", 
                value: isLoading ? "..." : stats.bestStreak,
                icon: Zap,
                color: "text-orange-500",
                bg: "bg-orange-500/10"
              },
            ].map((stat) => (
              <Card key={stat.label} className="group relative overflow-hidden border-none bg-muted/20 shadow-none transition-all duration-300 hover:bg-muted/30">
                <div className={cn("absolute top-0 left-0 h-full w-0.5 transition-all duration-300", stat.color.replace("text-", "bg-"))} />
                <CardContent className="p-3 sm:p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded-lg", stat.bg)}>
                      <stat.icon className={cn("size-3.5", stat.color)} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{stat.label}</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight pl-0.5">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calendar Card - Refined typography and spacing */}
          <Card className="overflow-hidden border-none bg-card shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] ring-1 ring-border/50 rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Trophy className="size-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {monthNames[selectedMonth]} <span className="text-muted-foreground/40">{selectedYear}</span>
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="size-9 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                  onClick={handlePreviousMonth}
                  disabled={isLoading}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="size-9 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                  onClick={handleNextMonth}
                  disabled={isLoading}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-7 gap-2 sm:gap-4">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2 sm:gap-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="pb-3 text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square opacity-20" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1
                    const isCompleted = completionMap.get(dayNumber) === true
                    const dayIsToday = isToday(dayNumber)

                    return (
                      <div
                        key={dayNumber}
                        className={cn(
                          "relative flex aspect-square items-center justify-center rounded-2xl text-base font-semibold transition-all duration-500 group cursor-default select-none",
                          isCompleted 
                            ? cn(habitColorWithShadow, "text-white scale-100 shadow-md ring-1 ring-white/10") 
                            : "bg-muted/30 text-muted-foreground/40 hover:bg-muted/50",
                          dayIsToday && !isCompleted && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-background shadow-sm",
                        )}
                      >
                        {dayNumber}
                        {dayIsToday && !isCompleted && (
                          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                          </span>
                        )}
                        {/* Subtle inner highlight for completed days */}
                        {isCompleted && (
                          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

