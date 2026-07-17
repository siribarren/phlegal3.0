# LEGALFLOW 360
## Enterprise Product Specification
### Volumen III — Modelo de Dominio, Estados, Eventos y Contratos Base

**Versión:** 1.0  
**Ámbito:** Gestión judicial de cobranza ejecutiva prendaria y no prendaria  
**Cobertura:** Hipotecario, automotriz, FOGAPE, pyme, leasing, créditos de consumo y otras obligaciones con título ejecutivo.

---

# 1. Propósito

Este volumen define el modelo de dominio de LegalFlow 360 bajo principios de Domain-Driven Design (DDD). Su objetivo es establecer una base común para Producto, UX, Frontend, Backend, Arquitectura, Datos y QA, evitando inconsistencias entre pantallas, procesos, reglas de negocio y APIs.

La plataforma se organiza alrededor de cinco ejes:

1. **Mandantes y carteras**: quién encomienda la gestión y qué universo de deuda entrega.
2. **Deudores, obligaciones y garantías**: qué se cobra y con qué respaldo patrimonial.
3. **Causas y actuaciones judiciales**: cómo evoluciona el proceso judicial.
4. **Tareas, documentos, comunicaciones y gastos**: qué trabajo ejecuta el estudio.
5. **Recuperos, rentabilidad y desempeño**: qué resultado económico obtiene el mandante y el estudio.

---

# 2. Lenguaje ubicuo

Los siguientes términos deben utilizarse de manera consistente en diseño, código, documentación y analítica.

| Término | Definición |
|---|---|
| Mandante | Institución que encarga al estudio la gestión judicial de una deuda. |
| Estudio | Firma jurídica responsable de tramitar una o más carteras. |
| Cartera | Conjunto de deudas asignadas por un mandante bajo reglas comunes. |
| Asignación | Entrega formal de una deuda al estudio para gestión. |
| Deudor | Persona natural o jurídica obligada al pago. |
| Obligación | Deuda exigible asociada a un producto financiero o contractual. |
| Cuantía | Monto económico judicialmente perseguido en una causa. |
| Garantía | Bien o respaldo jurídico asociado a una obligación. |
| Causa | Expediente judicial individualizado por tribunal, rol y materia. |
| Actuación | Evento procesal ejecutado por una parte, receptor o tribunal. |
| Gestión | Acción operativa o jurídica realizada por un usuario. |
| Hito | Evento relevante dentro del ciclo judicial. |
| Estado procesal | Etapa principal en que se encuentra la causa. |
| Subestado | Nivel de detalle operativo dentro de un estado procesal. |
| Plazo | Fecha o período asociado a una obligación procesal u operativa. |
| Recupero | Monto efectivamente recuperado por pago, dación, venta, remate u otra vía. |
| Gasto judicial | Costo atribuible a una causa: receptor, publicaciones, viajes, custodia u otros. |
| Rentabilidad | Relación entre recupero, cuantía y gastos asociados. |
| SLA | Compromiso de tiempo o calidad acordado con el mandante. |
| Novedad | Evento nuevo que requiere conocimiento o acción. |
| Tarea | Unidad de trabajo asignable, con responsable, prioridad y vencimiento. |
| Instrucción | Acción solicitada por un abogado jefe o responsable de cartera. |
| Evento de dominio | Hecho relevante que modifica el estado del sistema o dispara automatizaciones. |

---

# 3. Bounded Contexts

## 3.1. Contexto de Identidad y Acceso

Responsable de usuarios, organizaciones, roles, permisos, delegaciones, sesiones y trazabilidad de acceso.

**Agregados principales:**
- Organization
- User
- Role
- PermissionSet
- Team
- Delegation

## 3.2. Contexto de Mandantes y Carteras

Administra mandantes, contratos, carteras, asignaciones, segmentos, SLA y reglas de negocio específicas.

**Agregados principales:**
- ClientOrganization
- Portfolio
- AssignmentBatch
- Assignment
- ServiceLevelAgreement
- PortfolioPolicy

## 3.3. Contexto de Deudores y Obligaciones

Concentra identidad del deudor, contactos, obligaciones, saldos, productos, garantías y relaciones entre obligados.

**Agregados principales:**
- Debtor
- ContactPoint
- Obligation
- BalanceSnapshot
- Guarantee
- Asset
- RelatedParty

## 3.4. Contexto Judicial

Gestiona causas, tribunales, roles, estados procesales, actuaciones, resoluciones, plazos y estrategia jurídica.

**Agregados principales:**
- LegalCase
- Court
- ProceduralStage
- CourtAction
- CourtResolution
- LegalDeadline
- CaseStrategy

## 3.5. Contexto de Trabajo y Workflow

