"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, ArrowLeft, TrendingUp, Target, CalendarIcon, Award, CheckCircle2, AlertCircle } from "lucide-react"
import { useHabits } from "@/hooks/useHabits"
import { useHabitLogs } from "@/hooks/useHabitLogs"
import { getCurrentStreak } from "@/lib/streaks"
import { getHabitColor } from "@/lib/habitColors"
import {
  getBestStreak,
  getAverageCompletionRate,
  getTotalDaysTracked,
  getCompletionRate,
  getCompletedDaysInRange,
} from "@/lib/stats"

export default function StatsPage() {
  const { habits, isLoading: isLoadingHabits, error: habitsError } = useHabits()
  const { logs: allLogs, isLoading: isLoadingLogs, error: logsError } = useHabitLogs()

  const isLoading = isLoadingHabits || isLoadingLogs
  const error = habitsError || logsError

  // Organize logs by habit_id for efficient lookup
  const logsByHabitId = useMemo(() => {
    const map = new Map<string, typeof allLogs>()
    for (const log of allLogs) {
      const existing = map.get(log.habit_id)
      if (existing) {
        existing.push(log)
      } else {
        map.set(log.habit_id, [log])
      }
    }
    return map
  }, [allLogs])

  // Calculate statistics
  const stats = useMemo(() => {
    if (habits.length === 0) {
      return {
        bestStreak: 0,
        avgCompletionRate: 0,
        activeHabits: 0,
        totalDays: 0,
      }
    }

    const bestStreak = getBestStreak(habits, logsByHabitId)
    const avgCompletionRate = getAverageCompletionRate(habits, logsByHabitId, 30)
    const totalDays = getTotalDaysTracked(allLogs)

    return {
      bestStreak,
      avgCompletionRate,
      activeHabits: habits.length,
      totalDays,
    }
  }, [habits, logsByHabitId, allLogs])

  // Map color classes to shadow classes (static for Tailwind to include them)
  const getShadowFromColor = (color: string): string => {
    const colorShadowMap: Record<string, string> = {
      'bg-orange-500': 'shadow-orange-500/40',
      'bg-blue-500': 'shadow-blue-500/40',
      'bg-purple-500': 'shadow-purple-500/40',
      'bg-cyan-500': 'shadow-cyan-500/40',
      'bg-green-500': 'shadow-green-500/40',
      'bg-red-500': 'shadow-red-500/40',
      'bg-pink-500': 'shadow-pink-500/40',
      'bg-yellow-500': 'shadow-yellow-500/40',
      'bg-primary': 'shadow-primary/40',
    }
    return colorShadowMap[color] || 'shadow-primary/40'
  }

  // Prepare habit breakdown data
  const habitBreakdown = useMemo(() => {
    return habits.map((habit, index) => {
      const habitLogs = logsByHabitId.get(habit.id) || []
      const streak = getCurrentStreak(habit.id, habitLogs)
      const rate = getCompletionRate(habit.id, habitLogs, 30)
      const completedDays = getCompletedDaysInRange(habit.id, habitLogs, 30)
      const color = getHabitColor(habit, index)
      const shadow = getShadowFromColor(color)

      return {
        id: habit.id,
        name: habit.title,
        streak,
        total: 30,
        rate,
        completedDays,
        color,
        shadow,
      }
    })
  }, [habits, logsByHabitId])

  // Find top habit and worst habit for insights
  const insights = useMemo(() => {
    if (habitBreakdown.length === 0) {
      return {
        topHabit: null,
        worstHabit: null,
      }
    }

    const sortedByRate = [...habitBreakdown].sort((a, b) => b.rate - a.rate)
    const topHabit = sortedByRate[0]
    const worstHabit = sortedByRate[sortedByRate.length - 1]

    return {
      topHabit,
      worstHabit,
    }
  }, [habitBreakdown])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-linear-to-b from-muted/50 to-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-muted/80">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-6 text-primary" />
                <span className="font-bold text-xl">Statistics</span>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando estadísticas...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-linear-to-b from-muted/50 to-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-muted/80">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-6 text-primary" />
                <span className="font-bold text-xl">Statistics</span>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">Error al cargar estadísticas. Por favor, intenta de nuevo.</p>
          </div>
        </main>
      </div>
    )
  }

  // Empty state
  if (habits.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-linear-to-b from-muted/50 to-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-muted/80">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-6 text-primary" />
                <span className="font-bold text-xl">Statistics</span>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No tienes hábitos aún. Crea uno para ver tus estadísticas.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-muted/50 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-muted/80">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-6 text-primary" />
              <span className="font-bold text-xl">
                Statistics
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Overview Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Streak</CardTitle>
              <div className="rounded-full bg-orange-500/10 p-2">
                <Flame className="size-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.bestStreak} days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Completion</CardTitle>
              <div className="rounded-full bg-blue-500/10 p-2">
                <Target className="size-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.avgCompletionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Habits</CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <CalendarIcon className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.activeHabits}</div>
              <p className="text-xs text-muted-foreground mt-1">Being tracked</p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Days</CardTitle>
              <div className="rounded-full bg-purple-500/10 p-2">
                <Award className="size-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.totalDays}</div>
              <p className="text-xs text-muted-foreground mt-1">Days tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Habit Breakdown */}
        <Card className="overflow-hidden shadow-sm border-muted/40">
          <CardHeader className="bg-muted/10">
            <CardTitle>Habit Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {habitBreakdown.map((habit) => (
              <div key={habit.id} className="group space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${habit.color} shadow-[0_0_10px] ${habit.shadow}`} />
                    <span className="font-semibold tracking-tight">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Flame className="size-3.5 text-orange-500/80" />
                      <span>{habit.streak} days</span>
                    </div>
                    <span className="font-bold tabular-nums">{habit.rate}%</span>
                  </div>
                </div>
                <Progress 
                  value={habit.rate} 
                  className="h-2.5 bg-muted/50" 
                  indicatorClassName={`${habit.color} transition-all duration-500`} 
                />
                <div className="flex justify-between text-xs font-medium text-muted-foreground/70">
                  <span>{habit.completedDays} of {habit.total} days</span>
                  <span>Last 30 days</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/10 bg-linear-to-br from-primary/10 to-transparent p-4">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-primary">
              <CheckCircle2 className="size-4" /> Performance
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Completaste tus hábitos el <span className="text-foreground font-semibold">{stats.avgCompletionRate}%</span> del tiempo.
            </p>
          </div>

          {insights.topHabit && (
            <div className="rounded-xl border border-blue-500/10 bg-linear-to-br from-blue-500/10 to-transparent p-4">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <Award className="size-4" /> Top Habit
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{insights.topHabit.name}" es tu hábito más sólido este mes con un <span className="text-foreground font-semibold">{insights.topHabit.rate}%</span>.
              </p>
            </div>
          )}

          {insights.worstHabit && insights.worstHabit.rate < 50 && (
            <div className="rounded-xl border border-orange-500/10 bg-linear-to-br from-orange-500/10 to-transparent p-4">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
                <AlertCircle className="size-4" /> Focus
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{insights.worstHabit.name}" necesita atención. Intenta mañana a primera hora.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}