# LegalFlow 360
## Respuestas consolidadas del proceso de definición

---

# 1. Evaluación inicial y enfoque recomendado

La dirección es correcta, pero el alcance es demasiado amplio para un único prompt de Figma Make.

Lo solicitado equivale aproximadamente a la especificación funcional completa de un producto SaaS Legaltech Enterprise, incluyendo:

- Arquitectura funcional.
- UX.
- UI de decenas de pantallas.
- Design System.
- Navegación.
- Flujos.
- Estados.
- Modelo de datos.
- APIs.
- JSON.
- Wireframes.
- Alta fidelidad.
- Prototipo navegable.
- Casos de uso.
- Motor de workflow.
- IA.
- Automatización PJUD.
- CRM.
- Auditoría.

Ese alcance supera ampliamente lo recomendable para un único prompt monolítico. Además, las referencias visuales evidencian varias oportunidades de mejora respecto de una plataforma tradicional de gestión judicial:

- Exceso de tablas.
- Demasiados clics para llegar a la información.
- La causa como centro de navegación cuando debería ser la tarea.
- Poco énfasis en prioridades.
- KPIs insuficientes para perfiles ejecutivos.
- Timeline sin lectura clara de riesgo.
- IA tratada como función secundaria en vez de copiloto.
- CRM desacoplado de la causa.
- Documentos tratados como archivos y no como parte del workflow.
- Estados procesales difíciles de interpretar visualmente.
- Información crítica distribuida entre múltiples vistas.

La recomendación es construir un producto completamente nuevo, inspirado funcionalmente en las referencias entregadas, pero con una arquitectura moderna similar a Linear, Notion y Stripe, donde todo gira en torno al trabajo diario y no a formularios.

## Fases propuestas

### Fase 1 — Product Vision

- Objetivos del negocio.
- Objetivos UX.
- Roles.
- Arquitectura.
- Procesos.

### Fase 2 — Information Architecture

- Navegación completa.
- Sitemap.
- Menús.
- Permisos.
- Estados.

### Fase 3 — UX

- User Journey.
- Task Flow.
- Wireframes.
- Dashboard Ejecutivo.
- Mi Escritorio.
- Mi Cartera.
- Vista Causa.
- CRM.
- Documentos.
- IA.

### Fase 4 — UI

- Design System completo.
- Componentes.
- Cards.
- Tables.
- Charts.
- Timeline.
- Workflow.
- Badges.
- Status.
- Dialogs.
- Tokens.
- Responsive.

### Fase 5 — Arquitectura

- Modelo de dominio.
- ERD.
- APIs.
- Eventos.
- Workflows.
- Estados.
- JSON.

### Fase 6 — Prototipo

- Navegable.
- Alta fidelidad.
- Animaciones.
- Interacciones.
- Casos extremos.

## Entregables recomendados

1. Volumen I — Product Vision & Functional Architecture.
2. Volumen II — UX Architecture & User Flows.
3. Volumen III — UI Design System + Pantallas.
4. Volumen IV — Backend Architecture + APIs + Modelo de Datos.
5. Volumen V — Prompt optimizado para Figma Make.
6. Volumen VI — Prompt para Stitch / Gemini.
7. Volumen VII — Especificación para Frontend.
8. Volumen VIII — Especificación para Backend.
9. Volumen IX — Casos de prueba QA y criterios de aceptación.

---

# 2. Próximo paso sugerido

El siguiente paso no es comenzar por las pantallas. Es definir el producto desde la perspectiva del negocio y de la arquitectura. Esto reduce retrabajo y permite que cada pantalla tenga una razón de existir.

## Roadmap recomendado

### Fase 1 — Product Blueprint

Construir el documento maestro del producto: PRD + Functional Specification.

Debe responder:

- ¿Qué problema resuelve la plataforma?
- ¿Quiénes son los usuarios?
- ¿Qué decisiones toma cada perfil?
- ¿Qué información necesita cada uno?
- ¿Qué acciones puede ejecutar?
- ¿Qué eventos disparan automatizaciones?
- ¿Qué métricas definen el éxito?

Entregables:

- Product Vision.
- Objetivos del negocio.
- KPIs.
- Arquitectura funcional.
- Roles.
- Permisos.
- Procesos end-to-end.
- Catálogo de estados judiciales.
- Workflow completo de una causa.

### Fase 2 — Domain Model

Diseñar el dominio completo de PH Legal.

```text
Mandante
    ↓
Cartera
    ↓
Deuda
    ↓
Cliente
    ↓
Garantías
    ↓
Causa
    ↓
Proceso Judicial
    ↓
Actuaciones
    ↓
Documentos
    ↓
Eventos
    ↓
Tareas
    ↓
Gastos
    ↓
Recuperos
    ↓
Cierre
```

Aquí se definen:

- Entidades.
- Relaciones.
- Estados.
- Reglas de negocio.
- Eventos.

