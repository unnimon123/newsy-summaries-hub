
import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BellRing,
  LayoutDashboard,
  Menu,
  Newspaper,
  X,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, profile, signOut, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleSignOut = async () => {
    try {
      console.log("Signing out user");
      await signOut();
      // Navigation is handled in the signOut function
    } catch (error) {
      console.error("Error signing out:", error);
      // If signOut fails, try to force navigation
      navigate('/auth/login', { replace: true });
    }
  };

  // Define routes based on user role
  const commonRoutes = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/notifications", label: "Notifications", icon: BellRing },
  ];

  const adminRoutes = [
    { path: "/news", label: "News Management", icon: Newspaper },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  // Combine routes based on user role
  // Force debug output to help diagnose admin role issues
  console.log("Sidebar rendering with isAdmin:", isAdmin, "userRole:", userRole);

  const navItems = isAdmin
    ? [...commonRoutes, ...adminRoutes]
    : commonRoutes;

  return (
    <>
      <div className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden z-30",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <h1 className="text-xl font-bold text-blue-700">News Admin</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>

        <nav className="mt-6 px-2 flex flex-col justify-between h-[calc(100vh-4rem)] overflow-y-auto pb-4">
          <div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 my-1 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100",
                  collapsed && "justify-center"
                )}
              >
                <item.icon size={20} className={cn(collapsed ? "mx-0" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* User section at bottom */}
          <div className="mb-6">
            {!collapsed ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{profile?.username || user?.email}</p>
                    <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'User'}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full bg-blue-50">
                    <User size={20} className="text-blue-600" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="rounded-full bg-blue-50"
                >
                  <LogOut size={20} className="text-blue-600" />
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 rounded-full shadow-lg md:hidden z-50"
      >
        <Menu size={20} />
      </Button>
    </>
  );
};

export default Sidebar;
