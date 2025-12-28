import { Layout } from "@/components/layout";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

// Schema for the deposit form (frontend only fields included)
const depositSchema = z.object({
  amount: z.coerce.number().min(10, "Minimum deposit is $10.00"),
  cardNumber: z.string().min(16, "Invalid card number").max(19),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format MM/YY"),
  cvc: z.string().length(3, "Invalid CVC"),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export default function Deposit() {
  const depositMutation = useCreateTransaction();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 100, // $100.00
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });

  const onSubmit = (data: DepositFormValues) => {
    // In a real app, we'd tokenize the card here.
    // Since this is a demo, we just send the amount to the backend.
    // Convert dollars to cents
    const amountInCents = Math.round(data.amount * 100);
    
    depositMutation.mutate(
      { 
        amount: amountInCents,
        type: "deposit" 
      }, 
      {
        onSuccess: () => {
          form.reset({ amount: 100, cardNumber: "", expiry: "", cvc: "" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white neon-text">Add Funds</h2>
          <p className="text-muted-foreground">Securely deposit credits to fuel your campaigns.</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Details
              </CardTitle>
              <CardDescription>Enter your payment information below. All transactions are encrypted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input 
                              type="number" 
                              {...field} 
                              className="pl-8 bg-white/5 border-white/10 focus:border-primary text-lg" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0000 0000 0000 0000" 
                              {...field} 
                              className="bg-white/5 border-white/10 focus:border-primary font-mono" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MM/YY" 
                                {...field} 
                                className="bg-white/5 border-white/10 focus:border-primary font-mono" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123" 
                                {...field} 
                                type="password"
                                maxLength={3}
                                className="bg-white/5 border-white/10 focus:border-primary font-mono" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-black font-bold hover:bg-primary/80 h-12 text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay Securely
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    256-bit SSL Encrypted Payment
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
