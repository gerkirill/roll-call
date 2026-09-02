import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import HomePage from '@/pages/HomePage';
import RosterPage from '@/pages/RosterPage';
import RollCallPage from '@/pages/RollCallPage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import FeaturesPage from '@/pages/FeaturesPage';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/roster" component={RosterPage} />
      <Route path="/roll-call/:id" component={RollCallPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/history/:id" component={HistoryPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
