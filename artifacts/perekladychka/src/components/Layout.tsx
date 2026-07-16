import { BottomNav } from "./BottomNav";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-16">
      <main className="flex-1 w-full max-w-md mx-auto relative flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