### Fase 3 — Arquitectura UX

Antes de dibujar pantallas se diseña la experiencia.

Mandante:

```text
Dashboard
    ↓
Estudio
    ↓
Cartera
    ↓
Indicadores
    ↓
IA
```

Abogado:

```text
Mi Escritorio
    ↓
Mis tareas
    ↓
Mi cartera
    ↓
Causa
    ↓
Acción
```

Objetivo: que el usuario nunca haga más de 2 o 3 clics para llegar a cualquier acción.

### Fase 4 — Design System

Crear un sistema reutilizable que incluya:

- Colores.
- Spacing.
- Tipografía.
- Iconografía.
- Estados.
- Animaciones.
- Responsive.
- Accesibilidad.

### Fase 5 — Diseño de módulos

- Mi Escritorio.
- Dashboard Ejecutivo.
- Mis Causas.
- Detalle de Causa.
- Workflow.
- CRM.
- Documentos.
- IA.
- Reportes.
- Configuración.

### Fase 6 — Arquitectura Técnica

- Frontend.
- Backend.
- Eventos.
- APIs.
- Workers.
- Scheduler.
- IA.
- OCR.
- Integración PJUD.
- Firma electrónica.
- Storage documental.

### Fase 7 — Prompt definitivo para Figma Make

El prompt debe construirse al final, cuando la especificación funcional ya esté cerrada.

---

# 3. LegalFlow 360 — Product Vision

## Objetivo del producto

Construir una plataforma líder para la administración integral de procesos de cobranza judicial ejecutiva en Chile, permitiendo gestionar miles de causas simultáneamente, reducir tiempos operativos, disminuir costos judiciales y aumentar el recupero efectivo mediante automatización, inteligencia artificial y analítica avanzada.

La plataforma debe transformarse en el centro operativo del estudio jurídico, reemplazando:

- Excel.
- Correo electrónico.
- Carpetas compartidas.
- Gestores documentales.
- CRM independientes.
- Sistemas manuales de control PJUD.

Todo el ciclo de vida de una causa debe gestionarse desde un único producto.

## Objetivos estratégicos

### Negocio

- Maximizar recupero judicial.
- Reducir costo por causa.
- Disminuir tiempo promedio de recuperación.
- Reducir carga administrativa.
- Mejorar cumplimiento de SLA.
- Mejorar satisfacción del mandante.
- Facilitar escalabilidad del estudio.

### Objetivos UX

La plataforma debe responder cuatro preguntas en menos de cinco segundos.

**Mandante:** ¿Cómo está funcionando mi estudio jurídico?

**Abogado:** ¿Qué debo hacer ahora?

**Procurador:** ¿Qué gestión debo ejecutar hoy?

**Ejecutivo Comercial:** ¿Qué debo comunicar al cliente?

## Principios del producto

### 1. Task Driven

Nunca navegar por navegar. La plataforma debe abrirse mostrando directamente el trabajo pendiente.

### 2. Exception Driven

La plataforma no debe destacar la normalidad, sino aquello que requiere atención.

### 3. Visual First

Antes de leer texto, el usuario debe comprender riesgo, urgencia, recuperación, etapa y prioridad mediante color, tamaño e iconografía.

### 4. AI First

Toda pantalla debe incorporar un copiloto IA contextual.

Ejemplo:

> La causa lleva 42 días sin movimiento. Se recomienda solicitar liquidación.

### 5. Zero Excel

Toda la información debe vivir dentro de la plataforma.

## Usuarios

### Mandante

Objetivo: evaluar desempeño del estudio. No gestiona causas.

Indicadores principales:

- Recupero.
- Cuantía.
- Rentabilidad.
- Costo judicial.
- SLA.
- Ranking de estudios.
- Tiempo de recuperación.
- Remates.
- Daciones.
- Pagos.

### Abogado

Objetivo: gestionar cartera, tomar decisiones jurídicas, generar escritos y controlar procuradores.

### Procurador

Objetivo: ejecutar acciones operativas y diligencias bajo supervisión.

### Abogado Jefe

Objetivo: gestionar abogados, cartera, productividad y riesgo.

### Ejecutivo Comercial

Objetivo: relacionarse con el cliente, registrar contactos y mantener actualizado el CRM sin modificar información jurídica.

## Arquitectura del producto

```text
LEGALFLOW

├── Dashboard Ejecutivo
├── Mi Escritorio
├── Mi Cartera
├── Gestión de Causas
├── Workflow Judicial
├── CRM
├── Documentos IA
├── Firma Electrónica
├── Presentación PJUD
├── OCR
├── Recuperos
├── Gastos
├── Agenda
├── Bandeja
├── Analytics
├── Auditoría
├── IA
└── Configuración
```

## Núcleo de producto

La plataforma no gira alrededor de una causa. Gira alrededor del trabajo pendiente.

