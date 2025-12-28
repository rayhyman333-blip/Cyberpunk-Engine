import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <Card className="w-full max-w-md mx-4 bg-black/50 border-destructive/50 backdrop-blur-lg">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-white">404 Error</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground mb-6">
            The requested resource could not be found in this sector.
          </p>
          
          <Link href="/">
            <Button className="w-full bg-white text-black hover:bg-white/90">
              Return to Base
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
