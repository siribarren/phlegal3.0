# LEGALFLOW 360

## Enterprise Product Specification

### Volumen III — Modelo de Dominio, Estados, Eventos y Permisos

---

## 1. Propósito del modelo de dominio

El modelo de dominio define la estructura funcional y técnica sobre la cual se implementará la plataforma.

Su objetivo es representar de forma consistente:

* mandantes;
* carteras asignadas;
* deudores;
* obligaciones;
* garantías;
* causas judiciales;
* actuaciones;
* tareas;
* plazos;
* documentos;
* contactos;
* gastos;
* recuperos;
* remates;
* daciones;
* pagos;
* usuarios;
* permisos;
* auditoría;
* automatizaciones;
* indicadores.

La entidad central del sistema es la **causa judicial**, pero la operación diaria se organiza mediante **tareas, eventos y plazos**.

```text
Mandante
   │
   ├── Cartera
   │      │
   │      ├── Deudor
   │      │      │
   │      │      ├── Obligación
   │      │      ├── Garantía
   │      │      └── Contactos
   │      │
   │      └── Causa judicial
   │             │
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

---

# 2. Bounded Contexts

La solución debe dividirse en dominios funcionales independientes, pero integrados mediante APIs y eventos.

## 2.1 Gestión de mandantes

Administra la relación contractual y operacional con bancos, instituciones financieras y demás clientes del estudio.

Incluye:

* mandantes;
* contratos;
* SLA;
* reglas particulares;
* estudios jurídicos;
* equipos asignados;
* carteras;
* segmentos;
* metas;
* esquemas de gastos;
* indicadores contractuales.

Entidades principales:

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

---

## 2.2 Gestión de cartera y deuda

Representa la deuda entregada al estudio antes y durante la judicialización.

Incluye:

* deudores;
* codeudores;
* avales;
* obligaciones;
* cuotas;
* capital;
* intereses;
* gastos;
* productos financieros;
* estado de mora;
* antecedentes comerciales;
* bienes;
* garantías.

Entidades principales:

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

---

## 2.3 Gestión judicial

Administra el expediente y su ciclo de vida procesal.

Incluye:

* causa;
* rol;
* tribunal;
* materia;
* procedimiento;
* partes;
* abogados;
* procuradores;
* receptores;
* actuaciones;
* resoluciones;
* escritos;
* audiencias;
* embargos;
* remates;
* incidentes;
* recursos.

Entidades principales:

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

---

## 2.4 Workflow y trabajo operativo

Coordina todo el trabajo que debe realizar el estudio.

Incluye:

* procesos;
* etapas;
* estados;
* subestados;
* tareas;
* dependencias;
* vencimientos;
* asignaciones;
* prioridades;
* alertas;
* reglas automáticas.

Entidades principales:

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

---

## 2.5 Gestión documental

Administra los documentos jurídicos y operativos.

Incluye:

* plantillas;
* escritos;
* demandas;
* anexos;
* pagarés;
* contratos;
* certificados;
* documentos firmados;
* versiones;
* firmas;
* presentaciones a PJUD.

Entidades principales:

```text
Document
DocumentVersion
DocumentTemplate
DocumentGeneration
DigitalSignature
PJUDSubmission
DocumentEvidence
```

---

## 2.6 CRM y contactabilidad

Administra la relación con deudores, mandantes, receptores y terceros.

Incluye:

* contactos;
* teléfonos;
* correos;
* domicilios;
* gestiones;
* llamadas;
* WhatsApp;
* correos;
* compromisos;
* promesas de pago;
* instrucciones;
* resultados.

Entidades principales:

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

---

## 2.7 Recuperos

Registra todo monto recuperado o comprometido.

Incluye:

* pagos;
* convenios;
* daciones;
* remates;
* venta de bienes;
* adjudicaciones;
* imputaciones;
* conciliaciones;
* reversas.

Entidades principales:

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

---

## 2.8 Gastos judiciales

Administra los costos asociados a la tramitación.

Incluye:

* receptores;
* notarías;
* publicaciones;
* viajes;
* diligencias;
* certificados;
* conservadores;
* peritos;
* custodia;
* reembolsos.

Entidades principales:

```text
Expense
ExpenseCategory
ExpenseEvidence
ExpenseApproval
ExpenseReimbursement
Supplier
```

---

## 2.9 Analítica

Consolida indicadores operacionales y financieros.

Incluye:

* cuantía;
* recupero;
* tasa de recuperación;
* costo por causa;
* rentabilidad;
* duración;
* cumplimiento de SLA;
* productividad;
* efectividad procesal;
* ranking de estudios.

Entidades principales:

```text
KPI
MetricSnapshot
PortfolioPerformance
FirmRanking
RecoveryProjection
RiskScore
```

---

## 2.10 Seguridad y auditoría

Controla acceso, segregación y trazabilidad.

Incluye:

* usuarios;
* roles;
* permisos;
* ámbitos;
* sesiones;
* cambios;
* accesos;
* exportaciones;
* acciones automatizadas;
* aprobaciones.

Entidades principales:

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

---

# 3. Entidades maestras

## 3.1 Mandante

Representa a la institución que asigna cartera al estudio.

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

* un mandante puede tener varias carteras;
* una cartera pertenece a un solo mandante;
* las reglas procesales pueden variar por mandante;
* el mandante solo visualiza información dentro de su ámbito;
* los usuarios del mandante no pueden editar actuaciones judiciales.

---

## 3.2 Cartera

Agrupa deudas asignadas bajo condiciones comunes.

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

---

## 3.3 Deudor

Representa al sujeto obligado al pago.

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

Puede asociarse a:

* varias obligaciones;
* varias causas;
* bienes;
* domicilios;
* contactos;
* codeudores;
* avales;
* empleadores;
* sociedades relacionadas.

---

## 3.4 Obligación

Representa una deuda exigible.

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

---

## 3.5 Garantía

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

Tipos:

```text
VEHICLE_PLEDGE
MORTGAGE
PERSONAL_GUARANTEE
FOGAPE_GUARANTEE
MOVABLE_PLEDGE
COMMERCIAL_GUARANTEE
NO_GUARANTEE
```

---

# 4. Entidad Causa

La causa representa el expediente judicial completo.

```json
{
  "id": "case_2026_001245",
  "portfolioId": "car_2026_07_auto",
  "mandanteId": "man_001",
  "debtorId": "deb_84921",
  "obligationIds": [
    "obl_55678"
  ],
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

---

# 5. Agregado Causa Judicial

Desde una perspectiva DDD, la causa actúa como agregado principal.

El agregado controla:

* estado procesal;
* etapa;
* asignaciones;
* actuaciones;
* plazos;
* tareas;
* documentos;
* recuperos;
* gastos;
* eventos críticos.

No todas las entidades deben cargarse simultáneamente. El backend debe mantener consistencia transaccional solo sobre datos críticos.

```text
JudicialCase
 ├── CaseStatus
 ├── CaseStage
 ├── CaseAssignment
 ├── CourtIdentification
 ├── ClaimAmount
 ├── ProceduralRisk
 └── DomainEvents
```

Entidades como documentos, contactos y gastos pueden ser agregados independientes, asociados por `caseId`.

---

# 6. Máquina de estados procesales

No debe utilizarse una única lista rígida para todas las carteras. Cada tipo de juicio tendrá una definición de workflow configurable.

## 6.1 Etapas macro

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

---

## 6.2 Flujo ejecutivo base

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

---

## 6.3 Estados de causa

```json
[
  {
    "code": "ASSIGNED",
    "label": "Asignada",
    "stage": "PRE_JUDICIAL_REVIEW"
  },
  {
    "code": "DOCUMENTS_IN_REVIEW",
    "label": "Antecedentes en revisión",
    "stage": "PRE_JUDICIAL_REVIEW"
  },
  {
    "code": "CLAIM_DRAFTING",
    "label": "Demanda en preparación",
    "stage": "FILING_PREPARATION"
  },
  {
    "code": "CLAIM_FILED",
    "label": "Demanda presentada",
    "stage": "FILED"
  },
  {
    "code": "ADMITTED",
    "label": "Demanda proveída",
    "stage": "ADMISSIBILITY"
  },
  {
    "code": "NOTIFICATION_PENDING",
    "label": "Notificación pendiente",
    "stage": "NOTIFICATION"
  },
  {
    "code": "NOTIFIED",
    "label": "Notificada",
    "stage": "NOTIFICATION"
  },
  {
    "code": "ATTACHMENT_PENDING",
    "label": "Embargo pendiente",
    "stage": "ATTACHMENT"
  },
  {
    "code": "ASSETS_ATTACHED",
    "label": "Bienes embargados",
    "stage": "ATTACHMENT"
  },
  {
    "code": "AUCTION_SCHEDULED",
    "label": "Remate programado",
    "stage": "AUCTION"
  },
  {
    "code": "PAYMENT_AGREEMENT",
    "label": "Convenio de pago",
    "stage": "RECOVERY"
  },
  {
    "code": "FULLY_RECOVERED",
    "label": "Recuperada",
    "stage": "TERMINATION"
  },
  {
    "code": "CLOSED_WITHOUT_RECOVERY",
    "label": "Terminada sin recupero",
    "stage": "TERMINATION"
  }
]
```

---

# 7. Transiciones y reglas

Cada transición debe definir:

* estado origen;
* estado destino;
* roles autorizados;
* validaciones;
* documentos requeridos;
* tareas generadas;
* eventos emitidos;
* necesidad de aprobación;
* impacto en SLA;
* impacto en KPIs.

Ejemplo:

```json
{
  "transitionId": "tr_submit_claim",
  "name": "Presentar demanda",
  "fromStatus": "CLAIM_READY",
  "toStatus": "CLAIM_FILED",
  "allowedRoles": [
    "LAWYER",
    "LEAD_LAWYER"
  ],
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
  "generatedTasks": [
    "VERIFY_COURT_ADMISSION"
  ],
  "emittedEvents": [
    "CLAIM_SUBMITTED",
    "CASE_STATUS_CHANGED"
  ]
}
```

---

# 8. Tareas

Las tareas constituyen el principal objeto de trabajo de abogados y procuradores.

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

Prioridades:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

---

## 8.1 Cálculo de urgencia

La urgencia debe calcularse, no depender solo de una selección manual.

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

Ejemplo:

```json
{
  "deadlineWeight": 35,
  "slaWeight": 15,
  "claimAmountWeight": 10,
  "proceduralRiskWeight": 20,
  "dependencyWeight": 5,
  "managerInstructionWeight": 10,
  "recoveryImpactWeight": 5,
  "total": 100
}
```

Semáforo:

```text
0–39   Verde
40–64  Amarillo
65–84  Naranja
85–100 Rojo
```

---

# 9. Plazos

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

Estados visuales:

* verde: más de 40% del plazo disponible;
* amarillo: entre 20% y 40%;
* naranja: menos de 20%;
* rojo: vencido;
* gris: suspendido o cerrado.

Los plazos deben considerar:

* días hábiles;
* feriados;
* suspensión de procedimientos;
* reglas por tribunal;
* eventos que interrumpan o modifiquen el cómputo;
* revisión humana obligatoria en plazos inferidos por IA.

---

# 10. Actuaciones judiciales

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

Tipos:

```text
CLAIM_FILED
COURT_RESOLUTION
WRIT_FILED
NOTIFICATION
PAYMENT_REQUEST
ATTACHMENT
HEARING
AUCTION
INCIDENT
APPEAL
SETTLEMENT
PAYMENT
TERMINATION
INTERNAL_ACTION
```

---

# 11. Documentos

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

---

# 12. Recuperos

Todo recupero debe asociarse a una causa, obligación y mandante.

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

Tipos:

```text
DIRECT_PAYMENT
PAYMENT_AGREEMENT
AUCTION
DATION
ASSET_SALE
ADJUDICATION
INSURANCE_PAYMENT
GUARANTEE_PAYMENT
```

La tasa de recupero se calcula como:

```text
Recupero acumulado / Cuantía asignada
```

La rentabilidad judicial:

```text
(Recupero neto - gastos judiciales - costos imputables) / costos imputables
```

---

# 13. Gastos

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

Estados:

```text
DRAFT
SUBMITTED
PENDING_APPROVAL
APPROVED
REJECTED
REIMBURSED
CHARGED_TO_MANDANTE
CANCELLED
```

---

# 14. CRM y comunicaciones

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

Un contacto puede generar:

* promesa de pago;
* tarea al abogado;
* suspensión preventiva de remate;
* solicitud de liquidación;
* validación de pago;
* instrucción al procurador;
* alerta al abogado jefe.

---

# 15. Eventos de dominio

La solución debe funcionar con arquitectura orientada a eventos.

Eventos principales:

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

---

# 16. Reacción automática a eventos

Ejemplo: pago recibido antes de remate.

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

No se debe suspender automáticamente un remate sin control jurídico. La plataforma genera la acción y el documento, pero requiere aprobación del abogado.

---

# 17. Modelo de permisos

El sistema debe utilizar RBAC combinado con control por ámbito.

```text
Permiso efectivo =
Rol
+ Mandante asignado
+ Cartera asignada
+ Equipo
+ Causa
+ Nivel de confidencialidad
```

---

## 17.1 Mandante

Puede:

* visualizar dashboard;
* consultar KPIs;
* comparar estudios (ranking de estudios que gestionan su cartera);
* consultar tendencias;
* usar asistente IA;
* exportar reportes autorizados;
* navegar por drill-down entre consolidado, mandante/cartera, segmento y causa individual;
* consultar tablas de recupero vintage/cohorte por camada de originación;
* consultar comparativo de costos/gastos y rentabilidad por causa;
* consultar vista ejecutiva comparativa de estado total de causas por estudio y por fecha.

No puede:

* editar causas;
* ver notas internas;
* ver estrategias jurídicas reservadas;
* modificar documentos;
* asignar tareas internas;
* visualizar información de otros mandantes.

*(Ver `META_MODELO_NEGOCIO.md` §4 para el detalle funcional de estas capacidades analíticas.)*

---

## 17.2 Abogado

Puede:

* ver causas asignadas;
* editar información jurídica;
* generar escritos;
* revisar documentos;
* firmar;
* presentar;
* registrar actuaciones;
* crear tareas;
* registrar gastos;
* consultar CRM;
* ejecutar acciones procesales.

Puede ver otras causas solo cuando su ámbito lo permita.

---

## 17.3 Procurador

Puede:

* gestionar tareas;
* registrar diligencias;
* cargar evidencias;
* contactar receptores;
* registrar notificaciones;
* gestionar documentación operativa;
* registrar gastos.

No puede:

* aprobar estrategia;
* firmar documentos como abogado;
* cerrar una causa;
* aprobar recuperos;
* modificar reglas procesales.

---

## 17.4 Abogado jefe

Incluye permisos de abogado y además:

* supervisar equipos;
* reasignar causas;
* aprobar documentos;
* aprobar transiciones críticas;
* ver indicadores operativos;
* revisar causas críticas;
* crear instrucciones;
* revisar productividad;
* aprobar gastos según monto;
* intervenir en casos con SLA comprometido;
* consultar las mismas métricas ejecutivas y tablas vintage/cohorte y de rentabilidad por causa disponibles para el Mandante (§17.1), pero **acotadas exclusivamente a su propio estudio**;
* consultar métricas desagregadas por abogado y por procurador de su equipo (carga, productividad, SLA individual, recupero atribuido);
* consultar la cartera agrupada por abogado/procurador con drill-down hacia sus causas;
* comparar el desempeño de su estudio contra el período anterior o una meta interna.

No puede:

* comparar su estudio contra otros estudios jurídicos (el ranking entre estudios es exclusivo de la vista Mandante, §17.1);
* cambiar el alcance "ESTUDIO" de su sesión a uno distinto del propio (fijado server-side).

*(Ver `META_MODELO_NEGOCIO.md` §5 para el detalle funcional de estas capacidades analíticas.)*

---

## 17.5 Ejecutivo comercial

Puede:

* visualizar ficha del cliente;
* consultar estado resumido de la causa;
* registrar contactos;
* registrar compromisos;
* informar pagos;
* generar tareas para validación;
* consultar historial comercial.

No puede:

* modificar estados judiciales;
* acceder a documentos reservados;
* aprobar suspensiones;
* modificar cuantía;
* ver estrategia jurídica interna;
* cerrar causas.

---

# 18. Matriz resumida de permisos

| Funcionalidad       | Mandante |       Abogado |  Procurador | Abogado jefe |   Ejecutivo |
| ------------------- | -------: | ------------: | ----------: | -----------: | ----------: |
| Dashboard ejecutivo |       Sí |   Restringido |          No |           Sí | Restringido |
| Ver causas          |  Resumen |            Sí |          Sí |           Sí |     Resumen |
| Editar causa        |       No |            Sí |     Parcial |           Sí |          No |
| Crear tareas        |       No |            Sí |     Parcial |           Sí |    Solo CRM |
| Generar documentos  |       No |            Sí |     Parcial |           Sí |          No |
| Firmar documentos   |       No |            Sí |          No |           Sí |          No |
| Presentar en PJUD   |       No |            Sí | Supervisado |           Sí |          No |
| Registrar gastos    |       No |            Sí |          Sí |           Sí |          No |
| Aprobar gastos      |       No |   Según regla |          No |           Sí |          No |
| Registrar contacto  |       No |            Sí |          Sí |           Sí |          Sí |
| Ver recuperos       |       Sí |            Sí | Restringido |           Sí |     Resumen |
| Cambiar workflow    |       No | Según permiso |          No |           Sí |          No |
| Ranking de estudios |       Sí |             No |          No |            No |          No |
| Drill-down analítico|       Sí |             No |          No |     Solo su estudio |          No |
| Vintage/cohorte     |       Sí |             No |          No |     Solo su estudio |          No |
| Rentabilidad por causa |    Sí |             No |          No |     Solo su estudio |          No |
| Métricas por abogado/procurador | No |            No |          No |           Sí |          No |
| Ver auditoría       |  Resumen |       Parcial |     Parcial |           Sí |          No |

---

# 19. Auditoría

Toda acción relevante debe quedar registrada.

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

* accesos;
* consultas sensibles;
* creación y edición;
* cambios de estado;
* descargas;
* exportaciones;
* firmas;
* acciones de IA;
* presentaciones a PJUD;
* aprobaciones;
* rechazos;
* asignaciones;
* cambios de permisos;
* eliminaciones lógicas.

---

# 20. IA y trazabilidad

La IA nunca debe ejecutar decisiones jurídicas irreversibles sin aprobación.

Cada salida debe guardar:

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

* IA asistiva, no autónoma en decisiones jurídicas críticas;
* fuente documental visible;
* trazabilidad de modelo y versión;
* advertencia cuando exista baja confianza;
* revisión humana;
* protección de datos;
* separación de información por mandante;
* registro de prompts y resultados en entornos controlados.

---

# 21. Catálogos principales

## Procesales

```text
ProcedureType
CaseStage
CaseStatus
CaseSubstatus
CourtType
Court
LegalMatter
JudicialActionType
ResolutionType
NotificationType
AppealType
IncidentType
TerminationReason
```

## Cartera

```text
PortfolioType
ProductType
DebtStatus
GuaranteeType
AssetType
DebtorType
RiskLevel
```

## Operación

```text
TaskType
TaskStatus
Priority
AlertType
DeadlineType
InstructionType
AssignmentType
```

## Financiero

```text
RecoveryType
PaymentStatus
ExpenseCategory
ExpenseStatus
Currency
AllocationType
```

## CRM

```text
Channel
InteractionType
InteractionOutcome
ContactabilityStatus
PaymentPromiseStatus
```

## Documental

```text
DocumentType
DocumentStatus
SignatureStatus
SubmissionStatus
TemplateType
```

---

# 22. Modelo relacional de alto nivel

```text
mandantes
  └── portfolios
        ├── obligations
        │      ├── debtors
        │      └── guarantees
        │
        └── cases
              ├── case_assignments
              ├── workflow_instances
              ├── judicial_actions
              ├── tasks
              ├── deadlines
              ├── documents
              ├── expenses
              ├── recoveries
              ├── interactions
              ├── instructions
              ├── alerts
              └── audit_events
```

---

# 23. Reglas de integridad

1. Una causa debe pertenecer a una cartera y un mandante.
2. Toda causa debe tener al menos un deudor y una obligación.
3. No se puede presentar una demanda sin documentos obligatorios.
4. No se puede cerrar una causa con tareas críticas abiertas, salvo excepción aprobada.
5. Todo recupero debe tener fuente, monto, fecha y estado.
6. Todo gasto debe tener categoría y responsable.
7. Una transición crítica debe registrar usuario, motivo y evidencia.
8. Un pago informado por un ejecutivo no es recupero confirmado hasta su validación.
9. Las recomendaciones de IA no modifican estados por sí mismas.
10. La eliminación física de información judicial no está permitida desde la aplicación.
11. Un usuario no puede consultar información fuera de su ámbito.
12. Toda firma digital debe asociarse a una versión inmutable del documento.
13. Toda presentación a PJUD debe guardar comprobante y resultado.
14. Los indicadores del mandante deben provenir de eventos confirmados, no de borradores.
15. Las causas archivadas permanecen disponibles según la política de retención.
16. El alcance analítico ("ESTUDIO") de un Abogado Jefe se fija server-side al estudio jurídico de su usuario y no es parametrizable desde la UI ni la API; un Abogado Jefe no puede comparar ni consultar datos de un estudio distinto del propio.
17. Las proyecciones analíticas derivadas (rentabilidad por causa, cohortes de recupero) se recalculan únicamente a partir de recuperos y gastos confirmados, nunca de borradores, en línea con la regla 14.

---

# 24. Arquitectura recomendada

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

Cache y coordinación
Redis

Observabilidad
OpenTelemetry + métricas + logs centralizados
```

---

# 25. Resultado funcional

Este modelo permite construir una plataforma donde:

* el mandante evalúa recupero, costo y desempeño;
* el abogado recibe trabajo priorizado;
* el procurador ejecuta diligencias supervisadas;
* el abogado jefe controla riesgos y productividad;
* el ejecutivo comercial registra contactos sin alterar el expediente;
* cada causa sigue un workflow configurable;
* cada evento genera acciones;
* cada acción deja trazabilidad;
* la IA resume, recomienda y genera borradores;
* los recuperos y gastos alimentan indicadores financieros;
* las decisiones críticas conservan supervisión humana.

El siguiente entregable debe transformar este modelo en la **arquitectura UX completa**, con sitemap, navegación por perfil, flujos end-to-end, estructura de cada pantalla, estados vacíos, errores, permisos visibles y comportamiento del prototipo navegable.

