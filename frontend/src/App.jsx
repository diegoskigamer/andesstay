import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { CognitoSessionProvider } from "./auth/CognitoSessionProvider";
import { AUTH_MODE, isCognitoConfigured } from "./auth/cognitoConfig";
import { ROLES } from "./context/SessionContext";
import NavBar from "./components/NavBar";
import RoleGate from "./components/RoleGate";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import SimulatedLogin from "./pages/SimulatedLogin";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Catalog from "./pages/Catalog";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";

// -----------------------------------------------------------------------
// MODO DE AUTENTICACIÓN — VITE_AUTH_MODE en frontend/.env:
//   - "simulated" (default): pantalla de login simulada, sin Azure/Cognito.
//   - "cognito": login real, federado con Azure AD a través de Cognito.
// -----------------------------------------------------------------------
const useCognito = AUTH_MODE === "cognito" && isCognitoConfigured;
const SessionProvider = useCognito ? CognitoSessionProvider : RoleProvider;
const LoginScreen = useCognito ? Login : SimulatedLogin;

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          {useCognito && <Route path="/callback" element={<AuthCallback />} />}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <NavBar />
                <main className="page-container">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/reservations"
                      element={
                        <RoleGate allow={[ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.HUESPED]}>
                          <Reservations />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/catalog"
                      element={
                        <RoleGate allow={[ROLES.ADMIN, ROLES.RECEPCIONISTA]}>
                          <Catalog />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <RoleGate allow={[ROLES.ADMIN]}>
                          <Reports />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/audit"
                      element={
                        <RoleGate allow={[ROLES.ADMIN, ROLES.AUDITOR]}>
                          <Audit />
                        </RoleGate>
                      }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}