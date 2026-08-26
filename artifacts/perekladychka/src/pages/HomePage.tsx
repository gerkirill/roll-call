import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Users, Play, Clock, ChevronRight } from "lucide-react";
import { useRoster } from "@/hooks/useRoster";
import { useRollCall } from "@/hooks/useRollCall";
import { Layout } from "@/components/Layout";
import { useImportExport } from "@/hooks/useImportExport";
import testDataFixture from "@/data/testData.json";
import type { AppData } from "@/types";

const TEST_DATA_LATEST_SESSION_OFFSET_MS = 60 * 60 * 1000;

function buildTestData(now = Date.now()): AppData {
  const fixture = testDataFixture as AppData;
  const latestStartedAt = Math.max(...fixture.sessions.map(session => Date.parse(session.startedAt)));
  const shiftMs = now - TEST_DATA_LATEST_SESSION_OFFSET_MS - latestStartedAt;
  const shiftIso = (value: string) => new Date(Date.parse(value) + shiftMs).toISOString();

  return {
    soldiers: fixture.soldiers.map(soldier => ({
      ...soldier,
      updatedAt: soldier.updatedAt ? shiftIso(soldier.updatedAt) : undefined,
    })),
    sessions: fixture.sessions.map(session => ({
      ...session,
      startedAt: shiftIso(session.startedAt),
      completedAt: session.completedAt ? shiftIso(session.completedAt) : undefined,
    })),
  };
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { soldiers } = useRoster();
  const { currentSession, sessions, startSession } = useRollCall();
  const { importData } = useImportExport();

  const completedSessions = sessions
    .filter(s => !!s.completedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5);

  const handleStart = () => {
    const id = startSession();
    setLocation(`/roll-call/${id}`);
  };

  const handleContinue = () => {
    if (currentSession) {
      setLocation(`/roll-call/${currentSession.id}`);
    }
  };

  const handlePopulateTestData = async () => {
    const file = new File(
      [JSON.stringify(buildTestData())],
      'test-data.json',
      { type: 'application/json' },
    );
    await importData(file);
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-6">
        <header className="py-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Перекличка</h1>
          <p className="text-muted-foreground mt-1">Особовий склад навчальної роти</p>
        </header>

        {soldiers.length === 0 ? (
          <div className="flex-1 flex flex-col text-center p-6 border-2 border-dashed border-border rounded-2xl bg-card/50">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Немає військовослужбовців</h2>
              <p className="text-muted-foreground mb-6">Додайте особовий склад, щоб розпочати перекличку.</p>
              <button
                onClick={() => setLocation('/roster')}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl active-elevate transition-transform touch-manipulation shadow-sm"
              >
                Додати військовослужбовців
              </button>
            </div>
            <button
              type="button"
              onClick={() => { void handlePopulateTestData(); }}
              className="mt-6 self-center text-sm text-muted-foreground underline underline-offset-4 decoration-muted-foreground/50 active:text-foreground touch-manipulation"
            >
              наповнити тестовими даними
            </button>
          </div>
        ) : (
          <>
            <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              {currentSession ? (
                <div>
                  <div className="flex items-center gap-3 text-accent mb-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                    <span className="font-medium text-sm">Активна перекличка</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {currentSession.entries.length} / {soldiers.length}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-5">
                    Розпочато {format(parseISO(currentSession.startedAt), "HH:mm", { locale: uk })}
                  </p>
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent text-accent-foreground font-bold rounded-xl active-elevate transition-transform touch-manipulation shadow-sm"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Продовжити
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-2">Нова перекличка</h2>
                  <p className="text-muted-foreground text-sm mb-5">
                    Всього в строю: {soldiers.length} ос.
                  </p>
                  <button
                    onClick={handleStart}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-bold rounded-xl active-elevate transition-transform touch-manipulation shadow-sm"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Розпочати
                  </button>
                </div>
              )}
            </div>

            {completedSessions.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Останні переклички
                </h3>
                <div className="flex flex-col gap-2">
                  {completedSessions.map(session => {
                    const present = session.entries.filter(e => e.status === 'present').length;
                    return (
                      <button
                        key={session.id}
                        onClick={() => setLocation(`/history/${session.id}`)}
                        className="flex items-center justify-between p-4 bg-card border border-border rounded-xl active-elevate text-left touch-manipulation"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {format(parseISO(session.startedAt), "d MMMM, HH:mm", { locale: uk })}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Присутні: {present} з {soldiers.length}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}