Orquesta tareas, instrucciones, colas, reglas, escalamiento, alertas y automatizaciones.

**Agregados principales:**
- WorkItem
- Task
- Instruction
- WorkflowInstance
- WorkflowDefinition
- EscalationRule

## 3.6. Contexto Documental

Controla plantillas, documentos, versiones, firma, envío, presentación PJUD, OCR y custodia.

**Agregados principales:**
- Document
- DocumentVersion
- DocumentTemplate
- SignatureRequest
- FilingSubmission
- OCRResult
- CustodyRecord

## 3.7. Contexto CRM y Contactabilidad

Registra interacciones con deudores, mandantes, receptores, terceros y ejecutivos comerciales.

**Agregados principales:**
- ContactHistory
- Interaction
- PromiseToPay
- CommunicationCampaign
- ChannelIdentity

## 3.8. Contexto Financiero

Administra gastos, recuperos, pagos, imputaciones, liquidaciones, rentabilidad y conciliación.

**Agregados principales:**
- Expense
- Recovery
- Payment
- PaymentAllocation
- Settlement
- ProfitabilitySnapshot

## 3.9. Contexto de Analítica y Desempeño

Consolida métricas, indicadores, rankings, cohortes, SLA y proyecciones.

**Agregados principales:**
- KPIRecord
- PerformanceSnapshot
- LawFirmRanking
- PortfolioForecast

## 3.10. Contexto de Auditoría y Cumplimiento

Registra cambios, accesos, acciones críticas, evidencias y eventos regulatorios.

**Agregados principales:**
- AuditEvent
- Evidence
- ComplianceControl
- AccessReview

## 3.11. Contexto de Inteligencia Artificial

Genera resúmenes, sugerencias, clasificación, priorización, borradores y explicaciones con trazabilidad.

**Agregados principales:**
- AIInsight
- AISuggestion
- AIConversation
- AIExecution
- ModelPolicy

---

# 4. Jerarquía de dominio

```text
Mandante
└── Contrato de servicio
    └── Cartera
        └── Lote de asignación
            └── Asignación
                ├── Deudor
                │   ├── Datos de contacto
                │   ├── Obligaciones
                │   ├── Bienes
                │   └── Garantías
                └── Causa
                    ├── Estado procesal
                    ├── Actuaciones
                    ├── Resoluciones
                    ├── Plazos
                    ├── Tareas
                    ├── Documentos
                    ├── CRM
                    ├── Gastos
                    ├── Recuperos
                    └── Auditoría
```

---

# 5. Entidades principales

## 5.1. Organization

Representa una organización usuaria de la plataforma.

**Atributos:**
- id
- legalName
- tradeName
- taxId
- organizationType: `LAW_FIRM | CLIENT | SERVICE_PROVIDER | COURT_RELATED`
- status
- countryCode
- timezone
- createdAt
- updatedAt

## 5.2. User

**Atributos:**
- id
- organizationId
- firstName
- lastName
- email
- phone
- roleIds[]
- teamIds[]
- licenseNumber
- active
- lastLoginAt
- preferences

## 5.3. ClientOrganization

Mandante que asigna carteras.

**Atributos:**
- id
- organizationId
- clientCode
- industry
- contactOwners[]
- reportingFrequency
- contractualKpis[]
- defaultCurrency

## 5.4. Portfolio

**Atributos:**
- id
- clientOrganizationId
- name
- code
- portfolioType
- productTypes[]
- securedType: `SECURED | UNSECURED | MIXED`
- startDate
- endDate
- status
- assignedAmount
- assignmentCount
- slaId
- policyId

## 5.5. AssignmentBatch

Lote mensual o periódico remitido por el mandante.

**Atributos:**
- id
- portfolioId
- externalReference
- receivedAt
- recordCount
- totalPrincipal
- totalClaimAmount
- sourceFileId
- validationStatus
- ingestionStatus

## 5.6. Assignment

Vincula una obligación con el estudio.

**Atributos:**
- id
- batchId
- portfolioId
- debtorId
- obligationIds[]
- externalCaseReference
- assignmentDate
- assignedClaimAmount
- responsibleTeamId
- responsibleLawyerId
- status
- closureReason

## 5.7. Debtor

**Atributos:**
- id
- debtorType: `PERSON | COMPANY`
- taxId
- legalName
- firstName
- lastName
- dateOfBirth
- incorporationDate
- riskSegment
- deceased
- insolvencyStatus
- contactabilityScore
- dataQualityScore

## 5.8. ContactPoint

**Atributos:**
- id
- debtorId
- type: `PHONE | EMAIL | ADDRESS | WHATSAPP`
- value
- normalizedValue
- verificationStatus
- preferred
- consentStatus
- source
- lastVerifiedAt

