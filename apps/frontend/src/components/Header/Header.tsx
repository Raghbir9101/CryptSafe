import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, Plus, LogOut, LogIn, Database, Home, Info, Mail } from "lucide-react";
import { isAuthenticated, logout } from "../Services/AuthService";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    navigate("/login");
    logout();
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-900/5"
          : "bg-white border-b border-gray-100"
        }`}
    >
      {/* Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            className="group flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-300 group-hover:scale-110 transform" />
              <div className="absolute inset-0 h-8 w-8 text-blue-600 opacity-20 group-hover:opacity-40 animate-pulse"></div>
            </div>
            <span className="font-black tracking-tight">CryptSafe</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Main Navigation */}
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group ${location.pathname === item.path
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/50"
                    }`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {location.pathname === item.path && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                  )}
                </Button>
              ))}

              {isAuthenticated.value && (
                <Button
                  variant="ghost"
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group ${location.pathname === "/tables"
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/50"
                    }`}
                  onClick={() => navigate("/tables")}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Tables
                  {location.pathname === "/tables" && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                  )}
                </Button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated.value && (
                <Button
                  variant="outline"
                  className="cursor-pointer relative px-4 py-2 text-sm font-medium text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-full group overflow-hidden"
                  onClick={() => navigate("/tables/create")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus className="h-4 w-4 mr-0 relative z-10" />
                  <span className="relative z-10">Add Table</span>
                </Button>
              )}

              <Button
                variant={isAuthenticated.value ? "ghost" : "default"}
                className={`cursor-pointer relative px-6 py-2 text-sm font-medium transition-all duration-300 rounded-full group overflow-hidden ${isAuthenticated.value
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                onClick={isAuthenticated.value ? handleLogout : () => navigate("/login")}
              >
                {!isAuthenticated.value && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                {isAuthenticated.value ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10">Log In</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-300 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-xl animate-slide-down">
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${location.pathname === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}

              {isAuthenticated.value && (
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${location.pathname === "/tables"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    }`}
                  onClick={() => {
                    navigate("/tables");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Database className="h-4 w-4 mr-3" />
                  Tables
                </Button>
              )}

              {isAuthenticated.value && (
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-all duration-300 rounded-xl"
                  onClick={() => {
                    navigate("/tables/create");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Add Table
                </Button>
              )}

              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${isAuthenticated.value
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "text-blue-700 hover:bg-blue-50"
                  }`}
                onClick={() => {
                  if (isAuthenticated.value) {
                    handleLogout();
                  } else {
                    navigate("/login");
                  }
                  setIsMobileMenuOpen(false);
                }}
              >
                {isAuthenticated.value ? (
                  <>
                    <LogOut className="h-4 w-4 mr-3" />
                    Log Out
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-3" />
                    Log In
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}