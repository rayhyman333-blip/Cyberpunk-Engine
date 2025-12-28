import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { Loader2, Globe } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black text-white overflow-hidden">
      {/* Visual Side */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-40"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        {/* Animated Cyber Element */}
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary blur-2xl absolute -top-12 -left-12 animate-pulse"></div>
          
          <div className="relative">
            <h1 className="text-6xl font-bold tracking-tighter neon-text mb-4">
              GEO<span className="text-primary">ENGINE</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Advanced advertising infrastructure for the decentralized web. Target locally, scale globally.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <Globe className="w-8 h-8 text-primary mb-2" />
              <div className="font-bold">Global Reach</div>
              <div className="text-xs text-muted-foreground">Deploy anywhere instantly</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-8 h-8 mb-2 flex items-center justify-center font-mono text-secondary font-bold text-xl">{`<>`}</div>
              <div className="font-bold">API First</div>
              <div className="text-xs text-muted-foreground">Full programmatic control</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-black/95 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        
        <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">System Access</CardTitle>
            <CardDescription className="text-center">
              Authenticate to access your control panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="operator" {...field} className="bg-white/5 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-primary text-black font-bold hover:bg-primary/80" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Authenticate
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = (data: any) => {
    registerMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} className="bg-white/5 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create password" {...field} className="bg-white/5 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-secondary text-white font-bold hover:bg-secondary/80" 
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Identity
        </Button>
      </form>
    </Form>
  );
}
