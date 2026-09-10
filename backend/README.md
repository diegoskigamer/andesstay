# AndesStay — Backend (Spring Boot)

Implementa los módulos core del caso: Reservas, Catálogo, Auditoría y
Reportería, con las reglas de negocio del enunciado:

- No se puede hacer check-in sin haber CONFIRMADO la reserva antes.
- La disponibilidad de la unidad disminuye al confirmar y se libera al
  hacer checkout o cancelar una reserva confirmada.
- Cada cambio de estado queda registrado en el timeline de auditoría.
- KPIs de reportería: reservas por hora, tiempo de ciclo promedio,
  ocupación activa, unidades más demandadas.

## Estado actual (importante)

- **Seguridad DESHABILITADA por ahora** (a propósito, según lo acordado).
  No hay Spring Security ni validación de JWT todavía. Todos los
  endpoints están abiertos.
- **Sin RabbitMQ ni Kafka todavía.** `NotificationService` y el guardado
  de eventos de auditoría están implementados de forma síncrona/local,
  pero ya separados en sus propias clases con comentarios que indican
  exactamente qué exchange/routing key o topic les corresponde cuando se
  conecten.
- Usa base de datos **H2 en memoria** con datos de ejemplo (ver
  `config/DataSeeder.java`) para poder probar sin pasos manuales. En
  producción cada microservicio de dominio usa Oracle según el caso.
- Hoy es un solo servicio Spring Boot (monolito modular) con paquetes que
  reflejan los futuros microservicios (`reservations`, `catalog`,
  `audit`, `report`). Está pensado para poder separarse en
  `ms-andesstay-reservations`, `ms-andesstay-catalog`, etc. sin rehacer
  la lógica de negocio.

## Cómo correrlo

Requiere Java 17+ y Maven.

```bash
mvn spring-boot:run
```

El backend queda arriba en `http://localhost:8080`. Consola H2 disponible
en `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:andesstay`,
user `sa`, sin password).

## Endpoints principales

### Reservas — `/api/reservations`
- `POST /api/reservations` — crear reserva
- `GET /api/reservations/{id}`
- `PUT /api/reservations/{id}/status` — body: `{ "status": "CONFIRMADA", "actor": "nombre" }`
- `GET /api/reservations?status=&from=&to=`

### Catálogo — `/api/catalog`
- `GET /api/catalog/units`
- `POST /api/catalog/units`
- `PUT /api/catalog/units/{id}` — tarifa/disponibilidad

### Auditoría — `/api/audit` (solo lectura)
- `GET /api/audit?actor=`
- `GET /api/audit/reservations/{reservationId}`

### Reportería — `/api/report` (solo lectura)
- `GET /api/report/kpis?range=last24h|last7d|last30d`
- `GET /api/report/top-units?range=last7d`

## Próximos pasos (cuando se retome auth e infraestructura)

1. **Spring Security + Azure AD**: agregar
   `spring-boot-starter-oauth2-resource-server`, configurar
   `security.oauth2.resourceserver.jwt.issuer-uri` con el tenant de Azure,
   y anotar los endpoints con `@PreAuthorize` según rol (Admin, Operador,
   Cliente).
2. **RabbitMQ**: mover `NotificationService` a publicar en `cmd.direct` /
   `cmd.topic` según corresponda (email, housekeeping, voucher), con las
   6 colas + DLQ descritas en el caso.
3. **Kafka**: hacer que `AuditService` y `ReportService` consuman de
   `reservations.events` / `audit.timeline` en vez de escribir/leer
   directo de la base.
4. **Separar en microservicios reales** (`ms-andesstay-reservations`,
   `ms-andesstay-catalog`, `ms-andesstay-audit`, `ms-andesstay-report`,
   `ms-andesstay-notify`) detrás de `ms-andesstay-bff` y AWS API Gateway.
5. **Oracle** en vez de H2 para cada base de dominio.
