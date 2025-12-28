import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "accent";
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  color = "primary" 
}: StatCardProps) {
  const colorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  const bgMap = {
    primary: "from-primary/20 to-transparent",
    secondary: "from-secondary/20 to-transparent",
    accent: "from-accent/20 to-transparent",
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm overflow-hidden relative group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgMap[color]} blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:translate-y-[-2rem] transition-transform duration-500`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorMap[color]}`} />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