```text
Usuario
    ↓
Mi Escritorio
    ↓
Tareas
    ↓
Causa
    ↓
Acción
    ↓
Resultado
    ↓
Nueva tarea
```

No se recomienda el flujo tradicional:

```text
Buscar causa
    ↓
Abrir causa
    ↓
Buscar información
    ↓
Ejecutar acción
```

## Mi Escritorio

Debe ser la pantalla principal.

Ejemplo de resumen diario:

```text
Buenos días, Felipe

Hoy debes ejecutar

12 escritos
5 notificaciones
2 audiencias
8 causas vencen hoy
3 remates
2 liquidaciones
1 apelación
4 pagos recibidos
2 documentos pendientes
```

Debajo, una lista priorizada:

```text
Muy urgente
Solicitar embargo
Expira en 2 horas

Alta
Subir escrito PJUD
Antes de las 14:00

Media
Llamar receptor judicial

Baja
Actualizar antecedentes
```

Cada tarjeta debe abrir la acción exacta que corresponde.

---

# 4. Arquitectura Funcional

## Filosofía del producto

La plataforma deja de ser un sistema de seguimiento de causas y pasa a ser un sistema operativo del estudio jurídico.

```text
Cliente (Mandante)
        │
        ▼
     Cartera
        │
        ▼
      Deuda
        │
        ▼
      Causa
        │
        ▼
     Workflow
        │
        ▼
      Trabajo
```

La causa deja de ser un registro estático y se transforma en un proceso vivo.

Cada evento genera trabajo. Cada trabajo genera una decisión. Cada decisión modifica el estado del juicio.

## Arquitectura general

```text
LEGALFLOW

- Dashboard Ejecutivo
- Mi Escritorio
- Mi Cartera
- Gestión Judicial
- CRM
- Workflow Judicial
- Documentos IA
- Firma Electrónica
- Integración PJUD
- Recuperos
- Gastos
- Analytics
- Auditoría
- IA Copilot
```

## Modelo de navegación

### Mandante

```text
Dashboard
    ↓
Ranking Estudios
    ↓
Seleccionar Estudio
    ↓
Indicadores
    ↓
IA
    ↓
Detalle ejecutivo
```

No entra a una causa, no edita y no carga información.

### Abogado

```text
Mi Escritorio
    ↓
Mis Tareas
    ↓
Mi Cartera
    ↓
Causa
    ↓
Acción
    ↓
Siguiente tarea
```

### Procurador

```text
Mi Escritorio
    ↓
Gestión Terreno
    ↓
Notificaciones
    ↓
Receptores
    ↓
Actualizar gestión
```

### Ejecutivo Comercial

```text
Mi CRM
    ↓
Cliente
    ↓
Historial
    ↓
Registrar contacto
    ↓
Cerrar gestión
```

## Dashboard Ejecutivo del Mandante

Debe responder una sola pregunta:

**¿Mi estudio jurídico está recuperando lo esperado?**

KPIs:

- Recupero acumulado.
- Recupero porcentual.
- Cuantía administrada.
- Recupero por estudio.
- Recupero por cartera.
- Recupero mensual.
- Rentabilidad.
- Costo judicial.
- Costo promedio por juicio.
- SLA.
- Tiempo promedio de recuperación.
- Remates.
- Pagos.
- Daciones.
- Embargos.
- Liquidaciones.
- Causas críticas.
- Riesgo de cartera.
- IA Insights.

La pantalla debe priorizar lectura ejecutiva, evitando tablas densas.

### Analítica avanzada del Mandante

Capacidades agregadas el 2026-07-13 (detalle en `META_MODELO_NEGOCIO.md` §3-4):

- **Drill-down**: desde el consolidado hasta la causa individual, pasando por mandante/cartera y segmento, sin perder los filtros de período.
- **Tablas vintage/cohorte**: recupero acumulado y comparativo por camada histórica de originación (mes de ingreso de cartera).
- **Ranking de estudios**: comparación entre los estudios jurídicos que gestionan su cartera (recupero, SLA, tiempo de recuperación, costo judicial), con selección de un estudio para entrar a su detalle.
- **Rentabilidad por causa**: comparativo de costo/gasto judicial acumulado vs. recupero confirmado por causa individual, con margen y ratio de rentabilidad.
- **Vista ejecutiva comparativa**: estado total de causas con comparativas combinables por estudio y por fecha/período.

## Dashboard Ejecutivo del Abogado Jefe

Debe responder una sola pregunta:

**¿Mi estudio está cumpliendo lo que le corresponde, y cómo rinde cada abogado/procurador?**

Mismas KPIs y capacidades analíticas que el Dashboard Ejecutivo del Mandante (drill-down, vintage/cohorte, rentabilidad por causa, vista ejecutiva comparativa por fecha), pero:

