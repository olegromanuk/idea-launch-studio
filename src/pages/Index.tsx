import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/AuthButton";
import { 
  Play,
  X,
  Check,
  Focus,
  GitBranch,
  Map,
  Terminal,
  Rocket,
  BadgeCheck
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 antialiased selection:bg-primary/30 selection:text-white">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 px-4">
          <nav className="glass-nav flex items-center justify-between w-full max-w-[1100px] px-6 py-2.5 rounded-sm shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="size-7 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"/>
                </svg>
              </div>
              <span className="text-lg font-mono font-bold tracking-tighter text-white uppercase">Logomir</span>
            </div>
            <div className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-widest uppercase">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#methodology">Methodology</a>
            </div>
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </nav>
        </header>

        <main className="relative flex flex-1 flex-col items-center">
          
          {/* Hero Section */}
          <section className="relative w-full flex flex-col items-center justify-center pt-32 pb-12 px-4 overflow-hidden">
            <div className="absolute inset-0 blueprint-bg opacity-30 pointer-events-none" />
            <div className="relative z-10 w-full max-w-[1000px] text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                FOR ENTREPRENEURS AND SOLO FOUNDERS
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[0.95] uppercase">
                Build the right product.<br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">Launch it without chaos.</span>
              </h1>
              
              <h2 className="text-lg md:text-xl font-mono font-bold text-primary mb-6 tracking-tight cyan-glow leading-snug max-w-4xl mx-auto uppercase">
                Logomir is an AI Product Operating System that takes you from idea → MVP → launch — in one continuous flow.
              </h2>
              
              <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                Define a clear MVP scope, product logic, and launch plan before writing code or spending money.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 mb-16">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild className="group px-8 py-4 bg-primary text-primary-foreground font-bold text-sm font-mono uppercase tracking-widest hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all">
                    <Link to="/onboarding">
                      START WITH YOUR IDEA
                    </Link>
                  </Button>
                  <Button variant="outline" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                    View Methodology
                  </Button>
                </div>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-2">
                  No setup. No templates. No unfinished MVPs.
                </p>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="mt-8 w-full max-w-[1100px] relative px-4">
              <div className="blueprint-card p-1 shadow-2xl overflow-hidden">
                <div className="w-full aspect-[21/9] bg-slate-900/80 rounded-sm flex items-center justify-center relative group overflow-hidden">
                  <div className="absolute inset-0 blueprint-bg opacity-20" />
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
                  <div className="absolute inset-0 border border-primary/20" />
                  <Play className="h-16 w-16 text-primary opacity-60 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section className="relative w-full py-20 px-6 bg-[#05070a]">
            <div className="horizontal-divider" />
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 items-center">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 border-t border-l border-primary/20 opacity-50" />
                <span className="font-mono text-primary text-xs uppercase tracking-[0.5em] mb-4 block">Problem ID: 01</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                  Most MVPs<br/>don't fail.<br/>They get stuck.
                </h2>
              </div>
              <div className="relative">
                <div className="blueprint-card p-8 md:p-10 border-l-2 border-l-primary/50">
                  <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                    Solo founders move fast. They design, build, and prototype quickly. But without a clear product decision layer, projects stall halfway:
                  </p>
                  <ul className="space-y-4 mb-8 font-mono text-sm text-slate-300 uppercase tracking-wide">
                    <li className="flex items-center gap-4">
                      <X className="h-4 w-4 text-primary/70" />
                      unclear MVP scope
                    </li>
                    <li className="flex items-center gap-4">
                      <X className="h-4 w-4 text-primary/70" />
                      endless revisions
                    </li>
                    <li className="flex items-center gap-4">
                      <X className="h-4 w-4 text-primary/70" />
                      tools that don't connect
                    </li>
                    <li className="flex items-center gap-4">
                      <X className="h-4 w-4 text-primary/70" />
                      launches that never happen
                    </li>
                  </ul>
                  <div className="border-t border-white/10 pt-6 mt-2">
                    <p className="text-primary font-mono text-xs uppercase tracking-widest font-bold">
                      Speed without direction turns effort into waste.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="horizontal-divider mt-16" />
          </section>

          {/* Decision Layer Section */}
          <section className="relative w-full py-32 px-6 bg-[#05070a] overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 blueprint-bg opacity-20 pointer-events-none" />
            <div className="relative z-10 w-full max-w-[1000px] text-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-none uppercase">
                What's missing is not speed.<br/>
                It's a decision layer.
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-10 max-w-3xl mx-auto">
                Logomir is the operating system that sits between ideas and execution.
              </p>
              <p className="text-primary font-mono text-sm md:text-base uppercase tracking-[0.2em] font-bold cyan-glow">
                This is where products stop getting stuck.
              </p>
            </div>
          </section>

          {/* Flow Section */}
          <section id="methodology" className="relative w-full py-16 px-6 bg-[#07090d]">
            <div className="max-w-[1100px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-white/5 pb-8">
                <div>
                  <span className="font-mono text-primary text-[10px] uppercase tracking-widest mb-2 block">System.Process</span>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase">How it works — from idea to launch</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_01</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">Idea <span className="text-primary">→</span> Decision</h4>
                  <p className="text-slate-500 text-xs">Turn a raw idea into a clear product decision.</p>
                </div>
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_02</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">Decision <span className="text-primary">→</span> MVP</h4>
                  <p className="text-slate-500 text-xs">Define the smallest product worth building.</p>
                </div>
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_03</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">MVP <span className="text-primary">→</span> Build</h4>
                  <p className="text-slate-500 text-xs">Translate logic into a build-ready plan and setup.</p>
                </div>
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_04</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">Build <span className="text-primary">→</span> Launch</h4>
                  <p className="text-slate-500 text-xs">Prepare and execute a focused go-to-market launch.</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-primary/80 font-mono text-xs uppercase tracking-widest font-medium">One continuous flow, no handoffs between tools.</p>
              </div>
            </div>
          </section>

          {/* Deliverables Section */}
          <section id="features" className="relative w-full py-20 px-6 overflow-hidden bg-[#05070a] border-t border-white/5">
            <div className="absolute inset-0 blueprint-bg opacity-10 pointer-events-none" />
            <div className="max-w-[1100px] mx-auto flex flex-col items-center relative z-10">
              <div className="text-center mb-16 max-w-3xl">
                <span className="font-mono text-primary text-[10px] uppercase tracking-widest px-2 py-1 border border-primary/30 inline-block mb-6">Module: 02_Deliverables</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 uppercase">What you get by the end</h2>
                <p className="text-lg text-slate-400 font-light leading-relaxed">
                  By the time you finish Logomir, you don't just have clarity. You have everything needed to build and launch.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 w-full">
                <div className="blueprint-card p-8 group hover:border-primary/40 transition-colors flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
                  <Focus className="text-primary h-8 w-8 mb-5 group-hover:scale-110 transition-transform" />
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-tight">A clear MVP scope</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">What to build and what to skip.</p>
                </div>
                <div className="blueprint-card p-8 group hover:border-primary/40 transition-colors flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
                  <GitBranch className="text-primary h-8 w-8 mb-5 group-hover:scale-110 transition-transform" />
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-tight">Product logic</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">User flow and logic definitions.</p>
                </div>
                <div className="blueprint-card p-8 group hover:border-primary/40 transition-colors flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
                  <Map className="text-primary h-8 w-8 mb-5 group-hover:scale-110 transition-transform" />
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-tight">Build-ready roadmap</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Task breakdown and execution plan.</p>
                </div>
                <div className="blueprint-card p-8 group hover:border-primary/40 transition-colors flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
                  <Terminal className="text-primary h-8 w-8 mb-5 group-hover:scale-110 transition-transform" />
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-tight">Technical direction</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Technical choices and tooling setup.</p>
                </div>
                <div className="blueprint-card p-8 group hover:border-primary/40 transition-colors flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
                  <Rocket className="text-primary h-8 w-8 mb-5 group-hover:scale-110 transition-transform" />
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-tight">Launch checklist</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Initial go-to-market plan.</p>
                </div>
                <div className="blueprint-card p-8 group hover:border-primary/40 transition-colors flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
                  <BadgeCheck className="text-primary h-8 w-8 mb-5 group-hover:scale-110 transition-transform" />
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-tight">LAUNCH-READY PRODUCT</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Product setup reviewed, validated, and optimized with professional support before launch.</p>
                </div>
              </div>
              <div className="mt-16 text-center max-w-2xl">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-6" />
                <p className="text-white font-mono text-sm uppercase tracking-widest font-bold leading-relaxed">
                  ALL DESIGNED TO REDUCE REWORK, SHORTEN BUILD TIME, <br className="hidden md:block" />AND SHIP A PRODUCT THAT'S ACTUALLY READY.
                </p>
              </div>
            </div>
          </section>

          {/* Execution Support Section */}
          <section className="relative w-full py-20 px-6 bg-[#05070a] border-t border-white/5 overflow-hidden">
            <div className="absolute inset-0 blueprint-bg opacity-10 pointer-events-none" />
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 border-t border-l border-primary/20 opacity-50" />
                <span className="font-mono text-primary text-[10px] uppercase tracking-widest px-2 py-1 border border-primary/30 inline-block mb-4">Module: Execution_Support</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase leading-[0.95]">
                  From MVP to market<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">— without getting stuck</span>
                </h2>
              </div>
              <div className="relative">
                <div className="blueprint-card p-8 md:p-10 border-l-2 border-l-primary/50">
                  <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                    Many founders can design an MVP, but get stuck when it's time to finish, configure, and launch. Logomir is built to carry the product through the final steps.
                  </p>
                  <ul className="space-y-4 mb-8 font-mono text-sm text-slate-300 uppercase tracking-wide">
                    <li className="flex items-start gap-4">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Guidance to complete MVP setup and configuration</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Help connecting product logic with tools and implementation</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Support resolving blockers and edge cases</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Go-to-market preparation and launch support</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Marketing and distribution setup for first users</span>
                    </li>
                  </ul>
                  <div className="p-5 bg-primary/5 border border-primary/10 mb-8 rounded-sm">
                    <p className="text-slate-400 text-xs italic leading-relaxed">
                      "This is not outsourcing and not a generic agency. It's professional support embedded into the Logomir system, available when founders need help finishing the cycle."
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-primary font-mono text-xs uppercase tracking-widest font-bold">
                      One system. One flow. From idea to market.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Not For Section */}
          <section className="w-full bg-[#05070a] py-8 px-6 border-t border-white/5">
            <div className="max-w-[1100px] mx-auto text-center">
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                <span className="text-red-500">Not for template seekers.</span> <span className="text-primary">Built for founders demanding clarity.</span>
              </p>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="relative w-full py-28 px-6 bg-[#05070a] overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 blueprint-bg opacity-10 pointer-events-none" />
            <div className="max-w-[1200px] mx-auto relative z-10 text-center flex flex-col items-center">
              <div className="mb-10 text-center max-w-3xl">
                <p className="font-mono text-primary text-xs uppercase tracking-[0.4em] mb-6">Final.Module</p>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase cyan-glow leading-none mb-8">
                  Start with your idea.
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">
                  Turn it into a clear MVP plan and launch path.<br className="hidden md:block" />
                  No setup. No pressure. No unfinished projects.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Button asChild className="px-12 py-5 bg-primary text-primary-foreground font-mono font-black text-lg uppercase tracking-widest hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] transition-all">
                  <Link to="/onboarding">
                    START WITH YOUR IDEA
                  </Link>
                </Button>
                <p className="text-slate-600 font-mono text-[10px] tracking-widest uppercase mt-2">
                  Designed for solo founders and small teams.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 py-10 px-6 bg-[#05070a]/80">
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 opacity-60">
              <div className="size-6 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm font-mono font-bold uppercase tracking-tighter">Logomir</span>
            </div>
            <div className="flex gap-10 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <a className="hover:text-primary transition-colors" href="#">Privacy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms</a>
              <a className="hover:text-primary transition-colors" href="#">Contact</a>
            </div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">© 2024 Logomir OS. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