## 5.9. Obligation

**Atributos:**
- id
- debtorId
- portfolioId
- contractNumber
- productType
- originalPrincipal
- outstandingPrincipal
- interest
- fees
- totalDebt
- currency
- delinquencyStartDate
- maturityDate
- executiveTitleType
- titleCustodyStatus
- status

## 5.10. Guarantee

**Atributos:**
- id
- obligationId
- guaranteeType: `MORTGAGE | PLEDGE | GUARANTOR | FOGAPE | OTHER`
- assetId
- priorityRank
- appraisedValue
- appraisalDate
- registryData
- enforceabilityStatus

## 5.11. Asset

**Atributos:**
- id
- ownerDebtorId
- assetType: `VEHICLE | REAL_ESTATE | EQUIPMENT | ACCOUNT | OTHER`
- description
- registrationNumber
- estimatedValue
- location
- encumbrances[]
- seizureStatus
- liquidationStatus

## 5.12. LegalCase

Agregado central del contexto judicial.

**Atributos:**
- id
- assignmentId
- courtId
- jurisdiction
- caseRole
- filingYear
- caseType
- procedureType
- claimAmount
- currency
- filingDate
- admissionDate
- currentStage
- currentSubstage
- status
- riskLevel
- priority
- responsibleLawyerId
- responsibleProcuratorIds[]
- strategyId
- nextDeadlineAt
- lastCourtMovementAt
- lastInternalMovementAt
- closureDate
- closureReason

**Invariantes:**
- Una causa no puede pasar a `FILED` sin demanda y título ejecutivo validados.
- Una causa no puede pasar a `NOTIFIED` sin actuación de notificación válida.
- Una causa cerrada no admite nuevas actuaciones salvo reapertura autorizada.
- Toda modificación crítica debe generar auditoría.

## 5.13. Court

**Atributos:**
- id
- name
- courtType
- jurisdiction
- commune
- region
- pjudCode
- address
- contactData

## 5.14. CourtAction

**Atributos:**
- id
- legalCaseId
- actionType
- performedByType
- performedById
- actionDate
- filedAt
- source
- description
- result
- relatedDocumentIds[]
- courtReference
- createsDeadline
- generatedDeadlineId

## 5.15. CourtResolution

**Atributos:**
- id
- legalCaseId
- resolutionDate
- resolutionType
- summary
- fullTextDocumentId
- source
- requiresAction
- actionDueAt
- aiClassification
- aiConfidence

## 5.16. LegalDeadline

**Atributos:**
- id
- legalCaseId
- sourceType
- sourceId
- deadlineType
- startsAt
- dueAt
- businessCalendarId
- riskColor: `GREEN | YELLOW | RED | OVERDUE`
- status
- ownerId
- completedAt

## 5.17. CaseStrategy

**Atributos:**
- id
- legalCaseId
- objective
- recoveryPath
- targetRecoveryAmount
- costCeiling
- recommendedActions[]
- restrictions[]
- approvedBy
- approvedAt

## 5.18. Task

**Atributos:**
- id
- legalCaseId
- taskType
- title
- description
- assigneeId
- creatorId
- source: `MANUAL | WORKFLOW | AI | COURT_EVENT | CRM_EVENT`
- priority
- urgencyScore
- dueAt
- status
- blockedReason
- completionEvidenceIds[]
- parentTaskId

## 5.19. Instruction

**Atributos:**
- id
- legalCaseId
- issuedById
- assignedToId
- instructionType
- text
- expectedOutcome
- dueAt
- status
- acknowledgedAt
- completedAt

## 5.20. WorkflowDefinition

**Atributos:**
- id
- name
- caseType
- version
- states[]
- transitions[]
- rules[]
- active

## 5.21. WorkflowInstance

**Atributos:**
- id
- legalCaseId
- definitionId
- definitionVersion
- currentState
- startedAt
- completedAt
- variables
- transitionHistory[]

## 5.22. Document

**Atributos:**
- id
- legalCaseId
- documentType
- title
- status
- confidentialityLevel
- currentVersionId
- source
- generatedByAI
- signed
- filed
- storageUri
- checksum

## 5.23. DocumentVersion

**Atributos:**
- id
- documentId
- versionNumber
- fileName
- mimeType
- sizeBytes
- createdBy
- createdAt
- changeReason
- checksum

## 5.24. DocumentTemplate

**Atributos:**
- id
- name
- documentType
- caseTypes[]
- variables[]
- templateBody
- validationRules[]
- activeVersion

## 5.25. SignatureRequest

**Atributos:**
- id
- documentId
- signerIds[]
- signatureProvider
- status
- requestedAt
- expiresAt
- signedAt
- evidenceId

## 5.26. FilingSubmission

