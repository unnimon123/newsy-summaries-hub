
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  BellRing, 
  LayoutDashboard, 
  Menu, 
  Newspaper, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/news", label: "News Management", icon: Newspaper },
    { path: "/notifications", label: "Notifications", icon: BellRing },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

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
        <nav className="mt-6 px-2">
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