- Acotadas exclusivamente a **su propio estudio** (todos los mandantes que atiende su estudio, consolidados).
- **Sin** ranking ni comparación contra otros estudios jurídicos.
- Con una capa adicional de desagregación **por abogado y por procurador** de su equipo: carga de trabajo, productividad, cumplimiento de SLA individual, recupero atribuido, tareas críticas vencidas, y drill-down desde el abogado hacia su cartera de causas.

*(Detalle funcional en `META_MODELO_NEGOCIO.md` §5.)*

## Mi Escritorio

No es un dashboard; es un centro operativo.

Debe contener:

### Hoy

```text
15 tareas
3 urgentes
2 audiencias
7 escritos
5 notificaciones
1 remate
```

### Riesgos

```text
Embargo vence hoy
Liquidación pendiente
Receptor sin respuesta
Audiencia mañana
Remate suspendido
```

### IA

```text
Detecté:
5 causas detenidas
2 pagos asociados
3 escritos recomendados
1 posible prescripción
```

## Mi Cartera

Reemplaza la grilla tradicional mediante tarjetas expandibles.

```text
T-214-2025
Banco Santander
$42.500.000
Notificada
Hace 2 días
IA: Sugiere solicitar embargo
[Trabajar]
```

## Detalle de Causa

Debe ser un workspace unificado:

```text
Información General
Workflow
Documentos
CRM
Recupero
Gastos
Auditoría
IA
```

## Timeline Judicial

Debe comunicar visualmente etapa, riesgo y plazo.

```text
Ingreso
●────────●──────●─────●────●
Demanda   Notificación   Embargo   Remate   Pago

Estado: Notificada
Riesgo: Bajo
23 días restantes
```

## IA Copilot

Debe ser contextual.

```text
Resumen
↓
Estado
↓
Riesgos
↓
Acciones sugeridas
↓
Botones ejecutar
```

Ejemplo:

```text
Esta causa lleva 52 días sin movimiento.

Se recomienda:
- Generar escrito.
- Solicitar liquidación.
- Contactar receptor.
- Avisar al ejecutivo.
```

## CRM integrado

Cada causa tiene un CRM asociado:

- WhatsApp.
- Llamadas.
- Correo.
- Promesas.
- Pagos.
- Observaciones.
- Bitácora.

## Automatización de ejemplo

```text
Pago recibido
    ↓
Validación
    ↓
Actualizar recupero
    ↓
Detener remate
    ↓
Generar escrito
    ↓
Subir PJUD
    ↓
Notificar abogado
    ↓
Actualizar Dashboard
    ↓
Actualizar KPIs
    ↓
Actualizar IA
```

## Motor de workflow

```text
Nueva
↓
Preparación
↓
Ingreso
↓
Proveída
↓
Notificación
↓
Embargo
↓
Liquidación
↓
Remate
↓
Pago
↓
Término
```

Cada transición debe validar reglas, generar tareas, registrar auditoría, disparar eventos y actualizar métricas.

---

# 5. Modelo de Dominio, Estados, Eventos y Permisos

## Propósito

El modelo de dominio representa de manera consistente:

- Mandantes.
- Carteras.
- Deudores.
- Obligaciones.
- Garantías.
- Causas.
- Actuaciones.
- Tareas.
- Plazos.
- Documentos.
- Contactos.
- Gastos.
- Recuperos.
- Remates.
- Daciones.
- Pagos.
- Usuarios.
- Permisos.
- Auditoría.
- Automatizaciones.
- Indicadores.

La causa es la entidad central, pero la operación diaria se organiza mediante tareas, eventos y plazos.

```text
Mandante
   │
   ├── Cartera
   │      │
   │      ├── Deudor
   │      │      ├── Obligación
   │      │      ├── Garantía
   │      │      └── Contactos
   │      │
   │      └── Causa judicial
   │             ├── Workflow
   │             ├── Actuaciones
   │             ├── Tareas
   │             ├── Plazos
   │             ├── Documentos
   │             ├── Gastos
   │             ├── Recuperos
   │             ├── Comunicaciones
   │             └── Auditoría
```

## Bounded Contexts

### Gestión de Mandantes

Entidades:

```text
Mandante
ContratoServicio
SLA
EstudioJuridico
EquipoMandante
Cartera
SegmentoCartera
MetaRecupero
ReglaMandante
```

### Gestión de Cartera y Deuda

```text
Deudor
PersonaNatural
PersonaJuridica
Obligacion
Cuota
ProductoFinanciero
Garantia
Bien
Aval
Codeudor
SaldoDeuda
```

### Gestión Judicial

```text
Causa
Tribunal
ParteProcesal
ActuacionJudicial
Resolucion
Escrito
Audiencia
NotificacionJudicial
Embargo
Remate
Incidente
RecursoJudicial
```

### Workflow y Trabajo Operativo

