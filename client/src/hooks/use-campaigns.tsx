import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertCampaign } from "@shared/schema";

export function useCampaigns() {
  return useQuery({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.list.path);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return api.campaigns.list.responses[200].parse(await res.json());
    },
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: [api.campaigns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch campaign");
      return api.campaigns.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertCampaign) => {
      const res = await apiRequest(
        api.campaigns.create.method,
        api.campaigns.create.path,
        data
      );
      return api.campaigns.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({
        title: "Campaign Launched",
        description: "Targeting parameters accepted.",
        className: "border-primary/50 bg-black/90 text-primary",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Launch Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