**Atributos:**
- id
- legalCaseId
- documentIds[]
- submissionType
- targetSystem: `PJUD`
- status
- queuedAt
- submittedAt
- externalReceipt
- rejectionReason
- supervisedById

## 5.27. Interaction

**Atributos:**
- id
- legalCaseId
- debtorId
- channel
- direction
- participantIds[]
- occurredAt
- outcome
- summary
- recordingUri
- relatedPromiseId
- createdBy

## 5.28. PromiseToPay

**Atributos:**
- id
- legalCaseId
- debtorId
- promisedAmount
- promisedDate
- installments[]
- status
- sourceInteractionId
- brokenAt
- fulfilledAt

## 5.29. Expense

**Atributos:**
- id
- legalCaseId
- expenseType
- supplierId
- amount
- currency
- incurredAt
- approvalStatus
- invoiceDocumentId
- recoverableFromClient
- reimbursedAt

## 5.30. Recovery

**Atributos:**
- id
- legalCaseId
- recoveryType: `PAYMENT | AUCTION | DATION | ASSET_SALE | SETTLEMENT | OTHER`
- grossAmount
- netAmount
- currency
- recoveryDate
- sourceReference
- paymentId
- approved
- reversed

## 5.31. Payment

**Atributos:**
- id
- debtorId
- legalCaseId
- amount
- currency
- paymentDate
- paymentMethod
- bankReference
- proofDocumentId
- reconciliationStatus
- allocationStatus

## 5.32. AuditEvent

**Atributos:**
- id
- organizationId
- actorId
- action
- entityType
- entityId
- occurredAt
- sourceIp
- before
- after
- correlationId
- reason
- critical

## 5.33. AIInsight

**Atributos:**
- id
- contextType
- contextId
- insightType
- title
- summary
- severity
- confidence
- supportingEvidenceIds[]
- generatedAt
- expiresAt
- acceptedBy
- dismissedBy

## 5.34. CaseProfitabilitySnapshot (proyección derivada, solo lectura)

Vista agregada para la analítica de rentabilidad por causa (`META_MODELO_NEGOCIO.md` §3.4, §6). Se recalcula a partir de `Expense` (§5.29) y `Recovery` (§5.30) agregados por `caseId`; no es fuente de verdad y no admite escritura directa.

**Atributos:**
- caseId
- claimAmount
- accumulatedExpense
- confirmedRecovery
- margin
- profitabilityRatio
- asOfDate

## 5.35. RecoveryCohortSnapshot (proyección derivada, solo lectura)

Vista agregada para las tablas vintage/cohorte de recupero (`META_MODELO_NEGOCIO.md` §3.2, §6). Se recalcula a partir de `Recovery` (§5.30) en estado confirmado, agregado por camada de `Assignment`/`Portfolio` (§5.5-§5.6); no es fuente de verdad y no admite escritura directa.

**Atributos:**
- cohortKey (mes de originación)
- scopeType (MANDANTE | ESTUDIO)
- scopeId
- monthsSinceOrigination
- cumulativeRecoveryAmount
- cumulativeRecoveryRate
- asOfDate

---

# 6. Máquina de estados de la causa

## 6.1. Estados principales

```text
ASSIGNED
  ↓
PREPARATION
  ↓
READY_TO_FILE
  ↓
FILED
  ↓
ADMITTED
  ↓
PENDING_NOTIFICATION
  ↓
NOTIFIED
  ↓
ENFORCEMENT
  ↓
SEIZURE
  ↓
LIQUIDATION
  ↓
AUCTION_OR_SALE
  ↓
RECOVERY
  ↓
CLOSED
```

Estados transversales:

- `SUSPENDED`
- `ARCHIVED`
- `REJECTED`
- `WITHDRAWN`
- `INSOLVENCY_PROCEEDING`
- `PRESCRIPTION_RISK`

## 6.2. Subestados sugeridos

### ASSIGNED
- Pendiente validación
- Información incompleta
- Título pendiente
- Lista para análisis

### PREPARATION
- Revisión de antecedentes
- Validación de competencia
- Validación de cuantía
- Revisión de garantía
- Estrategia pendiente

### READY_TO_FILE
- Demanda generada
- Firma pendiente
- Documentos completos
- Esperando presentación

### FILED
- Presentación enviada
- Recepción PJUD pendiente
- Observada
- Reingreso requerido

### ADMITTED
- Proveída favorablemente
- Subsanación requerida
- Mandamiento pendiente

### PENDING_NOTIFICATION
- Receptor por asignar
- Receptor asignado
- Domicilio por validar
- Primer intento
- Segundo intento
- Notificación frustrada

### NOTIFIED
- Requerimiento efectuado
- Oposición pendiente
- Excepciones interpuestas
- Plazo de defensa vigente