```text
WorkflowDefinition
WorkflowInstance
WorkflowStage
WorkflowTransition
Task
TaskAssignment
Deadline
Alert
AutomationRule
EscalationRule
```

### Gestión Documental

```text
Document
DocumentVersion
DocumentTemplate
DocumentGeneration
DigitalSignature
PJUDSubmission
DocumentEvidence
```

### CRM y Contactabilidad

```text
ContactProfile
ContactChannel
ContactAction
Call
EmailInteraction
WhatsAppInteraction
PaymentPromise
Instruction
InteractionOutcome
```

### Recuperos

```text
Recovery
Payment
PaymentAllocation
SettlementAgreement
Dation
AuctionRecovery
AssetSale
RecoveryReversal
```

### Gastos Judiciales

```text
Expense
ExpenseCategory
ExpenseEvidence
ExpenseApproval
ExpenseReimbursement
Supplier
```

### Analítica

```text
KPI
MetricSnapshot
PortfolioPerformance
FirmRanking
RecoveryProjection
RiskScore
```

### Seguridad y Auditoría

```text
User
Role
Permission
AccessScope
AuditEvent
LoginSession
Approval
DataExport
```

## Entidades principales

### Mandante

```json
{
  "id": "man_001",
  "legalName": "Banco Financiero Nacional S.A.",
  "commercialName": "BFN",
  "taxId": "96.123.456-7",
  "industry": "BANCA",
  "status": "ACTIVE",
  "contractStartDate": "2026-01-01",
  "serviceModel": "JUDICIAL_COLLECTION",
  "slaProfileId": "sla_bfn_2026",
  "currency": "CLP"
}
```

Reglas:

- Un mandante puede tener varias carteras.
- Una cartera pertenece a un solo mandante.
- Las reglas pueden variar por mandante.
- El mandante solo visualiza su ámbito.
- No puede editar actuaciones judiciales.

### Cartera

```json
{
  "id": "car_2026_07_auto",
  "mandanteId": "man_001",
  "name": "Automotriz julio 2026",
  "portfolioType": "PLEDGED_AUTOMOTIVE",
  "assignmentDate": "2026-07-01",
  "assignedAmount": 4850000000,
  "assignedCases": 842,
  "targetRecoveryRate": 0.24,
  "targetRecoveryAmount": 1164000000,
  "status": "ACTIVE"
}
```

Tipos sugeridos:

```text
PLEDGED_AUTOMOTIVE
MORTGAGE
FOGAPE
SME
CONSUMER
COMMERCIAL
UNSECURED
LEASING
FACTORING
```

### Deudor

```json
{
  "id": "deb_84921",
  "personType": "NATURAL",
  "taxId": "12.345.678-9",
  "fullName": "Carlos Andrés González Pérez",
  "riskLevel": "MEDIUM",
  "contactabilityScore": 72,
  "preferredChannel": "WHATSAPP",
  "status": "JUDICIALIZED"
}
```

### Obligación

```json
{
  "id": "obl_55678",
  "debtorId": "deb_84921",
  "portfolioId": "car_2026_07_auto",
  "productType": "AUTOMOTIVE_CREDIT",
  "contractNumber": "CR-2022-98411",
  "principal": 18750000,
  "accruedInterest": 2310000,
  "collectionExpenses": 480000,
  "totalDebt": 21540000,
  "daysPastDue": 286,
  "currency": "CLP",
  "status": "ACCELERATED"
}
```

### Garantía

```json
{
  "id": "gua_9931",
  "obligationId": "obl_55678",
  "type": "VEHICLE_PLEDGE",
  "assetId": "asset_773",
  "appraisedValue": 16500000,
  "liquidationValue": 13200000,
  "registrationStatus": "VALID",
  "enforceabilityStatus": "ENFORCEABLE"
}
```

### Causa

```json
{
  "id": "case_2026_001245",
  "portfolioId": "car_2026_07_auto",
  "mandanteId": "man_001",
  "debtorId": "deb_84921",
  "obligationIds": ["obl_55678"],
  "courtId": "court_santiago_18_civil",
  "rol": "C-8421-2026",
  "procedureType": "EXECUTIVE",
  "matter": "PRENDA_SIN_DESPLAZAMIENTO",
  "claimAmount": 21540000,
  "filingDate": "2026-07-04",
  "currentStage": "NOTIFICATION",
  "currentStatus": "SEARCHING_ADDRESS",
  "riskLevel": "HIGH",
  "slaStatus": "AT_RISK",
  "leadLawyerId": "usr_lawyer_008",
  "assignedAttorneyId": "usr_attorney_021",
  "recoveryAmount": 0,
  "expenseAmount": 186000,
  "status": "ACTIVE"
}
```

## Máquina de estados

### Etapas macro

