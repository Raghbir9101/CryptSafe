import { useEffect } from "react";
import "./App.css";
import AllRoutes from "./components/Routes/Routes";
import { getUserAfterRefresh } from "./components/Services/AuthService";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./components/Header/Header";

function App() {
  useEffect(() => {
    getUserAfterRefresh();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Toaster richColors />
      <Header />
      <main className="">
        <AllRoutes />
      </main>
    </div>
  );
}

export default App;