### ENFORCEMENT
- Solicitud de embargo
- Búsqueda de bienes
- Oficios pendientes
- Medidas cautelares

### SEIZURE
- Bien identificado
- Embargo decretado
- Embargo practicado
- Tercería

### LIQUIDATION
- Liquidación solicitada
- Liquidación emitida
- Impugnada
- Ejecutoriada

### AUCTION_OR_SALE
- Tasación pendiente
- Bases de remate
- Publicaciones
- Remate programado
- Remate suspendido
- Remate realizado

### RECOVERY
- Pago parcial
- Pago total
- Dación
- Venta directa
- Adjudicación
- Imputación pendiente

### CLOSED
- Pago total
- Castigo
- Prescripción
- Inubicable
- Insolvencia
- Acuerdo extrajudicial
- Desistimiento
- Sin bienes

---

# 7. Reglas de transición

| Desde | Hacia | Condición mínima |
|---|---|---|
| ASSIGNED | PREPARATION | Asignación validada y responsable definido. |
| PREPARATION | READY_TO_FILE | Título ejecutivo, deuda y competencia validados. |
| READY_TO_FILE | FILED | Documento firmado y presentación confirmada. |
| FILED | ADMITTED | Resolución que provee la demanda. |
| ADMITTED | PENDING_NOTIFICATION | Mandamiento o resolución habilitante disponible. |
| PENDING_NOTIFICATION | NOTIFIED | Evidencia válida de notificación. |
| NOTIFIED | ENFORCEMENT | Vencimiento de plazo o resolución habilitante. |
| ENFORCEMENT | SEIZURE | Bien identificado y embargo decretado/practicado. |
| SEIZURE | LIQUIDATION | Bien asegurado y liquidación procedente. |
| LIQUIDATION | AUCTION_OR_SALE | Liquidación firme y bien disponible. |
| AUCTION_OR_SALE | RECOVERY | Ingreso económico o adjudicación confirmada. |
| RECOVERY | CLOSED | Saldo final, gastos e imputaciones conciliados. |

Toda transición debe registrar:

- actor;
- fecha y hora;
- estado anterior;
- estado nuevo;
- motivo;
- evidencia;
- reglas evaluadas;
- tareas generadas;
- eventos publicados.

---

# 8. Catálogos maestros

## 8.1. Tipos de causa

```json
[
  {"code":"EXECUTIVE_COLLECTION","label":"Cobranza ejecutiva"},
  {"code":"MORTGAGE_ENFORCEMENT","label":"Ejecución hipotecaria"},
  {"code":"PLEDGE_ENFORCEMENT","label":"Ejecución prendaria"},
  {"code":"FOGAPE_COLLECTION","label":"Cobranza FOGAPE"},
  {"code":"INSOLVENCY_CLAIM","label":"Verificación en insolvencia"}
]
```

## 8.2. Tipos de producto

```json
[
  "CONSUMER_LOAN",
  "MORTGAGE_LOAN",
  "AUTO_LOAN",
  "LEASING",
  "FOGAPE",
  "SME_LOAN",
  "CREDIT_CARD",
  "CURRENT_ACCOUNT",
  "OTHER"
]
```

## 8.3. Prioridades

```json
[
  {"code":"CRITICAL","weight":100,"color":"red"},
  {"code":"HIGH","weight":75,"color":"orange"},
  {"code":"MEDIUM","weight":50,"color":"yellow"},
  {"code":"LOW","weight":25,"color":"green"}
]
```

## 8.4. Estado de plazo

```json
[
  {"code":"ON_TIME","label":"En plazo","color":"green"},
  {"code":"AT_RISK","label":"Próximo a vencer","color":"yellow"},
  {"code":"DUE_TODAY","label":"Vence hoy","color":"orange"},
  {"code":"OVERDUE","label":"Vencido","color":"red"}
]
```

## 8.5. Tipos de recupero

```json
[
  "DIRECT_PAYMENT",
  "INSTALLMENT_PAYMENT",
  "DATION_IN_PAYMENT",
  "AUCTION",
  "ASSET_SALE",
  "SETTLEMENT",
  "ADJUDICATION",
  "OTHER"
]
```

---

# 9. Roles y permisos

## 9.1. Mandante

**Puede:**
- visualizar dashboard ejecutivo;
- consultar ranking de estudios;
- revisar KPIs, SLA, recuperos, gastos y rentabilidad;
- usar asistente IA ejecutivo;
- exportar reportes agregados;
- navegar por drill-down (consolidado → mandante/cartera → segmento → causa) sin perder filtros de período;
- consultar `RecoveryCohortSnapshot` (tablas vintage/cohorte por camada de originación, §5.35);
- consultar `CaseProfitabilitySnapshot` por causa individual (§5.34);
- consultar vista ejecutiva comparativa de estado total de causas por estudio y por fecha.

