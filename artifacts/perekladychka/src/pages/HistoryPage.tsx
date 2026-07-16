import { useLocation, useRoute } from "wouter";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { uk } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useRollCall } from "@/hooks/useRollCall";
import { useRoster } from "@/hooks/useRoster";
import { STATUS_EMOJI, STATUS_LABELS, StoredStatus } from "@/types";

export default function HistoryPage() {
  const [, params] = useRoute("/history/:id");
  const [, setLocation] = useLocation();
  const { sessions } = useRollCall();
  const { soldiers } = useRoster();

  const sessionId = params?.id;
  
  if (sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      return (
        <Layout>
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <p>Запис не знайдено</p>
            <button onClick={() => setLocation("/history")} className="mt-4 text-primary underline">Повернутись</button>
          </div>
        </Layout>
      );
    }

    const duration = session.completedAt 
      ? differenceInMinutes(parseISO(session.completedAt), parseISO(session.startedAt))
      : 0;

    const markedMap = new Map(session.entries.map(e => [e.soldierId, e.status]));
    
    // Sort soldiers: marked ones first (grouped by status), then unmarked
    const sortedSoldiers = [...soldiers].sort((a, b) => {
      const aStatus = markedMap.get(a.id);
      const bStatus = markedMap.get(b.id);
      if (aStatus && !bStatus) return -1;
      if (!aStatus && bStatus) return 1;
      if (aStatus && bStatus && aStatus !== bStatus) return aStatus.localeCompare(bStatus);
      return a.lastName.localeCompare(b.lastName);
    });

    return (
      <div className="flex flex-col min-h-[100dvh] bg-background">
        <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
          <div className="flex items-center px-4 h-14 gap-3">
            <button onClick={() => setLocation("/history")} className="p-2 -ml-2 text-muted-foreground active-elevate rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-lg leading-tight">Журнал за {format(parseISO(session.startedAt), "d MMM", { locale: uk })}</h1>
              <div className="text-xs text-muted-foreground">
                {format(parseISO(session.startedAt), "HH:mm")} • Тривалість: {duration} хв
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 flex flex-col gap-3">
          {sortedSoldiers.map(soldier => {
            const status = markedMap.get(soldier.id);
            return (
              <div key={soldier.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground text-[15px]">{soldier.lastName} {soldier.firstName}</div>
                </div>
                {status ? (
                  <div className="shrink-0 flex items-center gap-1.5 bg-secondary px-2.5 py-1.5 rounded-lg border border-border">
                    <span className="text-lg leading-none">{STATUS_EMOJI[status as StoredStatus]}</span>
                    <span className="text-sm font-medium text-foreground">{STATUS_LABELS[status as StoredStatus]}</span>
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground">
                    <span className="text-sm font-medium">Не відмічено</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List view
  const completedSessions = sessions
    .filter(s => !!s.completedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
        <header className="py-2">
          <h1 className="text-2xl font-bold tracking-tight">Журнал перекличок</h1>
          <p className="text-muted-foreground text-sm">Історія всіх завершених сесій</p>
        </header>

        <div className="flex flex-col gap-3 pb-20">
          {completedSessions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card/50 border-2 border-dashed border-border rounded-2xl flex flex-col items-center">
              <Clock className="w-10 h-10 mb-3 opacity-50" />
              Жодної завершеної переклички.
            </div>
          ) : (
            completedSessions.map(session => {
              const present = session.entries.filter(e => e.status === 'present').length;
              const total = soldiers.length;
              
              return (
                <button
                  key={session.id}
                  onClick={() => setLocation(`/history/${session.id}`)}
                  className="flex flex-col p-4 bg-card border border-border rounded-xl active-elevate text-left touch-manipulation shadow-sm"
                >
                  <div className="flex justify-between items-start w-full mb-3">
                    <div>
                      <div className="font-bold text-lg text-foreground">
                        {format(parseISO(session.startedAt), "d MMMM yyyy", { locale: uk })}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{format(parseISO(session.startedAt), "HH:mm")}</span>
                        <span>•</span>
                        <span>
                          {session.completedAt 
                            ? `${differenceInMinutes(parseISO(session.completedAt), parseISO(session.startedAt))} хв`
                            : ''}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium border border-primary/20">
                      <Users className="w-4 h-4" />
                      {present} / {total} в строю
                    </span>
                    
                    <div className="flex gap-1 overflow-hidden">
                      {['duty_company', 'duty_canteen', 'sick', 'absent'].map(status => {
                        const count = session.entries.filter(e => e.status === status).length;
                        if (count === 0) return null;
                        return (
                          <span key={status} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-medium text-xs border border-border">
                            {STATUS_EMOJI[status as StoredStatus]} {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
