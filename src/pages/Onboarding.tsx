import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Rocket, Target, Users, Lightbulb } from "lucide-react";
import { IdeaSelector } from "@/components/onboarding/IdeaSelector";

const Onboarding = () => {
  const navigate = useNavigate();
  const [showIdeaSelector, setShowIdeaSelector] = useState(false);
  const [formData, setFormData] = useState({
    idea: "",
    audience: "",
    problem: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("productIdea", JSON.stringify(formData));
    navigate("/canvas");
  };

  const handleIdeaSelect = (idea: any) => {
    setFormData({
      idea: idea.title,
      audience: idea.audience,
      problem: idea.problem,
    });
    setShowIdeaSelector(false);
  };

  const isFormValid = formData.idea && formData.audience && formData.problem;

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-3xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Your AI Product Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your idea into a working product with our guided AI-powered canvas
          </p>
        </div>

        <Card className="p-8 glass hover-lift">
          {showIdeaSelector ? (
            <IdeaSelector
              onIdeaSelect={handleIdeaSelect}
              onCancel={() => setShowIdeaSelector(false)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Rocket className="w-4 h-4 text-primary" />
                  What's your product idea?
                </label>
                <Textarea
                  placeholder="e.g., A mobile app that helps freelancers track their time and generate invoices automatically..."
                  value={formData.idea}
                  onChange={(e) =>
                    setFormData({ ...formData, idea: e.target.value })
                  }
                  className="min-h-[100px] resize-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIdeaSelector(true)}
                  className="text-primary hover:text-primary/80"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Help me choose an idea
                </Button>
              </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Who is it for?
              </label>
              <Textarea
                placeholder="e.g., Solo freelancers and small creative agencies who struggle with invoicing..."
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="w-4 h-4 text-primary" />
                What problem does it solve?
              </label>
              <Textarea
                placeholder="e.g., They waste time on manual invoicing and often forget to track billable hours..."
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="flex-1 h-12 gradient-primary text-white font-semibold hover-glow"
                >
                  Start Building
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            No login required • Free to explore • AI-powered guidance
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