**No puede:**
- editar causas;
- visualizar estrategia jurídica sensible;
- acceder a documentos internos del estudio;
- asignar tareas operativas.

## 9.2. Abogado

**Puede:**
- visualizar y gestionar causas asignadas;
- crear actuaciones, tareas y documentos;
- aprobar documentos generados por IA;
- firmar y presentar documentos;
- registrar gastos y recuperos;
- instruir procuradores dentro de su ámbito.

## 9.3. Procurador

**Puede:**
- ejecutar tareas asignadas;
- registrar actuaciones, contactos y evidencias;
- gestionar receptores y diligencias;
- preparar documentos sin aprobación final.

**No puede:**
- modificar estrategia;
- cerrar causas;
- aprobar recuperos;
- firmar documentos, salvo mandato expreso.

## 9.4. Abogado jefe

Hereda permisos de abogado y agrega:
- visualizar equipo completo;
- redistribuir causas y tareas;
- definir prioridades;
- aprobar estrategia;
- gestionar SLA;
- revisar productividad;
- acceder a alertas globales;
- consultar las mismas métricas ejecutivas, `RecoveryCohortSnapshot` (§5.35) y `CaseProfitabilitySnapshot` (§5.34) que el Mandante (§9.1), con `scopeType: "ESTUDIO"` fijado server-side a su propio estudio;
- consultar métricas desagregadas por abogado y por procurador de su equipo (carga, productividad, SLA individual, recupero atribuido);
- comparar su estudio contra el período anterior o una meta interna.

**No puede:**
- consultar ranking de estudios ni comparar contra otro `estudioId` distinto del propio.

## 9.5. Ejecutivo comercial

**Puede:**
- consultar clientes y causas vinculadas a su cartera;
- registrar contactos y compromisos;
- informar pagos o antecedentes;
- gatillar solicitudes al equipo legal.

**No puede:**
- modificar estados judiciales;
- crear escritos;
- acceder a información jurídica reservada.

## 9.6. Administrador

- configura catálogos;
- administra usuarios y permisos;
- define workflows;
- parametriza SLA;
- gestiona integraciones;
- accede a auditoría.

---

# 10. Eventos de dominio

## 10.1. Eventos de cartera

- `PortfolioCreated`
- `AssignmentBatchReceived`
- `AssignmentValidated`
- `AssignmentRejected`
- `CaseAssignedToTeam`

## 10.2. Eventos judiciales

- `CaseCreated`
- `CaseFiled`
- `CaseAdmitted`
- `CourtResolutionReceived`
- `DebtorNotified`
- `SeizureRequested`
- `SeizureCompleted`
- `AuctionScheduled`
- `AuctionSuspended`
- `CaseClosed`

## 10.3. Eventos de tareas

- `TaskCreated`
- `TaskAssigned`
- `TaskDueSoon`
- `TaskOverdue`
- `TaskCompleted`
- `InstructionIssued`

## 10.4. Eventos financieros

- `PaymentReceived`
- `PaymentMatched`
- `RecoveryRecorded`
- `ExpenseSubmitted`
- `ExpenseApproved`
- `ProfitabilityThresholdExceeded`

## 10.5. Eventos documentales

- `DocumentGenerated`
- `DocumentApproved`
- `DocumentSigned`
- `FilingQueued`
- `FilingSubmitted`
- `FilingRejected`

## 10.6. Eventos CRM

- `InteractionLogged`
- `PromiseToPayCreated`
- `PromiseToPayBroken`
- `CustomerPaymentReported`

## 10.7. Eventos IA

- `AIInsightGenerated`
- `AISuggestionAccepted`
- `AISuggestionRejected`
- `AIDocumentDraftGenerated`

---

# 11. Automatizaciones críticas

## 11.1. Resolución judicial recibida

```text
Resolución recibida
→ clasificar con IA
→ identificar acción requerida
→ calcular plazo
→ crear tarea
→ asignar responsable
→ actualizar timeline
→ emitir alerta
→ registrar auditoría
```

## 11.2. Pago informado

```text
Pago informado
→ validar comprobante
→ conciliar referencia
→ imputar obligación
→ registrar recupero
→ recalcular saldo
→ evaluar suspensión de remate
→ crear tarea jurídica
→ notificar equipo
→ actualizar dashboard mandante
```

## 11.3. Tarea próxima a vencer

```text
72 horas antes
→ alerta amarilla
24 horas antes
→ alerta naranja
vencimiento
→ alerta roja
+4 horas
→ escalar a abogado jefe
```

## 11.4. Causa sin movimiento

