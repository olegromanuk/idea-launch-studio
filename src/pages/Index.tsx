import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lightbulb, Target, Rocket } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";

const Index = () => {
  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      {/* Header with auth */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-end">
          <AuthButton />
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Product Studio
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Transform your product idea into a validated vision with our AI-powered canvas. 
            No signup required to start.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild className="gap-2 text-lg px-8">
              <Link to="/onboarding">
                Start Building
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl glass">
              <Lightbulb className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Define Your Vision</h3>
              <p className="text-sm text-muted-foreground">
                Clarify your product idea, target audience, and key problems to solve.
              </p>
            </div>
            <div className="p-6 rounded-xl glass">
              <Target className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Plan & Scope</h3>
              <p className="text-sm text-muted-foreground">
                Break down features, user stories, and technical requirements.
              </p>
            </div>
            <div className="p-6 rounded-xl glass">
              <Rocket className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Go-to-Market</h3>
              <p className="text-sm text-muted-foreground">
                Build your launch strategy, pricing, and growth plan.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
