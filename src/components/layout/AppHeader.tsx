import { Link, useNavigate, useLocation } from "react-router-dom";
import { Grid3X3, Bell, LogOut, Shield, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  label: string;
  path?: string;
  onClick?: () => void;
  active?: boolean;
  adminOnly?: boolean;
}

interface AppHeaderProps {
  currentStep?: string;
  statusText?: string;
  showStepIndicator?: boolean;
}

export const AppHeader = ({ 
  currentStep,
  statusText = "System_Online",
  showStepIndicator = false 
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.rpc('is_admin_by_domain');
        if (!error && data) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems: NavItem[] = [
    { 
      label: "Projects", 
      path: "/projects",
      active: isActive("/projects")
    },
    { 
      label: "Admin", 
      path: "/admin-panel",
      active: isActive("/admin-panel"),
      adminOnly: true
    },
    { 
      label: "Submissions", 
      path: "/my-submissions",
      active: isActive("/my-submissions")
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#1f2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Grid3X3 className="w-6 h-6 text-[#00E0FF] group-hover:animate-pulse" />
            <span className="font-bold text-xl tracking-wider text-white font-mono">
              LOGOMIR<span className="text-[#00E0FF]">.OS</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              
              const isItemActive = item.active || 
                (item.path && location.pathname.startsWith(item.path));
              
              return (
                <button
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    isItemActive
                      ? "text-[#00E0FF] border-b-2 border-[#00E0FF] pb-0.5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.adminOnly && <Shield className="w-4 h-4" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            {showStepIndicator && currentStep && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#0F1115] rounded border border-[#1f2937]">
                <span className="w-2 h-2 rounded-full bg-[#00E0FF] animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase">{currentStep}</span>
              </div>
            )}

            {!showStepIndicator && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#0F1115] rounded border border-[#1f2937]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase">{statusText}</span>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#00E0FF] rounded-full animate-pulse" />
            </button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded bg-[#0F1115] border border-slate-700 flex items-center justify-center text-xs font-mono text-white hover:border-[#00E0FF]/50 transition-colors">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0F1115] border-[#1f2937]">
                  <DropdownMenuItem className="text-slate-300 text-xs font-mono">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/projects" className="flex items-center gap-2 text-slate-300 hover:text-white">
                      <FolderOpen className="w-4 h-4" />
                      My Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                to="/auth"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#00E0FF] text-black rounded hover:bg-cyan-400 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
