import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Need to match the extended schema in routes
const createTransactionInput = z.object({
  amount: z.number(),
  type: z.enum(["deposit", "payout", "spend"]),
});

type CreateTransactionInput = z.infer<typeof createTransactionInput>;

export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTransaction() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const res = await apiRequest(
        api.transactions.create.method,
        api.transactions.create.path,
        data
      );
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.user.path] }); // Update balance
      toast({
        title: "Transaction Processed",
        description: "Credits transferred successfully.",
        className: "border-primary/50 bg-black/90 text-primary",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
