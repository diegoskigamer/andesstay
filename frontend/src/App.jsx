import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { MsalSessionProvider } from "./auth/MsalSessionProvider";
import { AUTH_MODE, isMsalConfigured } from "./auth/msalConfig";
import { ROLES } from "./context/SessionContext";
import NavBar from "./components/NavBar";
import RoleGate from "./components/RoleGate";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Catalog from "./pages/Catalog";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";

// -----------------------------------------------------------------------
// MODO DE AUTENTICACIÓN
//
// Se decide con VITE_AUTH_MODE en frontend/.env:
//   - "simulated" (o vacío): selector de rol manual, sin login real.
//   - "msal": login real con Azure AD (App Registration "BarrioDigital").
//     Requiere también VITE_AZURE_CLIENT_ID y VITE_AZURE_TENANT_ID.
//
// Si VITE_AUTH_MODE=msal pero faltan esas variables, se cae de vuelta a
// modo simulado automáticamente para no dejar la app rota.
// -----------------------------------------------------------------------
const useMsal = AUTH_MODE === "msal" && isMsalConfigured;
const SessionProvider = useMsal ? MsalSessionProvider : RoleProvider;

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {useMsal && <Route path="/login" element={<Login />} />}
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