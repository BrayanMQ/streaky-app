"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHabits } from "@/hooks/useHabits"
import { useHabitLogs } from "@/hooks/useHabitLogs"
import { getHabitColor } from "@/lib/habitColors"
import { getLongestStreak, formatDateLocal, getTodayDateLocal } from "@/lib/streaks"

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  const { habits, isLoading: isLoadingHabits } = useHabits()

  // Seleccionar el primer hábito automáticamente cuando se cargan los hábitos
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id)
    }
  }, [habits, selectedHabitId])

  // Calcular rango de fechas para el mes seleccionado
  const { startDate, endDate } = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    
    const start = formatDateLocal(firstDay)
    const end = formatDateLocal(lastDay)
    
    return { startDate: start, endDate: end }
  }, [selectedMonth, selectedYear])

  // Obtener logs del hábito seleccionado para el mes
  const { logs, isLoading: isLoadingLogs, toggleCompletion, isToggling } = useHabitLogs({
    habitId: selectedHabitId ?? undefined,
    startDate,
    endDate,
  })

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  // Mapear logs a días del mes
  const completionMap = useMemo(() => {
    const map = new Map<number, boolean>()
    
    if (logs && selectedHabitId) {
      logs.forEach((log) => {
        // Usar formatDateLocal para obtener el string de fecha en formato YYYY-MM-DD
        const dateStr = formatDateLocal(log.date)
        // Extraer año, mes y día directamente del string para evitar problemas de zona horaria
        const [year, month, day] = dateStr.split('-').map(Number)
        
        // Verificar que el log pertenece al mes seleccionado (mes es 1-indexed en el string)
        if (month - 1 === selectedMonth && year === selectedYear) {
          map.set(day, log.completed)
        }
      })
    }
    
    return map
  }, [logs, selectedMonth, selectedYear, selectedHabitId])

  // Calcular estadísticas
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
    const bestStreak = selectedHabitId && logs ? getLongestStreak(selectedHabitId, logs) : 0
    
    return { completedDays, missedDays, completionRate, bestStreak }
  }, [completionMap, daysInMonth, selectedHabitId, logs])

  // Obtener color del hábito seleccionado
  const selectedHabit = habits.find((h) => h.id === selectedHabitId)
  const habitColorClass = selectedHabit 
    ? getHabitColor(selectedHabit, habits.findIndex((h) => h.id === selectedHabitId))
    : "bg-primary"
  
  // Agregar clase de sombra basada en el color
  const habitColorWithShadow = habitColorClass + " shadow-md"

  // Navegación de meses
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

  // Toggle de completado en un día
  const handleDayClick = async (dayNumber: number) => {
    if (!selectedHabitId || isToggling) return

    const date = new Date(selectedYear, selectedMonth, dayNumber)
    const dateString = formatDateLocal(date)
    
    try {
      await toggleCompletion({
        habitId: selectedHabitId,
        date: dateString,
      })
    } catch (error) {
      console.error("Error toggling habit completion:", error)
    }
  }

  // Verificar si un día es hoy
  const isToday = (dayNumber: number) => {
    const today = new Date()
    return (
      dayNumber === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    )
  }

  const isLoading = isLoadingHabits || isLoadingLogs

  // Casos edge: sin hábitos
  if (!isLoading && habits.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Flame className="size-5 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight">Calendar</span>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8 max-w-4xl">
          <Card className="border-none bg-card shadow-xl ring-1 ring-border">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-muted-foreground">No hay hábitos creados aún.</p>
              <Link href="/dashboard/habits">
                <Button className="mt-4">Crear tu primer hábito</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - Usando backdrop-blur nativo de v4 */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Flame className="size-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">Calendar</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 max-w-4xl">
        {/* Habit Selector - Custom scrollbar oculto en v4 con clases estándar */}
        {isLoading ? (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        ) : (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {habits.map((habit) => {
              const isSelected = selectedHabitId === habit.id
              
              return (
                <Button
                  key={habit.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedHabitId(habit.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full transition-all",
                    isSelected && "shadow-lg"
                  )}
                >
                  {habit.title}
                </Button>
              )
            })}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Completed", value: isLoading ? "..." : stats.completedDays },
            { label: "Missed", value: isLoading ? "..." : stats.missedDays },
            { label: "Rate", value: isLoading ? "..." : `${stats.completionRate}%` },
            { label: "Best Streak", value: isLoading ? "..." : stats.bestStreak },
          ].map((stat) => (
            <Card key={stat.label} className="border-none bg-muted/30 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Card */}
        <Card className="overflow-hidden border-none bg-card shadow-xl ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/10 px-6 py-4">
            <CardTitle className="text-lg font-semibold">
              {monthNames[selectedMonth]} {selectedYear}
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={handlePreviousMonth}
                disabled={isLoading}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={handleNextMonth}
                disabled={isLoading}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="pb-2 text-center text-xs font-bold text-muted-foreground/70 uppercase">
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1
                  const isCompleted = completionMap.get(dayNumber) === true
                  const dayIsToday = isToday(dayNumber)

                  return (
                    <div
                      key={dayNumber}
                      onClick={() => handleDayClick(dayNumber)}
                      className={cn(
                        "relative flex aspect-square cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
                        isCompleted 
                          ? cn(habitColorWithShadow, "text-white") 
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                        dayIsToday && !isCompleted && "ring-2 ring-primary ring-offset-2",
                        isToggling && "opacity-50 cursor-wait"
                      )}
                    >
                      {dayNumber}
                      {dayIsToday && !isCompleted && (
                        <span className="absolute -top-1 -right-1 flex size-3 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}