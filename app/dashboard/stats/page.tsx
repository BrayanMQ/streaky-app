"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, ArrowLeft, TrendingUp, Target, CalendarIcon, Award, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { useHabits } from "@/hooks/useHabits"
import { useHabitLogs } from "@/hooks/useHabitLogs"
import { getCurrentStreak } from "@/lib/streaks"
import { getHabitColor } from "@/lib/habitColors"
import { motion } from "framer-motion"
import { BottomNav } from "@/components/layout/BottomNav"
import {
  getBestStreak,
  getAverageCompletionRate,
  getTotalDaysTracked,
  getCompletionRate,
  getCompletedDaysInRange,
  getDaysForPeriod,
  getPeriodLabel,
  type Period,
} from "@/lib/stats"

function StatInfo({ description }: { description: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen])

  return (
    <div 
      ref={containerRef}
      className="relative ml-1.5 inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        className="flex items-center text-muted-foreground/60 hover:text-muted-foreground transition-colors outline-none"
        aria-label="More information"
      >
        <Info className="size-3.5" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg border bg-popover p-2.5 text-xs font-normal text-popover-foreground shadow-xl animate-in fade-in zoom-in duration-200 z-50 pointer-events-auto">
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-popover" />
          {description}
        </div>
      )}
    </div>
  )
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const { habits, isLoading: isLoadingHabits, error: habitsError } = useHabits()
  const { logs: allLogs, isLoading: isLoadingLogs, error: logsError } = useHabitLogs()

  const isLoading = isLoadingHabits || isLoadingLogs
  const error = habitsError || logsError
  const periodDays = getDaysForPeriod(period)

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
    const avgCompletionRate = getAverageCompletionRate(habits, logsByHabitId, periodDays)
    const totalDays = getTotalDaysTracked(allLogs)

    return {
      bestStreak,
      avgCompletionRate,
      activeHabits: habits.length,
      totalDays,
    }
  }, [habits, logsByHabitId, allLogs, periodDays])

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
      const rate = getCompletionRate(habit.id, habitLogs, periodDays)
      const completedDays = getCompletedDaysInRange(habit.id, habitLogs, periodDays)
      const color = getHabitColor(habit, index)
      const shadow = getShadowFromColor(color)

      return {
        id: habit.id,
        name: habit.title,
        streak,
        total: periodDays,
        rate,
        completedDays,
        color,
        shadow,
      }
    })
  }, [habits, logsByHabitId, periodDays])

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

  // Get period text for insights
  const getPeriodText = (period: Period): string => {
    switch (period) {
      case 'week':
        return 'this week'
      case 'month':
        return 'this month'
      case 'year':
        return 'this year'
      default:
        return 'this month'
    }
  }

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
            <p className="text-muted-foreground">Loading statistics...</p>
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
            <p className="text-destructive">Error loading statistics. Please try again.</p>
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
            <p className="text-muted-foreground">You don't have any habits yet. Create one to see your statistics.</p>
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
      <main className="container mx-auto flex-1 px-4 py-8 pb-20 md:pb-8">
        {/* Period Selector */}
        <div className="mb-8 flex justify-end">
          <div className="relative flex w-full sm:w-auto p-1 bg-muted/80 backdrop-blur-sm rounded-xl border shadow-inner">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`relative z-10 flex-1 sm:flex-none px-6 py-2 text-sm font-medium capitalize transition-colors duration-200 ${
                  period === p 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                {/* Animated background indicator */}
                {period === p && (
                  <motion.div
                    layoutId="active-period"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20 whitespace-nowrap">
                  {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Best Streak
                <StatInfo description="The longest consecutive number of days you've completed at least one habit (all-time record)." />
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Avg Completion
                <StatInfo description={`The average percentage of your habits completed over the ${getPeriodLabel(period).toLowerCase()}.`} />
              </CardTitle>
              <div className="rounded-full bg-blue-500/10 p-2">
                <Target className="size-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.avgCompletionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel(period)}</p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Active Habits
                <StatInfo description="The total number of habits you are currently actively tracking." />
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Total Days
                <StatInfo description="The total number of unique days you have recorded any habit activity (all-time)." />
              </CardTitle>
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
                  <span>{getPeriodLabel(period)}</span>
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
              You completed your habits <span className="text-foreground font-semibold">{stats.avgCompletionRate}%</span> of the time {getPeriodText(period)}.
            </p>
          </div>

          {insights.topHabit && (
            <div className="rounded-xl border border-blue-500/10 bg-linear-to-br from-blue-500/10 to-transparent p-4">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <Award className="size-4" /> Top Habit
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{insights.topHabit.name}" is your strongest habit {getPeriodText(period)} with a <span className="text-foreground font-semibold">{insights.topHabit.rate}%</span> completion rate.
              </p>
            </div>
          )}

          {insights.worstHabit && insights.worstHabit.rate < 50 && (
            <div className="rounded-xl border border-orange-500/10 bg-linear-to-br from-orange-500/10 to-transparent p-4">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
                <AlertCircle className="size-4" /> Focus
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{insights.worstHabit.name}" needs attention {getPeriodText(period)}. Try tackling it first thing tomorrow.
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}