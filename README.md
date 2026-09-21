# 🏔️ AndesStay - Sistema de Gestión de Reservas y Alojamientos

Bienvenido al repositorio oficial de **AndesStay**. Este proyecto consiste en una plataforma web integral diseñada para la gestión de reservas, administración de unidades turísticas/alojamientos, reportes y control de usuarios con autenticación segura.

---

## 🚀 Arquitectura y Tecnologías

El proyecto está estructurado en una arquitectura cliente-servidor (Frontend + Backend):

### Backend (`/backend`)
* **Lenguaje & Framework:** Java (Spring Boot)
* **Gestor de dependencias:** Apache Maven (`pom.xml`)
* **Seguridad y Autenticación:** Integración con AWS Cognito / Spring Security
* **Módulos Principales:**
  * **Reservas (`ReservationController`):** Gestión del ciclo de vida y estado de las reservas.
  * **Catálogo (`CatalogController`):** Administración de unidades y tipos de unidad.
  * **Reportes (`ReportController`):** Generación de datos estadísticos e informes.
  * **Auditoría (`AuditController`):** Registro de eventos y trazabilidad.

### Frontend (`/frontend`)
* **Framework / Librería:** React con Vite
* **Herramientas de Build:** Vite & Rollup
* **Autenticación UI:** Integración con MSAL / Azure AD / Cognito OAuth
* **Calidad de código:** Oxlint (`.oxlintrc.json`)

---

## 📁 Estructura del Proyecto

```text
andesstay-proyecto/
└── andesstay/
    ├── backend/
    │   ├── src/main/java/com/andesstay/
    │   │   ├── config/          # Seguridad, CORS, Seeder de datos
    │   │   ├── controller/      # Endpoints REST (Auth, Catalog, Reservations, Reports, Audit)
    │   │   ├── domain/          # Entidades principales (Unit, Reservation, AuditEvent, etc.)
    │   │   ├── dto/             # Objetos de transferencia de datos
    │   │   ├── exception/       # Manejo global de excepciones
    │   │   ├── repository/     # Repositorios JPA / Persistencia
    │   │   └── service/        # Lógica de negocio y notificaciones
    │   ├── src/main/resources/  # Configuraciones (application.yml)
    │   └── pom.xml
    └── frontend/
        ├── src/                 # Componentes, vistas y lógica de la UI
        ├── index.html
        ├── vite.config.js
        └── package.json