```text
PRE_JUDICIAL_REVIEW
FILING_PREPARATION
FILED
ADMISSIBILITY
NOTIFICATION
DEFENSE_AND_INCIDENTS
ASSET_INVESTIGATION
ATTACHMENT
LIQUIDATION
AUCTION_PREPARATION
AUCTION
RECOVERY
TERMINATION
ARCHIVED
```

### Flujo ejecutivo base

```text
Asignada
↓
Antecedentes en revisión
↓
Demanda en preparación
↓
Demanda presentada
↓
Proveída
↓
Mandamiento emitido
↓
Búsqueda de domicilio
↓
Notificación
↓
Requerimiento de pago
↓
Embargo
↓
Retiro de especies
↓
Tasación
↓
Liquidación
↓
Preparación de remate
↓
Remate
↓
Pago / adjudicación
↓
Imputación
↓
Término
```

### Ejemplo de transición

```json
{
  "transitionId": "tr_submit_claim",
  "name": "Presentar demanda",
  "fromStatus": "CLAIM_READY",
  "toStatus": "CLAIM_FILED",
  "allowedRoles": ["LAWYER", "LEAD_LAWYER"],
  "requiredConditions": [
    "EXECUTIVE_TITLE_VALID",
    "MANDATE_VALID",
    "CLAIM_DOCUMENT_SIGNED"
  ],
  "requiredDocuments": [
    "CLAIM",
    "EXECUTIVE_TITLE",
    "POWER_OF_ATTORNEY"
  ],
  "requiresApproval": true,
  "approvalRole": "LEAD_LAWYER",
  "generatedTasks": ["VERIFY_COURT_ADMISSION"],
  "emittedEvents": ["CLAIM_SUBMITTED", "CASE_STATUS_CHANGED"]
}
```

## Tareas

```json
{
  "id": "task_72428",
  "caseId": "case_2026_001245",
  "type": "CONTACT_RECEIVER",
  "title": "Coordinar notificación con receptor",
  "description": "Confirmar disponibilidad para diligencia en domicilio informado.",
  "priority": "HIGH",
  "urgencyScore": 87,
  "assignedUserId": "usr_attorney_021",
  "assignedByUserId": "usr_lawyer_008",
  "dueAt": "2026-07-11T16:00:00-04:00",
  "slaDueAt": "2026-07-12T23:59:59-04:00",
  "status": "PENDING",
  "source": "WORKFLOW",
  "requiresEvidence": true
}
```

Estados:

```text
PENDING
IN_PROGRESS
BLOCKED
WAITING_EXTERNAL
PENDING_APPROVAL
COMPLETED
CANCELLED
OVERDUE
```

### Cálculo de urgencia

```text
Urgency Score =
  peso vencimiento
+ peso SLA
+ peso cuantía
+ peso riesgo procesal
+ peso dependencia
+ peso instrucción superior
+ peso impacto recupero
```

Semáforo:

```text
0–39   Verde
40–64  Amarillo
65–84  Naranja
85–100 Rojo
```

## Plazos

```json
{
  "id": "deadline_881",
  "caseId": "case_2026_001245",
  "type": "COURT",
  "name": "Plazo para acompañar antecedentes",
  "startDate": "2026-07-08",
  "dueDate": "2026-07-11",
  "businessDays": true,
  "source": "COURT_RESOLUTION",
  "sourceDocumentId": "doc_resolution_991",
  "riskStatus": "CRITICAL",
  "status": "OPEN"
}
```

## Actuaciones judiciales

```json
{
  "id": "action_55219",
  "caseId": "case_2026_001245",
  "type": "COURT_RESOLUTION",
  "date": "2026-07-09",
  "title": "Resolución tiene por acompañados documentos",
  "source": "PJUD",
  "externalId": "pj_8839201",
  "performedBy": "COURT",
  "summary": "El tribunal tuvo por acompañados los documentos y ordenó continuar la tramitación.",
  "requiresAction": true,
  "generatedByAI": false
}
```

## Documentos

```json
{
  "id": "doc_claim_221",
  "caseId": "case_2026_001245",
  "documentType": "CLAIM",
  "name": "Demanda ejecutiva",
  "status": "SIGNED",
  "currentVersion": 4,
  "templateId": "tpl_claim_vehicle_01",
  "generatedByAI": true,
  "reviewedByUserId": "usr_lawyer_008",
  "signedByUserId": "usr_lawyer_008",
  "storageKey": "cases/2026/001245/claim-v4.pdf",
  "createdAt": "2026-07-04T10:28:00-04:00"
}
```

Estados:

```text
DRAFT
GENERATED
UNDER_REVIEW
OBSERVED
APPROVED
SIGNED
SUBMITTED
ACCEPTED
REJECTED
SUPERSEDED
ARCHIVED
```

## Recuperos

