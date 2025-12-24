'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs, useTodayLogs, useToggleHabitLog } from '@/hooks/useHabitLogs';
import { Loader2, CheckCircle2, XCircle, Calendar, Flame } from 'lucide-react';

/**
 * Test page for useHabitLogs hook
 * 
 * This page tests all the functionality of the useHabitLogs hook:
 * - useHabitLogs with different options
 * - useTodayLogs
 * - useToggleHabitLog
 * - Date range queries
 * - Optimistic updates
 */
export default function TestHabitLogsPage() {
  const { habits, isLoading: isLoadingHabits } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Test 1: useHabitLogs - all logs
  const { logs: allLogs, isLoading: isLoadingAllLogs } = useHabitLogs();

  // Test 2: useHabitLogs - specific habit
  const { logs: habitLogs, isLoading: isLoadingHabitLogs } = useHabitLogs({
    habitId: selectedHabitId || undefined,
  });

  // Test 3: useHabitLogs - date range
  const { logs: rangeLogs, isLoading: isLoadingRangeLogs } = useHabitLogs({
    habitId: selectedHabitId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Test 4: useTodayLogs - all habits
  const { logs: todayLogs, isLoading: isLoadingTodayLogs } = useTodayLogs();

  // Test 5: useTodayLogs - specific habit
  const { logs: todayHabitLogs, isLoading: isLoadingTodayHabitLogs } = useTodayLogs(
    selectedHabitId || undefined
  );

  // Test 6: useToggleHabitLog
  const { toggleCompletion, isToggling, toggleError } = useToggleHabitLog();

  const handleToggle = async (habitId: string, date?: string) => {
    try {
      await toggleCompletion({
        habitId,
        date,
        completed: undefined, // Will toggle
      });
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const handleSetCompleted = async (habitId: string, completed: boolean, date?: string) => {
    try {
      await toggleCompletion({
        habitId,
        date,
        completed,
      });
    } catch (error) {
      console.error('Set completed error:', error);
    }
  };

  if (isLoadingHabits) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading habits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Test useHabitLogs Hook</h1>
        <p className="text-muted-foreground">
          Esta página prueba todas las funcionalidades del hook useHabitLogs
        </p>
      </div>

      {/* Error Display */}
      {toggleError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Error:</span>
              <span>{toggleError.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selector de Hábito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="habit-select">Seleccionar hábito para pruebas:</Label>
            <select
              id="habit-select"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="w-full mt-2 p-2 border rounded-md"
            >
              <option value="">Todos los hábitos</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Fecha inicio (YYYY-MM-DD):</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="end-date">Fecha fin (YYYY-MM-DD):</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test 1: All Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Test 1: useHabitLogs() - Todos los logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAllLogs ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Total: {allLogs.length} logs
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="text-sm flex items-center gap-2">
                    {log.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>{log.date}</span>
                    <span className="text-muted-foreground">- Habit: {log.habit_id.slice(0, 8)}...</span>
                  </div>
                ))}
                {allLogs.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    ... y {allLogs.length - 10} más
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test 2: Specific Habit Logs */}
      {selectedHabitId && (
        <Card>
          <CardHeader>
            <CardTitle>Test 2: useHabitLogs({'{'} habitId {'}'}) - Logs de hábito específico</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHabitLogs ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total: {habitLogs.length} logs
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {habitLogs.map((log) => (
                    <div key={log.id} className="text-sm flex items-center gap-2">
                      {log.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span>{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test 3: Date Range */}
      {startDate && endDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Test 3: useHabitLogs({'{'} startDate, endDate {'}'}) - Rango de fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRangeLogs ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Rango: {startDate} a {endDate} - Total: {rangeLogs.length} logs
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {rangeLogs.map((log) => (
                    <div key={log.id} className="text-sm flex items-center gap-2">
                      {log.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span>{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test 4: Today Logs - All */}
      <Card>
        <CardHeader>
          <CardTitle>Test 4: useTodayLogs() - Logs de hoy (todos los hábitos)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTodayLogs ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Total: {todayLogs.length} logs de hoy
              </p>
              <div className="space-y-1">
                {todayLogs.map((log) => (
                  <div key={log.id} className="text-sm flex items-center gap-2">
                    {log.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Habit: {log.habit_id.slice(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test 5: Today Logs - Specific Habit */}
      {selectedHabitId && (
        <Card>
          <CardHeader>
            <CardTitle>Test 5: useTodayLogs(habitId) - Logs de hoy (hábito específico)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTodayHabitLogs ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total: {todayHabitLogs.length} logs de hoy
                </p>
                {todayHabitLogs.length > 0 ? (
                  <div className="space-y-1">
                    {todayHabitLogs.map((log) => (
                      <div key={log.id} className="text-sm flex items-center gap-2">
                        {log.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{log.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay logs para hoy</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test 6: Toggle Functionality */}
      {selectedHabitId && (
        <Card>
          <CardHeader>
            <CardTitle>Test 6: useToggleHabitLog() - Toggle completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Prueba las funciones de toggle. Los cambios se reflejan optimistamente.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleToggle(selectedHabitId)}
                  disabled={isToggling}
                  variant="default"
                >
                  {isToggling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Toggleando...
                    </>
                  ) : (
                    'Toggle Hoy (completado/no completado)'
                  )}
                </Button>
                <Button
                  onClick={() => handleSetCompleted(selectedHabitId, true)}
                  disabled={isToggling}
                  variant="outline"
                >
                  Marcar como Completado (Hoy)
                </Button>
                <Button
                  onClick={() => handleSetCompleted(selectedHabitId, false)}
                  disabled={isToggling}
                  variant="outline"
                >
                  Marcar como No Completado (Hoy)
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Label htmlFor="custom-date">Toggle fecha específica (YYYY-MM-DD):</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-date"
                  type="date"
                  className="flex-1"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleToggle(selectedHabitId, e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Test 1:</strong> Verifica que se carguen todos los logs de todos los hábitos
            </li>
            <li>
              <strong>Test 2:</strong> Selecciona un hábito y verifica que se carguen solo sus logs
            </li>
            <li>
              <strong>Test 3:</strong> Selecciona un rango de fechas y verifica que se filtren correctamente
            </li>
            <li>
              <strong>Test 4:</strong> Verifica que useTodayLogs() retorne solo los logs de hoy
            </li>
            <li>
              <strong>Test 5:</strong> Con un hábito seleccionado, verifica que useTodayLogs(habitId) funcione
            </li>
            <li>
              <strong>Test 6:</strong> Prueba el toggle y verifica:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Los cambios se reflejan inmediatamente (actualización optimista)</li>
                <li>El estado de carga se muestra correctamente</li>
                <li>Los errores se muestran si ocurren</li>
                <li>Puedes togglear fechas específicas</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

