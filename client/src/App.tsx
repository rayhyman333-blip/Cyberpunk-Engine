// Inside src/App.tsx
import { PremiumRoute } from "./lib/premium-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      
      {/* Publicly accessible but requires login */}
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      
      {/* PREMIUM ONLY: Requires 'active: true' in DB */}
      <PremiumRoute path="/dashboard" component={Dashboard} />
      <PremiumRoute path="/campaigns" component={Campaigns} />
      <PremiumRoute path="/deposit" component={Deposit} />
      
      {/* ADMIN ONLY */}
      <ProtectedRoute path="/payouts" component={Payouts} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

