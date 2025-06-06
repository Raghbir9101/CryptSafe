import { useEffect } from "react";
import "./App.css";
import AllRoutes from "./components/Routes/Routes";
import { Auth, getUserAfterRefresh } from "./components/Services/AuthService";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./components/Header/Header";
import InitialPasswordReset from "./components/Authorization/InitialPasswordReset";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

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

      <InitialPasswordReset 
        isOpen={Auth.value.showPasswordResetModal}
        onClose={() => {
          Auth.value.showPasswordResetModal = false;
          navigate('/dashboard');
        }}
        userId={Auth.value.passwordResetUserId || ''}
      />
    </div>
  );
}

export default App;