```text
Sin movimiento judicial > umbral
→ crear insight IA
→ sugerir acción
→ priorizar en Mi Escritorio
→ incluir en reporte de riesgo
```

---

# 12. Modelo relacional resumido

```text
organizations 1---n users
organizations 1---n client_organizations
client_organizations 1---n portfolios
portfolios 1---n assignment_batches
assignment_batches 1---n assignments
assignments n---1 debtors
assignments 1---n obligations
obligations 1---n guarantees
guarantees n---1 assets
assignments 1---n legal_cases
legal_cases n---1 courts
legal_cases 1---n court_actions
legal_cases 1---n court_resolutions
legal_cases 1---n legal_deadlines
legal_cases 1---n tasks
legal_cases 1---n documents
legal_cases 1---n interactions
legal_cases 1---n expenses
legal_cases 1---n recoveries
legal_cases 1---n audit_events
```

---

# 13. Contratos JSON base

## 13.1. LegalCaseResponse

```json
{
  "id": "case_01JZ8X",
  "assignmentId": "asg_01JZ7Q",
  "mandante": {
    "id": "client_santander",
    "name": "Banco Ejemplo"
  },
  "portfolio": {
    "id": "portfolio_auto_2026",
    "name": "Automotriz Castigada 2026"
  },
  "debtor": {
    "id": "debtor_100238",
    "taxId": "12.345.678-9",
    "displayName": "Transportes del Sur SpA"
  },
  "court": {
    "id": "court_22civil_stgo",
    "name": "22° Juzgado Civil de Santiago"
  },
  "caseRole": "C-1842-2026",
  "caseType": "PLEDGE_ENFORCEMENT",
  "claimAmount": 42850000,
  "currency": "CLP",
  "currentStage": "PENDING_NOTIFICATION",
  "currentSubstage": "RECEIVER_ASSIGNED",
  "riskLevel": "HIGH",
  "priority": "CRITICAL",
  "responsibleLawyer": {
    "id": "usr_101",
    "name": "Felipe Rojas"
  },
  "nextDeadlineAt": "2026-07-14T18:00:00-04:00",
  "lastCourtMovementAt": "2026-07-09T10:25:00-04:00",
  "recovery": {
    "gross": 0,
    "net": 0,
    "percentageOfClaim": 0
  },
  "expenses": {
    "approved": 485000,
    "pending": 120000
  },
  "aiSummary": {
    "summary": "La causa está en etapa de notificación. El receptor fue asignado hace 5 días y aún no registra resultado.",
    "recommendedActions": [
      "Contactar receptor judicial",
      "Validar domicilio alternativo",
      "Escalar si no existe gestión en 24 horas"
    ],
    "confidence": 0.92
  }
}
```

## 13.2. CreateTaskRequest

```json
{
  "legalCaseId": "case_01JZ8X",
  "taskType": "CONTACT_RECEIVER",
  "title": "Contactar receptor judicial",
  "description": "Solicitar estado de la diligencia de notificación.",
  "assigneeId": "usr_205",
  "priority": "HIGH",
  "dueAt": "2026-07-11T12:00:00-04:00",
  "source": "MANUAL"
}
```

## 13.3. RecordInteractionRequest

```json
{
  "legalCaseId": "case_01JZ8X",
  "debtorId": "debtor_100238",
  "channel": "PHONE",
  "direction": "OUTBOUND",
  "occurredAt": "2026-07-10T11:40:00-04:00",
  "outcome": "CONTACTED",
  "summary": "Cliente informa que realizará pago parcial el 15 de julio.",
  "promiseToPay": {
    "promisedAmount": 5000000,
    "promisedDate": "2026-07-15"
  }
}
```

## 13.4. RecordRecoveryRequest

```json
{
  "legalCaseId": "case_01JZ8X",
  "recoveryType": "DIRECT_PAYMENT",
  "grossAmount": 5000000,
  "netAmount": 5000000,
  "currency": "CLP",
  "recoveryDate": "2026-07-15",
  "sourceReference": "TRX-984211",
  "proofDocumentId": "doc_8841"
}
```

---

# 14. API inicial

## Causas

- `GET /api/v1/cases`
- `GET /api/v1/cases/{caseId}`
- `POST /api/v1/cases`
- `PATCH /api/v1/cases/{caseId}`
- `POST /api/v1/cases/{caseId}/transition`
- `GET /api/v1/cases/{caseId}/timeline`
- `GET /api/v1/cases/{caseId}/summary`

## Tareas

