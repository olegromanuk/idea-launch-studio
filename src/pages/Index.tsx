import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/AuthButton";
import { 
  Brain, 
  Users, 
  Building2, 
  Rocket, 
  Target, 
  Layers, 
  Play,
  ArrowRight,
  Check,
  X
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-slate-300 antialiased selection:bg-primary/30 selection:text-white">
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
              <a className="text-slate-400 hover:text-primary transition-colors" href="#philosophy">Philosophy</a>
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
                System: Private Alpha Active
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[0.95]">
                STOP BUILDING <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">IN CHAOS.</span>
              </h1>
              
              <h2 className="text-xl md:text-2xl font-mono font-bold text-primary mb-6 tracking-tight cyan-glow">
                BUILD WITH ARCHITECTURAL CLARITY.
              </h2>
              
              <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                The AI Product Operating System for solo founders and small teams to turn vision into a visual MVP roadmap.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button asChild className="group px-8 py-6 bg-primary text-primary-foreground font-bold text-sm font-mono uppercase tracking-widest hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all">
                  <Link to="/onboarding">
                    Start with your idea
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="px-8 py-6 bg-white/5 border border-white/10 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                  View Methodology
                </Button>
              </div>
              
              <div className="border-t border-primary/20 pt-8 inline-block">
                <p className="text-xl font-light italic text-white/70">
                  "We don't accelerate execution. <span className="text-primary font-bold not-italic border-b border-primary/30">We fix thinking first.</span>"
                </p>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="mt-16 w-full max-w-[1100px] relative px-4">
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
          <section className="relative w-full py-16 px-6 bg-background">
            <div className="horizontal-divider" />
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
              <div className="lg:col-span-5 relative">
                <div className="absolute -top-10 -left-10 w-24 h-24 border-t border-l border-primary/20 opacity-50" />
                <span className="font-mono text-primary text-xs uppercase tracking-[0.5em] mb-4 block">Problem ID: 01</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6 uppercase">
                  The real problem <br />isn't speed.
                </h2>
                <p className="text-xl text-slate-500 font-mono tracking-tighter uppercase italic">The problem is chaos.</p>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="blueprint-card p-6 glitch-bg">
                  <span className="font-mono text-[10px] text-primary mb-2 block tracking-widest">ABUNDANCE</span>
                  <p className="text-slate-400 text-sm">We have content AI that generates thousands of words in seconds.</p>
                </div>
                <div className="blueprint-card p-6">
                  <span className="font-mono text-[10px] text-primary mb-2 block tracking-widest">FRICTIONLESS</span>
                  <p className="text-slate-400 text-sm">We have interface builders that mock up high-fidelity screens in minutes.</p>
                </div>
                <div className="blueprint-card p-6">
                  <span className="font-mono text-[10px] text-primary mb-2 block tracking-widest">VELOCITY</span>
                  <p className="text-slate-400 text-sm">We have accelerators that push for rapid shipping and overnight growth.</p>
                </div>
                <div className="bg-primary/5 border border-primary/30 p-6 flex flex-col justify-center">
                  <p className="text-sm font-bold text-white uppercase tracking-tighter">Fast execution without clarity is accelerated guesswork.</p>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto text-center mt-20 pb-16">
              <p className="text-xl md:text-3xl font-extrabold text-white mb-4">But in the rush to move fast, we ignore the anchor:</p>
              <p className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tighter cyan-glow">
                What exactly should be built — and why?
              </p>
            </div>
            <div className="horizontal-divider" />
          </section>

          {/* Definition Section */}
          <section className="relative w-full py-16 px-6 bg-muted/20">
            <div className="max-w-[1100px] mx-auto text-center">
              <span className="font-mono text-primary text-[10px] uppercase tracking-[0.6em] mb-4 block">Definition.OS</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-10 uppercase">A new category is required.</h2>
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                <span className="px-4 py-1.5 border border-white/5 bg-white/5 font-mono text-sm text-white/30 line-through">Not a tool</span>
                <span className="px-4 py-1.5 border border-white/5 bg-white/5 font-mono text-sm text-white/30 line-through">Not a generator</span>
                <span className="px-4 py-1.5 border border-white/5 bg-white/5 font-mono text-sm text-white/30 line-through">Not an accelerator</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 max-w-5xl mx-auto overflow-hidden">
                <div className="p-12 text-left bg-background flex flex-col justify-center">
                  <p className="text-3xl md:text-4xl font-black tracking-tighter text-white leading-tight uppercase">
                    AI PRODUCT <br />OPERATING SYSTEM.
                  </p>
                  <div className="w-16 h-1.5 bg-primary mt-6" />
                </div>
                <div className="p-12 text-left bg-background/50 grid grid-cols-1 gap-8">
                  <div>
                    <h4 className="font-mono text-xs font-bold text-primary mb-2 uppercase tracking-widest">Core Philosophy</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Most AI tools focus on output. We focus on the inputs—the logic, user needs, and structural integrity of your vision before code.</p>
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-primary mb-2 uppercase tracking-widest">Strategic Framework</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Logomir acts as the central nervous system, connecting high-level strategy to granular execution in one visual canvas.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="relative w-full py-20 px-6 overflow-hidden">
            <div className="absolute inset-0 blueprint-bg opacity-10" />
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-primary text-[10px] uppercase tracking-widest px-2 py-1 border border-primary/30">Module: 02_Navigation</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 uppercase">What Logomir actually is.</h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl font-light">
                  Logomir is a <span className="text-white border-b border-primary/40">product navigation system</span> bridging the gap between raw ambition and functional architecture.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="blueprint-card p-5 group hover:border-primary/40 transition-colors">
                    <Brain className="text-primary h-5 w-5 mb-3" />
                    <h5 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Ideas to Hypotheses</h5>
                    <p className="text-slate-500 text-[11px]">Convert vague features into testable assumptions.</p>
                  </div>
                  <div className="blueprint-card p-5 group hover:border-primary/40 transition-colors">
                    <Users className="text-primary h-5 w-5 mb-3" />
                    <h5 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">User Problems</h5>
                    <p className="text-slate-500 text-[11px]">Map pain points and align every feature.</p>
                  </div>
                  <div className="blueprint-card p-5 group hover:border-primary/40 transition-colors">
                    <Building2 className="text-primary h-5 w-5 mb-3" />
                    <h5 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Define Right MVP</h5>
                    <p className="text-slate-500 text-[11px]">Strip bloat and identify essential core.</p>
                  </div>
                  <div className="blueprint-card p-5 group hover:border-primary/40 transition-colors">
                    <Layers className="text-primary h-5 w-5 mb-3" />
                    <h5 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Logic Before Code</h5>
                    <p className="text-slate-500 text-[11px]">Visual blueprint for development architecture.</p>
                  </div>
                  <div className="blueprint-card p-5 group hover:border-primary/40 transition-colors md:col-span-2">
                    <Rocket className="text-primary h-5 w-5 mb-3" />
                    <h5 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Launch with Intent</h5>
                    <p className="text-slate-500 text-[11px]">Move from canvas to market with a high-fidelity roadmap that works.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex">
                <div className="w-full blueprint-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-primary/5">
                  <div className="absolute inset-0 blueprint-bg opacity-20" />
                  <Target className="h-12 w-12 text-primary mb-6 animate-pulse" />
                  <p className="text-lg font-light text-white leading-relaxed relative z-10 italic">
                    "All happens inside a <span className="text-primary font-bold not-italic">visual canvas</span>, guided by AI agents that think like architects."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Flow Section */}
          <section id="methodology" className="relative w-full py-16 px-6 border-t border-white/5">
            <div className="max-w-[1100px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-white/5 pb-8">
                <div>
                  <span className="font-mono text-primary text-[10px] uppercase tracking-widest mb-2 block">System.Process</span>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase">The Flow.</h2>
                </div>
                <p className="text-slate-500 text-sm max-w-sm mt-4 md:mt-0 font-mono">From idea chaos to product clarity.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_01</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">Idea <span className="text-primary">→</span> Struct</h4>
                  <p className="text-slate-500 text-xs">Structured hypotheses to ground your vision.</p>
                </div>
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_02</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">Struct <span className="text-primary">→</span> Logic</h4>
                  <p className="text-slate-500 text-xs">Users, problems, and value in a cohesive map.</p>
                </div>
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_03</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">Logic <span className="text-primary">→</span> MVP</h4>
                  <p className="text-slate-500 text-xs">Building only the essential core of your product.</p>
                </div>
                <div className="blueprint-card p-6 flex flex-col items-start">
                  <div className="text-[10px] font-mono text-primary mb-4 border-b border-primary/20 w-full pb-1">STEP_04</div>
                  <h4 className="text-white font-bold text-sm mb-2 uppercase">MVP <span className="text-primary">→</span> Launch</h4>
                  <p className="text-slate-500 text-xs">Transition to high-intent market entry.</p>
                </div>
              </div>
              <div className="mt-8 bg-white/5 border border-white/10 p-4 text-center font-mono text-xs text-slate-400">
                "Every step is <span className="text-white uppercase font-bold tracking-widest">visual, intentional, and guided</span> by AI that explains <span className="italic text-primary">why</span>."
              </div>
            </div>
          </section>

          {/* Philosophy Section */}
          <section id="philosophy" className="relative w-full py-16 px-6 bg-background">
            <div className="max-w-[1100px] mx-auto">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter shrink-0">Philosophy.txt</h2>
                <div className="h-px w-full bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
                <div className="p-8 bg-background hover:bg-white/[0.02] transition-colors border-b md:border-b-0 md:border-r border-white/5">
                  <span className="font-mono text-primary text-xs mr-4">#01</span>
                  <p className="text-xl font-light text-slate-400 mt-2">Speed without clarity is <span className="text-white">wasted effort.</span></p>
                </div>
                <div className="p-8 bg-background hover:bg-white/[0.02] transition-colors border-b border-white/5">
                  <span className="font-mono text-primary text-xs mr-4">#02</span>
                  <p className="text-xl font-light text-slate-400 mt-2">Tools don't replace <span className="text-white">thinking.</span></p>
                </div>
                <div className="p-8 bg-background hover:bg-white/[0.02] transition-colors border-b md:border-b-0 md:border-r border-white/5">
                  <span className="font-mono text-primary text-xs mr-4">#03</span>
                  <p className="text-xl font-light text-slate-400 mt-2">MVP is a decision, not a <span className="text-white">feature list.</span></p>
                </div>
                <div className="p-8 bg-background hover:bg-white/[0.02] transition-colors border-b border-white/5">
                  <span className="font-mono text-primary text-xs mr-4">#04</span>
                  <p className="text-xl font-light text-slate-400 mt-2">Startup failure happens <span className="text-white">before code.</span></p>
                </div>
                <div className="p-8 bg-background hover:bg-white/[0.02] transition-colors md:col-span-2">
                  <span className="font-mono text-primary text-xs mr-4">#05</span>
                  <p className="text-xl font-light text-slate-400 mt-2">The earlier clarity appears, the <span className="text-white">cheaper mistakes become.</span></p>
                </div>
              </div>
              <div className="mt-16">
                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none cyan-glow">
                  Think clearly first. Build the right thing. <span className="text-primary/50">Then move fast.</span>
                </p>
              </div>
            </div>
          </section>

          {/* Persona Section */}
          <section className="relative w-full py-16 px-6 border-t border-white/10">
            <div className="max-w-[1100px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                  <span className="font-mono text-primary text-[10px] uppercase tracking-widest mb-4 block">Persona_Mapping</span>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">Who Logomir is for</h2>
                  <div className="space-y-6">
                    <div className="border-l border-primary/30 pl-4 py-1">
                      <span className="font-mono text-primary text-[10px] block mb-1">USER_01</span>
                      <h4 className="text-sm font-bold text-white uppercase">Visionaries</h4>
                      <p className="text-slate-500 text-xs">Architectural roadmap to stop second-guessing.</p>
                    </div>
                    <div className="border-l border-primary/30 pl-4 py-1">
                      <span className="font-mono text-primary text-[10px] block mb-1">USER_02</span>
                      <h4 className="text-sm font-bold text-white uppercase">Lean Units</h4>
                      <p className="text-slate-500 text-xs">Small teams who can't afford wasted development.</p>
                    </div>
                    <div className="border-l border-primary/30 pl-4 py-1">
                      <span className="font-mono text-primary text-[10px] block mb-1">USER_03</span>
                      <h4 className="text-sm font-bold text-white uppercase">Truth Seekers</h4>
                      <p className="text-slate-500 text-xs">Tired of AI noise without real logic.</p>
                    </div>
                    <div className="border-l border-primary/30 pl-4 py-1">
                      <span className="font-mono text-primary text-[10px] block mb-1">USER_04</span>
                      <h4 className="text-sm font-bold text-white uppercase">Architects</h4>
                      <p className="text-slate-500 text-xs">Focus on building the *right* thing first.</p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8 flex flex-col justify-end">
                  <div className="blueprint-card grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white/[0.01]">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
                      <div className="flex items-center gap-2 text-red-500/80 mb-6">
                        <X className="h-4 w-4" />
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest">FILTER_OUT</span>
                      </div>
                      <p className="text-xl font-bold text-white leading-tight uppercase">
                        If you're looking for <span className="text-slate-600">templates</span> or <span className="text-slate-600">hacks</span>, 
                        <span className="block mt-4 text-xs font-mono text-red-500 bg-red-500/5 border border-red-500/20 p-2 text-center uppercase">Logomir is not for you.</span>
                      </p>
                    </div>
                    <div className="p-8 bg-primary/5 flex flex-col">
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Check className="h-4 w-4" />
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest">IDEAL_FIT</span>
                      </div>
                      <p className="text-xl font-bold text-white leading-tight uppercase">
                        If you want <span className="text-primary">product clarity</span> — 
                        <Link to="/onboarding" className="block mt-4 text-xs font-mono text-primary underline decoration-primary/40 underline-offset-4 cursor-pointer hover:text-white transition-colors uppercase">WELCOME. JOIN ALPHA.</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="relative w-full py-28 px-6 bg-background overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 blueprint-bg opacity-10 pointer-events-none" />
            <div className="max-w-[1200px] mx-auto relative z-10 text-center flex flex-col items-center">
              <div className="mb-12 space-y-6">
                <p className="font-mono text-primary text-xs uppercase tracking-[0.4em] mb-4">Final.Module</p>
                <p className="text-xl md:text-2xl font-light tracking-tight text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  This is not another AI tool. This is the <span className="text-white font-bold">foundation layer</span> before design, development, and marketing.
                </p>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase cyan-glow leading-none">
                  WHERE <br />PRODUCTS BEGIN.
                </h2>
              </div>
              <div className="flex flex-col items-center gap-6">
                <Button asChild className="px-12 py-6 bg-primary text-primary-foreground font-mono font-black text-lg uppercase tracking-widest hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] transition-all">
                  <Link to="/onboarding">Start with your idea</Link>
                </Button>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-primary/30" />
                  <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase">
                    Private Alpha Access Available
                  </p>
                  <span className="h-px w-8 bg-primary/30" />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 py-10 px-6 bg-background/80">
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
