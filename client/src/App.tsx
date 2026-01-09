import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import Deposit from "@/pages/deposit";
import Payouts from "@/pages/payouts";
// --- NEW IMPORT ADDED BELOW ---
import SubscribePage from "@/pages/Subscribe"; 

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      
      {/* --- NEW SUBSCRIPTION ROUTE ADDED BELOW --- */}
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      
      <ProtectedRoute path="/campaigns" component={Campaigns} />
      <ProtectedRoute path="/deposit" component={Deposit} />
      <ProtectedRoute path="/payouts" component={Payouts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

