import { useRoute, useLocation } from "wouter";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, Calendar } from "lucide-react";
import { useRoster } from "@/hooks/useRoster";
import { useRollCall } from "@/hooks/useRollCall";
import { STATUS_EMOJI, STATUS_LABELS, Status, StoredStatus } from "@/types";
import { cn } from "@/lib/utils";

function formatStatusTime(isoString: string) {
  const date = parseISO(isoString);
  const timeStr = format(date, "HH:mm", { locale: uk });
  if (isToday(date)) return `Сьогодні ${timeStr}`;
  if (isYesterday(date)) return `Вчора ${timeStr}`;
  return format(date, "dd.MM HH:mm");
}

export default function RollCallPage() {
  const [, params] = useRoute("/roll-call/:id");
  const [, setLocation] = useLocation();
  const { soldiers } = useRoster();
  const { sessions, previousSession, completeSession, setEntry, removeEntry } = useRollCall();

  const sessionId = params?.id;
  const currentSession = sessions.find(s => s.id === sessionId);

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p>Сесію не знайдено.</p>
        <button onClick={() => setLocation("/")} className="mt-4 text-primary underline">На головну</button>
      </div>
    );
  }

  const handleComplete = () => {
    if (confirm("Завершити перекличку?")) {
      completeSession(currentSession.id);
      setLocation("/");
    }
  };

  const entries = currentSession.entries;
  const markedIds = new Set(entries.map(e => e.soldierId));
  
  const unmarkedSoldiers = [...soldiers].filter(s => !markedIds.has(s.id)).sort((a, b) => a.lastName.localeCompare(b.lastName));
  const markedSoldiers = entries
    .map(e => ({ entry: e, soldier: soldiers.find(s => s.id === e.soldierId)! }))
    .filter(x => x.soldier)
    .sort((a, b) => new Date(b.entry.timestamp).getTime() - new Date(a.entry.timestamp).getTime());

  const getPreviousStatus = (soldierId: string): { status: StoredStatus, timestamp: string } | null => {
    if (!previousSession) return null;
    const entry = previousSession.entries.find(e => e.soldierId === soldierId);
    return entry || null;
  };

  const handleMark = (soldierId: string, status: Status) => {
    navigator.vibrate?.(30);
    
    let resolvedStatus: StoredStatus;
    if (status === 'same_as_last') {
      const prev = getPreviousStatus(soldierId);
      if (!prev) return; // Should not happen if button is hidden
      resolvedStatus = prev.status;
    } else {
      resolvedStatus = status as StoredStatus;
    }

    setEntry(currentSession.id, soldierId, resolvedStatus);
  };

  const countStatuses = (sessionEntries: typeof entries) => {
    const counts: Record<string, number> = {};
    sessionEntries.forEach(e => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  };

  const prevCounts = previousSession ? countStatuses(previousSession.entries) : null;
  const currCounts = countStatuses(currentSession.entries);

  const statusesOrder: StoredStatus[] = ['present', 'duty_company', 'duty_canteen', 'sick', 'absent'];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Fixed top bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="p-2 -ml-2 text-muted-foreground active-elevate rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-lg leading-tight">Перекличка</h1>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(parseISO(currentSession.startedAt), "d MMMM, HH:mm", { locale: uk })}
              </div>
            </div>
          </div>
          <button 
            onClick={handleComplete}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg active-elevate touch-manipulation"
          >
            Завершити
          </button>
        </div>
      </header>

      {/* Statistics panel */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 text-sm shadow-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center">
            <span className="w-20 text-muted-foreground font-medium text-xs uppercase tracking-wider">Попередня:</span>
            {prevCounts ? (
              <div className="flex gap-3 flex-wrap">
                {statusesOrder.map(s => prevCounts[s] ? (
                  <span key={s} className="flex items-center gap-1 opacity-70">
                    {STATUS_EMOJI[s]} <span className="font-medium">{prevCounts[s]}</span>
                  </span>
                ) : null)}
                {Object.keys(prevCounts).length === 0 && <span className="text-muted-foreground">—</span>}
              </div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="w-20 text-muted-foreground font-medium text-xs uppercase tracking-wider">Поточна:</span>
            <div className="flex gap-3 flex-wrap">
              {statusesOrder.map(s => currCounts[s] ? (
                <span key={s} className="flex items-center gap-1">
                  {STATUS_EMOJI[s]} <span className="font-bold">{currCounts[s]}</span>
                </span>
              ) : null)}
              {Object.keys(currCounts).length === 0 && <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] flex flex-col gap-6">
        
        {/* Не відмічені */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Не відмічені <span className="ml-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">{unmarkedSoldiers.length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {unmarkedSoldiers.map(soldier => {
                const prev = getPreviousStatus(soldier.id);
                const hasPrevStatus = !!prev;
                const canUseSameAsLast = hasPrevStatus && prev.status !== 'present';
                
                return (
                  <motion.div
                    key={soldier.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="bg-card border border-border rounded-2xl p-4 shadow-sm"
                  >
                    <div className="mb-4">
                      <div className="text-2xl font-display font-bold leading-tight">{soldier.lastName}</div>
                      <div className="text-muted-foreground text-sm font-medium">{soldier.firstName}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded-md text-xs font-medium border border-border/50">
                        <span className="text-muted-foreground">Минулий запис:</span>
                        {prev ? (
                          <span className="text-foreground">
                            {formatStatusTime(prev.timestamp)} — {STATUS_EMOJI[prev.status]} {STATUS_LABELS[prev.status]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Немає даних</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleMark(soldier.id, 'present')}
                        className="col-span-2 flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground font-bold rounded-xl active-elevate shadow-sm touch-manipulation"
                      >
                        {STATUS_EMOJI['present']} {STATUS_LABELS['present']}
                      </button>
                      
                      {canUseSameAsLast && (
                        <button
                          onClick={() => handleMark(soldier.id, 'same_as_last')}
                          className="col-span-2 flex items-center justify-center gap-2 h-12 bg-accent text-accent-foreground font-bold rounded-xl active-elevate shadow-sm touch-manipulation"
                        >
                          {STATUS_EMOJI['same_as_last']} Як минулого: {STATUS_EMOJI[prev!.status]}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleMark(soldier.id, 'duty_company')}
                        className="flex flex-col items-center justify-center h-16 bg-secondary text-secondary-foreground text-xs font-medium rounded-xl active-elevate touch-manipulation border border-border"
                      >
                        <span className="text-xl mb-0.5">{STATUS_EMOJI['duty_company']}</span>
                        <span className="truncate w-full text-center px-1">Наряд рота</span>
                      </button>
                      <button
                        onClick={() => handleMark(soldier.id, 'duty_canteen')}
                        className="flex flex-col items-center justify-center h-16 bg-secondary text-secondary-foreground text-xs font-medium rounded-xl active-elevate touch-manipulation border border-border"
                      >
                        <span className="text-xl mb-0.5">{STATUS_EMOJI['duty_canteen']}</span>
                        <span className="truncate w-full text-center px-1">Наряд їдальня</span>
                      </button>
                      <button
                        onClick={() => handleMark(soldier.id, 'sick')}
                        className="flex flex-col items-center justify-center h-16 bg-secondary text-secondary-foreground text-xs font-medium rounded-xl active-elevate touch-manipulation border border-border"
                      >
                        <span className="text-xl mb-0.5">{STATUS_EMOJI['sick']}</span>
                        <span className="truncate w-full text-center px-1">{STATUS_LABELS['sick']}</span>
                      </button>
                      <button
                        onClick={() => handleMark(soldier.id, 'absent')}
                        className="flex flex-col items-center justify-center h-16 bg-destructive/10 text-destructive text-xs font-medium rounded-xl active-elevate touch-manipulation border border-destructive/20"
                      >
                        <span className="text-xl mb-0.5">{STATUS_EMOJI['absent']}</span>
                        <span className="truncate w-full text-center px-1">{STATUS_LABELS['absent']}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {unmarkedSoldiers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center bg-card/50 rounded-2xl border-2 border-dashed border-border"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-semibold text-lg text-primary">Всіх відмічено!</div>
                  <div className="text-sm text-muted-foreground mt-1">Перевірте список нижче і завершіть перекличку.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Відмічені */}
        {markedSoldiers.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Відмічені <span className="ml-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{markedSoldiers.length}</span>
            </h2>
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {markedSoldiers.map(({ entry, soldier }) => (
                  <motion.div
                    key={entry.soldierId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-xl p-3 flex items-center justify-between shadow-sm active-elevate touch-manipulation"
                    onClick={() => {
                      if (confirm("Скинути відмітку?")) {
                        removeEntry(currentSession.id, soldier.id);
                      }
                    }}
                    role="button"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="font-bold truncate text-foreground text-[15px]">{soldier.lastName} {soldier.firstName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatStatusTime(entry.timestamp)}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 bg-secondary px-2.5 py-1.5 rounded-lg border border-border">
                      <span className="text-lg leading-none">{STATUS_EMOJI[entry.status]}</span>
                      <span className="text-sm font-medium text-foreground">{STATUS_LABELS[entry.status]}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
