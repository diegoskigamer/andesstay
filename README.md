# AndesStay — Caso semestral

Plataforma de reservas para una red de hostales, cabañas y lodges.
Este repo trae **backend (Spring Boot)** y **frontend (React)**
funcionando end-to-end para los módulos core del caso, con el login
(MSAL + Azure AD) y la mensajería (RabbitMQ/Kafka) dejados listos para
conectar después, sin necesidad de reescribir la lógica de negocio.

## Estructura

```
andesstay/
├── backend/     Spring Boot (Java 17, Maven) — ver backend/README.md
└── frontend/    React + Vite               — ver frontend/README.md
```

## Cómo correr todo en local

Terminal 1:
```bash
cd backend
mvn spring-boot:run
```

Terminal 2:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`. Usa el selector de rol en la barra superior
para probar como Admin, Recepcionista, Huésped o Auditor (el login real
todavía no está implementado, a propósito).

## Qué quedó implementado

- Módulo de Reservas con la máquina de estados completa y sus reglas
  (no check-in sin confirmar, disponibilidad, etc.)
- Módulo de Catálogo (unidades, tarifas, disponibilidad)
- Módulo de Auditoría (timeline de eventos, solo lectura)
- Módulo de Reportería (KPIs: reservas por hora, tiempo de ciclo,
  ocupación activa, unidades más demandadas)
- Control de acceso por rol en el frontend (RoleGate), listo para
  conectarse a los claims reales de Azure AD
- Puntos de integración explícitos y comentados para: Spring Security +
  JWT de Azure AD, RabbitMQ (notificaciones), Kafka (auditoría/reportería
  en streaming)

## Qué falta (siguiente etapa)

- Login real con MSAL + Azure AD (frontend) y validación de JWT con
  Spring Security (backend)
- RabbitMQ para notificaciones asíncronas (colas + DLQ)
- Kafka para streaming de eventos de auditoría y reportería
- Separar el backend en los microservicios reales del caso
  (`ms-andesstay-reservations`, `ms-andesstay-catalog`, etc.) detrás de
  `ms-andesstay-bff` y AWS API Gateway
- Despliegue en AWS EC2 con Docker / Docker Compose
- Migrar de H2 a Oracle
