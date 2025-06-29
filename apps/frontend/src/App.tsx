import { useEffect } from "react";
import "./App.css";
import AllRoutes from "./components/Routes/Routes";
import { Auth, getUserAfterRefresh, checkAuthStatus, handleStorageChange } from "./components/Services/AuthService";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./components/Header/Header";
import InitialPasswordReset from "./components/Authorization/InitialPasswordReset";
import { useNavigate } from "react-router-dom";
import { enableDevToolsProtection } from "./Utils/devToolsBlocker";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    getUserAfterRefresh();
    
    // Enable comprehensive developer tools protection
    enableDevToolsProtection();
    
    // Add beforeunload event listener to clear auth token when tab is closed
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Clear the token when the user closes the tab
      sessionStorage.removeItem('token');
      
      // Optional: Show a confirmation dialog (not recommended for UX)
      // event.preventDefault();
      // event.returnValue = '';
    };

    // Add visibilitychange event listener to handle when user switches tabs and comes back
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User is leaving the page (switching tabs, minimizing, etc.)
        // We don't clear token here as they might come back
      } else if (document.visibilityState === 'visible') {
        // User is back on the page, check if token still exists
        checkAuthStatus();
      }
    };

    // Add periodic check to ensure token is still valid (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      const token = sessionStorage.getItem('token');
      if (!token && Auth.value.loggedInUser) {
        // Token was cleared but user is still logged in, log them out
        checkAuthStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listeners and interval
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
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
          navigate("/dashboard");
        }}
        userId={Auth.value.passwordResetUserId || ""}
      />
    </div>
  );
}

export default App;
