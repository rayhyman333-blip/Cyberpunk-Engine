import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Layout } from "@/components/layout";
import { StatCard } from "@/components/stat-card";
import { Activity, CreditCard, MousePointer, Eye } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();

  const totalImpressions = analytics?.reduce((acc, curr) => acc + curr.impressions, 0) || 0;
  const totalClicks = analytics?.reduce((acc, curr) => acc + curr.clicks, 0) || 0;
  const totalSpend = analytics?.reduce((acc, curr) => acc + curr.spend, 0) || 0;
  
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;

  // Transform analytics data for chart
  const chartData = analytics?.map(item => ({
    date: new Date(item.date!).toLocaleDateString(),
    impressions: item.impressions,
    clicks: item.clicks
  })) || [];

  return (
    <Layout>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white neon-text">
          Mission Control
        </h2>
        <p className="text-muted-foreground">
          Real-time surveillance of your advertising operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Balance" 
          value={`$${((user?.balance || 0) / 100).toFixed(2)}`}
          icon={CreditCard}
          description="Available credits"
          color="primary"
        />
        <StatCard 
          title="Active Campaigns" 
          value={campaignsLoading ? "..." : activeCampaigns}
          icon={Activity}
          description="Currently running"
          color="secondary"
        />
        <StatCard 
          title="Total Impressions" 
          value={analyticsLoading ? "..." : totalImpressions.toLocaleString()}
          icon={Eye}
          description="Lifetime views"
          color="accent"
        />
        <StatCard 
          title="Total Clicks" 
          value={analyticsLoading ? "..." : totalClicks.toLocaleString()}
          icon={MousePointer}
          description="Engagement count"
          color="primary"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {analyticsLoading ? (
                <Skeleton className="w-full h-full bg-white/5 rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(190 100% 50%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(190 100% 50%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(280 100% 60%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(280 100% 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="impressions" 
                      stroke="hsl(190 100% 50%)" 
                      fillOpacity={1} 
                      fill="url(#colorImpressions)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="hsl(280 100% 60%)" 
                      fillOpacity={1} 
                      fill="url(#colorClicks)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {campaigns?.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Target: {campaign.geoTarget}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-primary">
                    ${(campaign.budget / 100).toFixed(2)}
                  </div>
                </div>
              ))}
              {(!campaigns || campaigns.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity detected.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