```json
{
  "id": "recovery_20182",
  "caseId": "case_2026_001245",
  "obligationId": "obl_55678",
  "type": "DIRECT_PAYMENT",
  "grossAmount": 5200000,
  "netAmount": 5200000,
  "paymentDate": "2026-07-10",
  "recognitionDate": "2026-07-10",
  "status": "CONFIRMED",
  "source": "BANK_RECONCILIATION",
  "allocation": {
    "principal": 4310000,
    "interest": 690000,
    "expenses": 200000
  }
}
```

Fórmulas:

```text
Tasa de recupero = Recupero acumulado / Cuantía asignada

Rentabilidad judicial =
(Recupero neto - gastos judiciales - costos imputables) / costos imputables
```

## Gastos

```json
{
  "id": "expense_4012",
  "caseId": "case_2026_001245",
  "category": "COURT_RECEIVER",
  "supplierId": "supplier_receiver_88",
  "amount": 85000,
  "currency": "CLP",
  "expenseDate": "2026-07-09",
  "description": "Primera búsqueda y notificación",
  "status": "PENDING_APPROVAL",
  "evidenceDocumentId": "doc_receipt_781",
  "requestedByUserId": "usr_attorney_021",
  "approvalRequired": true
}
```

## CRM y comunicaciones

```json
{
  "id": "interaction_88219",
  "caseId": "case_2026_001245",
  "debtorId": "deb_84921",
  "channel": "PHONE",
  "direction": "OUTBOUND",
  "performedByUserId": "usr_commercial_014",
  "startedAt": "2026-07-10T11:22:00-04:00",
  "durationSeconds": 286,
  "outcome": "PAYMENT_COMMITMENT",
  "notes": "Cliente indica que transferirá $5.200.000 durante el día.",
  "generatedAction": "VERIFY_PAYMENT",
  "visibility": "LEGAL_AND_COMMERCIAL"
}
```

## Eventos de dominio

```text
PortfolioAssigned
DebtImported
CaseCreated
CaseAssigned
ClaimGenerated
ClaimApproved
ClaimSigned
ClaimSubmitted
CourtResolutionReceived
CaseStatusChanged
TaskCreated
TaskOverdue
DeadlineApproaching
DeadlineMissed
NotificationCompleted
AttachmentRegistered
AuctionScheduled
PaymentPromiseCreated
PaymentReceived
RecoveryConfirmed
AuctionSuspensionRequested
ExpenseSubmitted
ExpenseApproved
DocumentGenerated
DocumentSigned
DocumentSubmittedToPJUD
RiskLevelChanged
SLAAtRisk
SLAExceeded
CaseClosed
```

Ejemplo:

```json
{
  "eventId": "evt_019923",
  "eventType": "PaymentReceived",
  "occurredAt": "2026-07-10T14:31:52-04:00",
  "aggregateType": "JudicialCase",
  "aggregateId": "case_2026_001245",
  "actor": {
    "type": "SYSTEM",
    "id": "bank-reconciliation-service"
  },
  "payload": {
    "paymentId": "pay_8211",
    "amount": 5200000,
    "currency": "CLP"
  },
  "metadata": {
    "correlationId": "corr_821122",
    "source": "BANK_RECONCILIATION"
  }
}
```

## Reacción automática a eventos

```text
PaymentReceived
      ↓
Validar cuenta y monto
      ↓
Asociar pago con obligación
      ↓
Confirmar recupero
      ↓
Detectar remate vigente
      ↓
Crear alerta crítica
      ↓
Crear tarea “Evaluar suspensión”
      ↓
Notificar abogado responsable
      ↓
Notificar abogado jefe
      ↓
Generar borrador de escrito
      ↓
Actualizar recupero
      ↓
Actualizar dashboard
      ↓
Registrar auditoría
```

La suspensión de un remate requiere control jurídico humano.

## Modelo de permisos

```text
Permiso efectivo =
Rol
+ Mandante asignado
+ Cartera asignada
+ Equipo
+ Causa
+ Nivel de confidencialidad
```

### Mandante

Puede:

- Ver dashboard.
- Consultar KPIs.
- Comparar estudios.
- Consultar tendencias.
- Usar IA.
- Exportar reportes autorizados.

No puede:

- Editar causas.
- Ver notas internas.
- Modificar documentos.
- Asignar tareas internas.
- Ver datos de otros mandantes.

### Abogado

Puede:

- Ver causas asignadas.
- Editar información jurídica.
- Generar escritos.
- Firmar.
- Presentar.
- Registrar actuaciones.
- Crear tareas.
- Registrar gastos.
- Consultar CRM.

### Procurador

Puede:

- Gestionar tareas.
- Registrar diligencias.
- Cargar evidencias.
- Contactar receptores.
- Registrar notificaciones.
- Registrar gastos.

No puede:

- Aprobar estrategia.
- Firmar como abogado.
- Cerrar causas.
- Aprobar recuperos.

### Abogado Jefe

Incluye permisos de abogado y además:

