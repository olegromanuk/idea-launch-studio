import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Onboarding from "./pages/Onboarding";
import Canvas from "./pages/Canvas";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/onboarding/:projectId" element={<Onboarding />} />
            <Route path="/canvas" element={<Canvas />} />
            <Route path="/canvas/:projectId" element={<Canvas />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:projectId" element={<Dashboard />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/:projectId" element={<Board />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
