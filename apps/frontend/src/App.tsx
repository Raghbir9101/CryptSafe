import { useEffect } from "react";
import "./App.css";
import AllRoutes from "./components/Routes/Routes";
import { getUserAfterRefresh, isAuthenticated, logout } from "./components/Services/AuthService";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

function App() {
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUserAfterRefresh();
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
        <div className="w-[90%] flex h-16 items-center justify-between px-6 mx-auto">
          <NavLink to="/tables" className="text-xl font-bold tracking-wide">CryptSafe</NavLink>
          <div className="flex items-center gap-4">
            {isAuthenticated.value && <nav className="flex items-center gap-4">
              <Button className="cursor-pointer"
                variant={location.pathname === "/tables" ? "default" : "ghost"}
                onClick={() => nav("/tables")}
              >
                Tables
              </Button>
              <Button className="cursor-pointer"
                variant={location.pathname === "/users" ? "default" : "ghost"}
                onClick={() => nav("/users")}
              >
                Users
              </Button>
            </nav>}
            <div className="flex items-center gap-4">
              {isAuthenticated.value && <Button className="cursor-pointer" onClick={() => nav("/tables/create")}>
                Add
              </Button>}
               <Button className="cursor-pointer" variant={isAuthenticated.value ? "destructive" : "default"} onClick={() => {
                nav("/login");
                logout();
              }}
              >
                {isAuthenticated.value ? "Log Out" : "Log In"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="w-[95%] py-6 mx-auto">
        <AllRoutes />
      </main>
    </div>
  );
}

export default App;