- Supervisar equipos.
- Reasignar causas.
- Aprobar documentos.
- Aprobar transiciones críticas.
- Ver indicadores operativos.
- Revisar causas críticas.
- Crear instrucciones.
- Aprobar gastos según monto.

### Ejecutivo Comercial

Puede:

- Ver ficha del cliente.
- Consultar estado resumido.
- Registrar contactos.
- Registrar compromisos.
- Informar pagos.
- Crear tareas de validación.

No puede:

- Modificar estados judiciales.
- Acceder a documentos reservados.
- Modificar cuantía.
- Cerrar causas.

## Auditoría

Toda acción relevante debe registrarse.

```json
{
  "auditId": "audit_822188",
  "timestamp": "2026-07-10T15:04:11-04:00",
  "actorType": "USER",
  "actorId": "usr_lawyer_008",
  "action": "CASE_STATUS_CHANGED",
  "entityType": "JudicialCase",
  "entityId": "case_2026_001245",
  "before": {
    "status": "NOTIFICATION_PENDING"
  },
  "after": {
    "status": "NOTIFIED"
  },
  "reason": "Notificación personal registrada por receptor.",
  "ipAddress": "10.12.8.51",
  "sessionId": "ses_773190",
  "correlationId": "corr_101112"
}
```

Debe auditarse:

- Accesos.
- Consultas sensibles.
- Cambios de estado.
- Descargas.
- Exportaciones.
- Firmas.
- Acciones de IA.
- Presentaciones a PJUD.
- Aprobaciones.
- Reasignaciones.
- Cambios de permisos.
- Eliminaciones lógicas.

## IA y trazabilidad

```json
{
  "aiExecutionId": "ai_88129",
  "caseId": "case_2026_001245",
  "useCase": "CASE_SUMMARY",
  "model": "legal-domain-model-v2",
  "inputSources": [
    "doc_resolution_991",
    "action_55219",
    "deadline_881"
  ],
  "output": {
    "summary": "La causa se encuentra notificada y el siguiente hito sugerido es solicitar embargo.",
    "riskLevel": "MEDIUM",
    "suggestedActions": [
      "GENERATE_ATTACHMENT_REQUEST"
    ]
  },
  "confidence": 0.89,
  "requiresHumanReview": true,
  "reviewStatus": "PENDING"
}
```

Principios:

- IA asistiva.
- Fuente documental visible.
- Trazabilidad de modelo y versión.
- Advertencia en baja confianza.
- Revisión humana.
- Protección de datos.
- Separación por mandante.
- Registro de prompts y resultados.

## Arquitectura recomendada

```text
Frontend
Next.js + React + TypeScript

API Gateway
REST + eventos

Servicios de dominio
- Identity Service
- Mandante Service
- Portfolio Service
- Judicial Case Service
- Workflow Service
- Task Service
- Document Service
- CRM Service
- Recovery Service
- Expense Service
- Analytics Service
- Audit Service
- AI Orchestrator
- PJUD Integration Service

Persistencia
PostgreSQL

Búsqueda
OpenSearch

Archivos
Object Storage compatible con S3

Eventos
Kafka, Pub/Sub o equivalente

Workflow
Temporal o Camunda

Cache
Redis

Observabilidad
OpenTelemetry + métricas + logs centralizados
```

## Reglas de integridad

1. Una causa pertenece a una cartera y un mandante.
2. Toda causa tiene al menos un deudor y una obligación.
3. No se presenta una demanda sin documentos obligatorios.
4. No se cierra una causa con tareas críticas abiertas, salvo excepción aprobada.
5. Todo recupero tiene fuente, monto, fecha y estado.
6. Todo gasto tiene categoría y responsable.
7. Toda transición crítica registra usuario, motivo y evidencia.
8. Un pago informado por un ejecutivo no es recupero confirmado hasta validación.
9. La IA no modifica estados por sí misma.
10. La eliminación física de información judicial no está permitida.
11. Un usuario no consulta información fuera de su ámbito.
12. Toda firma digital se asocia a una versión inmutable.
13. Toda presentación a PJUD guarda comprobante y resultado.
14. Los indicadores del mandante provienen de eventos confirmados.
15. Las causas archivadas permanecen disponibles según política de retención.

---

# 6. Conclusión consolidada

LegalFlow 360 debe concebirse como un sistema operativo legal para la cobranza judicial, no como una simple plataforma de consulta de causas.

El producto debe:

- Priorizar tareas y excepciones.
- Integrar workflow judicial, CRM, documentos, recuperos y gastos.
- Mantener una vista ejecutiva para el mandante.
- Permitir operación diaria simple para abogados y procuradores.
- Mantener segregación estricta de roles.
- Incorporar IA con trazabilidad y revisión humana.
- Automatizar eventos sin eliminar el control jurídico.
- Mantener auditoría completa.
- Servir como base de trabajo para UX, Frontend, Backend, Arquitectura y QA.

