import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCampaigns, useCreateCampaign } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import { Plus, Rocket, Globe, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampaignSchema, type InsertCampaign } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useCampaigns();
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCampaign();

  const form = useForm<InsertCampaign>({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      geoTarget: "Global",
      budget: 1000,
      status: "active",
    },
  });

  const onSubmit = (data: InsertCampaign) => {
    // Ensure budget is number
    createMutation.mutate(
      { ...data, budget: Number(data.budget) },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  const statusColors: Record<string, string> = {
    active: "bg-primary/20 text-primary border-primary/50",
    paused: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    completed: "bg-green-500/20 text-green-500 border-green-500/50",
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white neon-text">Campaigns</h2>
          <p className="text-muted-foreground">Manage and deploy your global reach.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/80 text-black font-bold">
              <Plus className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold neon-text">Deploy New Campaign</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Neo-Tokyo Promo Q4" {...field} className="bg-white/5 border-white/10 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="geoTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geo Target</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. North America, Global" {...field} className="bg-white/5 border-white/10 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Allocation (Cents)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="bg-white/5 border-white/10 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-black font-bold hover:bg-primary/80 mt-4"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Initializing..." : "Launch Campaign"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id} className="bg-black/40 border-white/10 hover:border-primary/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold text-white truncate pr-4">
                  {campaign.name}
                </CardTitle>
                <Badge variant="outline" className={`${statusColors[campaign.status]} capitalize`}>
                  {campaign.status}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4 text-secondary" />
                    Target: <span className="text-white ml-1">{campaign.geoTarget}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                    Budget: <span className="text-white ml-1">${(campaign.budget / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary group-hover:bg-primary/10">
                  <Rocket className="mr-2 h-4 w-4" /> Manage Details
                </Button>
              </CardFooter>
            </Card>
          ))}
          {campaigns?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-black/20 rounded-xl border border-dashed border-white/10">
              <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white">No active campaigns</h3>
              <p className="text-muted-foreground mt-1">Initiate your first campaign to begin operations.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
