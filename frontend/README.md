# AndesStay — Frontend (React + Vite)

Frontend del caso AndesStay. Cubre las pantallas: Dashboard, Reservas,
Catálogo, Reportería y Auditoría, según los roles Admin, Recepcionista
(Operador), Huésped (Cliente) y Auditor.

## Estado actual

- **Sin login real todavía.** El rol activo se simula desde un selector en
  la barra superior (`src/context/RoleContext.jsx`), guardado en
  `localStorage`. El control de acceso por pantalla (`RoleGate`) ya está
  implementado usando ese rol simulado.
- El cliente API (`src/api/client.js`) pega directo al backend Spring Boot.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # ajusta VITE_API_BASE_URL si es necesario
npm run dev
```

Por defecto espera el backend en `http://localhost:8080` (ver `../backend`).

## Cómo conectar MSAL / Azure AD más adelante

1. `npm install @azure/msal-browser @azure/msal-react`
2. Crear `src/auth/msalConfig.js` con `clientId`, `authority`
   (`https://login.microsoftonline.com/<TENANT_ID>/`) y `redirectUri`.
3. Envolver `<App />` en `main.jsx` con `<MsalProvider instance={msalInstance}>`.
4. Reemplazar `RoleContext` para leer el rol desde los claims del
   `access_token` (roles del App Registration "BarrioDigital") en vez del
   selector manual.
5. En `src/api/client.js`, agregar el header
   `Authorization: Bearer <access_token>` obtenido con
   `acquireTokenSilent`.
6. Agregar una ruta pública `/login` con el botón "Iniciar sesión con
   Microsoft" y un guard que redirija ahí si no hay sesión.

## Build de producción

```bash
npm run build
```