- `GET /api/v1/tasks/my-day`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/{taskId}`
- `POST /api/v1/tasks/{taskId}/complete`
- `POST /api/v1/tasks/{taskId}/reassign`

## Documentos

- `POST /api/v1/documents/generate`
- `POST /api/v1/documents/upload`
- `POST /api/v1/documents/{documentId}/approve`
- `POST /api/v1/documents/{documentId}/sign`
- `POST /api/v1/filings`

## CRM

- `GET /api/v1/debtors/{debtorId}/interactions`
- `POST /api/v1/interactions`
- `POST /api/v1/promises-to-pay`

## Finanzas

- `POST /api/v1/expenses`
- `POST /api/v1/recoveries`
- `POST /api/v1/payments/reconcile`
- `GET /api/v1/cases/{caseId}/profitability`

## Dashboard

- `GET /api/v1/executive-dashboard`
- `GET /api/v1/law-firms/ranking`
- `GET /api/v1/portfolios/{portfolioId}/performance`

## IA

- `GET /api/v1/ai/cases/{caseId}/summary`
- `POST /api/v1/ai/cases/{caseId}/ask`
- `POST /api/v1/ai/documents/generate`
- `POST /api/v1/ai/suggestions/{suggestionId}/accept`

---

# 15. Casos de uso prioritarios

## UC-01 — Revisar trabajo diario

**Actor:** Abogado / Procurador  
**Resultado:** Lista priorizada de tareas, alertas y novedades con acceso directo a la acción.

## UC-02 — Gestionar una causa

**Actor:** Abogado  
**Resultado:** Revisar resumen IA, estado, plazo, actuaciones y ejecutar siguiente acción.

## UC-03 — Generar escrito con IA

**Actor:** Abogado  
**Resultado:** Crear borrador desde plantilla, revisar, aprobar, firmar y presentar.

## UC-04 — Registrar gestión de receptor

**Actor:** Procurador  
**Resultado:** Registrar contacto, resultado, evidencia y siguiente tarea.

## UC-05 — Informar pago y detener remate

**Actor:** Ejecutivo comercial / Abogado  
**Resultado:** Registrar pago, validar, generar alerta y activar workflow de suspensión.

## UC-06 — Evaluar desempeño del estudio

**Actor:** Mandante  
**Resultado:** Revisar recupero, cuantía, gastos, SLA, rentabilidad y ranking.

## UC-07 — Redistribuir carga de trabajo

**Actor:** Abogado jefe  
**Resultado:** Detectar saturación, reasignar tareas y balancear cartera.

---

# 16. Criterios no funcionales base

- Disponibilidad objetivo: 99,9% mensual.
- Trazabilidad de acciones críticas: 100%.
- Cifrado en tránsito y reposo.
- Control de acceso por organización, cartera, equipo y causa.
- Auditoría inmutable para firma, presentación, cambio de estado y recupero.
- Tiempo de respuesta p95 para consultas operativas: menor a 2 segundos.
- Búsqueda global: menor a 3 segundos sobre cartera completa.
- Procesos masivos idempotentes y reanudables.
- Integraciones desacopladas mediante eventos y colas.
- Soporte de retención documental configurable por mandante.
- IA con evidencia, nivel de confianza, historial de generación y aprobación humana.

---

# 17. Decisiones de arquitectura

1. **Arquitectura modular por dominios**, no por pantallas.
2. **Modelo multi-tenant** con aislamiento lógico y controles por mandante.
3. **Motor de workflow versionado** para soportar diferencias por cartera y producto.
4. **Arquitectura orientada a eventos** para notificaciones, IA, PJUD y analítica.
5. **Read models especializados** para dashboard, Mi Escritorio y búsquedas.
6. **Almacenamiento documental desacoplado** del modelo transaccional.
7. **Auditoría append-only** para eventos críticos.
8. **Human-in-the-loop** obligatorio para generación documental y presentaciones.

---

# 18. Definition of Done del modelo de dominio

El modelo se considera validado cuando:

- cada pantalla se vincula a una entidad o caso de uso;
- cada estado posee reglas de entrada y salida;
- cada transición genera auditoría;
- cada KPI tiene fuente de datos definida;
- cada rol tiene permisos explícitos;
- cada automatización tiene evento disparador;
- cada documento tiene ciclo de vida y responsable;
- cada recupero y gasto se asocia a una causa;
- cada insight IA mantiene evidencia y aprobación humana;
- UX, Backend y QA utilizan los mismos catálogos y nombres.

---

# 19. Próximo volumen recomendado

**Volumen IV — Arquitectura UX y especificación de pantallas**, con:

- sitemap por perfil;
- navegación global y contextual;
- flujos end-to-end;
- inventario completo de pantallas;
- wireframes textuales;
- estados vacíos, errores y carga;
- comportamiento responsive;
- permisos visibles en interfaz;
- criterios de aceptación por pantalla;
- prompt consolidado para Figma Make.

