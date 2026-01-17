import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, ArrowRight, Mail, Lock, Grid3X3 } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/projects");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = { email: "", password: "", confirmPassword: "", general: "" };
    let isValid = true;

    // Validate email
    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
      isValid = false;
    }

    // Validate password
    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
      isValid = false;
    }

    // Validate confirm password for signup
    if (activeTab === "signup" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({ email: "", password: "", confirmPassword: "", general: "" });

    try {
      if (activeTab === "signup") {
        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          if (error.message.includes("already registered")) {
            setErrors(prev => ({ ...prev, general: "This email is already registered. Please sign in instead." }));
          } else {
            setErrors(prev => ({ ...prev, general: error.message }));
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Logomir.",
          });
          navigate("/projects");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrors(prev => ({ ...prev, general: "Invalid email or password. Please try again." }));
          } else {
            setErrors(prev => ({ ...prev, general: error.message }));
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate("/projects");
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "An unexpected error occurred. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="blueprint-bg min-h-screen flex flex-col antialiased">
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30" style={{
        backgroundSize: '40px 40px',
        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
      }} />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0E14] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-6 flex justify-between items-center border-b border-[#2A303C] bg-[#0B0E14]/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <Grid3X3 className="w-6 h-6 text-[#00C2FF]" />
          <span className="font-bold tracking-tight text-lg uppercase text-white">Logomir</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-xs font-mono text-gray-400">
          <span>SYSTEM_STATUS: ONLINE</span>
          <span>VERSION: ALPHA 0.9</span>
        </div>
        <Link to="/" className="text-sm font-medium hover:text-[#00C2FF] transition-colors text-white">
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-stretch">
          
          {/* Form Panel */}
          <div className="bg-[#12161F] border border-[#2A303C] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00C2FF]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00C2FF]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00C2FF]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00C2FF]" />

            <div className="mb-8">
              <span className="text-xs font-mono text-[#00C2FF] mb-2 block tracking-wider">
                ● AUTHENTICATION_MODULE
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">
                {activeTab === "signin" ? "WELCOME BACK." : "JOIN THE SYSTEM."}
              </h1>
              <p className="text-gray-400 text-sm">
                {activeTab === "signin" 
                  ? "Resume building your architectural vision." 
                  : "Create your account to start building."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide" htmlFor="email">
                  User_Identifier // Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="architect@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-[#0B0E14] border-[#2A303C] text-white px-4 py-3 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF] outline-none transition-all placeholder-gray-600 font-mono text-sm h-auto ${errors.email ? "border-red-500" : ""}`}
                  />
                  <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-600" />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wide" htmlFor="password">
                    Access_Key // Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full bg-[#0B0E14] border-[#2A303C] text-white px-4 py-3 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF] outline-none transition-all placeholder-gray-600 font-mono text-sm h-auto ${errors.password ? "border-red-500" : ""}`}
                  />
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-600" />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{errors.password}</p>
                )}
              </div>

              {activeTab === "signup" && (
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide" htmlFor="confirmPassword">
                    Confirm_Access_Key // Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full bg-[#0B0E14] border-[#2A303C] text-white px-4 py-3 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF] outline-none transition-all placeholder-gray-600 font-mono text-sm h-auto ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-600" />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1 font-mono">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00C2FF] hover:bg-[#00A8DD] text-[#0B0E14] font-bold py-4 px-6 uppercase tracking-wider transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 15px rgba(0, 194, 255, 0.3)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{activeTab === "signup" ? "Creating Account..." : "Initiating Session..."}</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === "signup" ? "Create Account" : "Initiate Session"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                {activeTab === "signin" ? (
                  <>
                    New to the system?{" "}
                    <button 
                      onClick={() => setActiveTab("signup")} 
                      className="text-[#00C2FF] hover:text-white transition-colors font-bold uppercase"
                    >
                      Join Alpha
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("signin")} 
                      className="text-[#00C2FF] hover:text-white transition-colors font-bold uppercase"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Info Panel - Hidden on mobile */}
          <div className="hidden lg:flex flex-col justify-between bg-[#12161F]/50 backdrop-blur-md border border-[#2A303C] p-12 relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00C2FF]/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-xs font-mono mb-6">
                <span className="animate-pulse w-2 h-2 rounded-full bg-[#00C2FF]" />
                PRIVATE ALPHA ACCESS
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-6 text-white">
                "Speed without clarity is <span className="border-b-2 border-[#00C2FF]">wasted effort.</span>"
              </h2>
              <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
                <p>
                  Logomir is the AI Product Operating System for solo founders. We don't just generate code; we architect the vision first.
                </p>
                <div className="grid grid-cols-1 gap-4 mt-8">
                  <div className="flex items-start gap-3 p-4 border border-[#2A303C] bg-[#0B0E14]/50 hover:border-[#00C2FF]/50 transition-colors">
                    <Grid3X3 className="w-5 h-5 text-[#00C2FF] mt-0.5" />
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">Visual Blueprinting</h3>
                      <p className="text-xs text-gray-500">Map your entire product logic before a single line of code is written.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border border-[#2A303C] bg-[#0B0E14]/50 hover:border-[#00C2FF]/50 transition-colors">
                    <svg className="w-5 h-5 text-[#00C2FF] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">AI Logic Architect</h3>
                      <p className="text-xs text-gray-500">Our AI validates your assumptions and identifies potential friction points.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 pt-6 border-t border-[#2A303C]">
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00C2FF] to-blue-600 ring-2 ring-[#0B0E14]" />
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-[#0B0E14]" />
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 ring-2 ring-[#0B0E14]" />
                  <div className="h-8 w-8 rounded-full bg-[#2A303C] flex items-center justify-center text-xs text-white ring-2 ring-[#0B0E14] font-mono">+4k</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-mono">Founders Building</p>
                  <p className="text-[#00C2FF] font-bold text-sm">Now Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-[#2A303C] bg-[#0B0E14] text-center md:text-left">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
          <div>© 2024 LOGOMIR OS. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <a className="hover:text-[#00C2FF] transition-colors" href="#">PRIVACY_PROTOCOL</a>
            <a className="hover:text-[#00C2FF] transition-colors" href="#">TERMS_OF_SERVICE</a>
            <a className="hover:text-[#00C2FF] transition-colors" href="#">CONTACT_HQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
