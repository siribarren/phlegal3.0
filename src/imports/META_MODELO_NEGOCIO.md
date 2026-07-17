# LegalFlow 360 — Meta-modelo de alto nivel y flujo de negocio

## 0. Propósito de este documento

Los cuatro documentos existentes (`arquitectura_funcional.md`, `CRM_Judicial_3_0_Especificacion_Maestra.md`, `LegalFlow360_Respuestas_Consolidadas.md`, `LegalFlow360_Volumen_III_Modelo_Dominio_DDD.md`) contienen el detalle funcional, técnico y de dominio del producto, pero ninguno ofrece una vista única de alto nivel que conecte **flujo de negocio → roles → vistas → métricas**. Este documento cumple ese rol de mapa maestro: no reemplaza el detalle de los otros documentos, lo organiza y le agrega los requerimientos nuevos de las vistas ejecutivas (Mandante y Abogado Jefe) definidos el 2026-07-13.

Este documento es la referencia autoritativa para responder "¿qué debe ver cada rol y por qué?". El detalle de entidades, estados y contratos sigue viviendo en `LegalFlow360_Volumen_III_Modelo_Dominio_DDD.md`.

---

## 1. Flujo de negocio de extremo a extremo

```text
MANDANTE                ESTUDIO JURÍDICO                          RESULTADO
  │                            │                                       │
  ├─ Asigna cartera ───────────▶ Ingreso y validación de cartera        │
  │                            │        │                              │
  │                            ▼        ▼                              │
  │                     Asignación a equipo (Abogado Jefe → Abogado/Procurador)
  │                            │
  │                            ▼
  │                     Workflow judicial (Notificación → Embargo → Liquidación → Remate/Dación)
  │                            │        │
  │                            │        ├─ Documentos y firma electrónica
  │                            │        ├─ Actuaciones y resoluciones (PJUD)
  │                            │        └─ Tareas priorizadas (SLA, urgencia)
  │                            ▼
  │                     Cobranza y negociación (Ejecutivo) ──▶ Compromisos de pago
  │                            │
  │                            ▼
  │                     Pago informado ──▶ Conciliación ──▶ Recupero confirmado
  │                            │
  │                            ▼
  │                     Gastos judiciales (solicitud → aprobación → rendición)
  │                            │
  │                            ▼
  ◀────────────────────  Reportería y analítica  ─────────────────────▶
  │                            │
  ▼                            ▼
Vista Mandante          Vista Abogado Jefe / Gerencial
(lectura, sin edición)  (lectura + gestión de su equipo)
```

**Principio de diseño**: el flujo de negocio es uno solo (cartera → causa → gestión → recupero → gasto → reporte); lo que cambia por rol es el **alcance de datos** (scope) y el **modo de interacción** (lectura ejecutiva vs. operación diaria). Las vistas de Mandante y Abogado Jefe descritas abajo son la misma capa analítica con dos alcances distintos, no dos productos separados — deben construirse sobre un único motor de reportería parametrizado por `scope` (ver §4).

---

## 2. Roles y su relación con el flujo (resumen)

| Rol | Alcance de datos | Rol en el flujo | Modo |
|---|---|---|---|
| **Mandante** | Todas las carteras que le pertenecen, en todos los estudios que las gestionan | Origina la cartera, consume resultados | Solo lectura, ejecutivo, comparativo |
| **Abogado Jefe** | Todo lo gestionado por **su estudio** (todos los mandantes/carteras que su estudio atiende) | Coordina ejecución, aprueba, distribuye carga | Lectura ejecutiva de su estudio + gestión operativa de su equipo |
| **Abogado** | Causas asignadas a él/su equipo | Ejecuta gestión jurídica | Operación |
| **Procurador** | Tareas asignadas | Ejecuta diligencias | Operación |
| **Ejecutivo comercial** | Cartera de cobranza asignada | Contacto y negociación | Operación |

Referencia cruzada: la matriz de permisos detallada está en `arquitectura_funcional.md` §17-18 y en `LegalFlow360_Volumen_III_Modelo_Dominio_DDD.md` §9; este documento agrega las filas nuevas descritas en §4-5 a esas matrices.

---

## 3. Meta-modelo de vistas analíticas (motor común)

Tanto la Vista Mandante como la Vista Abogado Jefe consumen el mismo meta-modelo de analítica, parametrizado por `scope`:

```text
AnalyticsScope
  scopeType: "MANDANTE" | "ESTUDIO"
  scopeId: mandanteId | estudioId
  comparators: [estudioId] | [abogadoId]   // contra qué se compara
  periodFrom / periodTo
  drillPath: []                            // pila de niveles de drill-down activos
```

### 3.1 Niveles de drill-down (aplican a ambas vistas)

1. **Consolidado** (todos los mandantes o todo el estudio) →
2. **Por mandante / por cartera** →
3. **Por segmento de cartera** (ej. "Automotriz Jul 2026") →
4. **Por causa individual** (ficha de rentabilidad y estado)

Cada nivel conserva los mismos KPIs (recupero, costo, SLA) pero re-agregados al nivel seleccionado. La UI debe permitir bajar y subir el nivel sin perder los filtros de período aplicados (breadcrumb de drill-down).

### 3.2 Tablas vintage / cohorte de recupero

Nueva capacidad transversal, disponible para Mandante (sobre su cartera) y Abogado Jefe (sobre su estudio):

- **Camada (vintage/cohorte)** = agrupación de obligaciones por su fecha de origen/asignación (ej. mes de ingreso de cartera: "Ene 2026", "Feb 2026"...).
- **Tabla vintage**: filas = camada de origen, columnas = meses transcurridos desde el ingreso (M0, M1, M2, ...Mn), celdas = % o monto de recupero acumulado a esa altura de vida de la camada.
- **Modo acumulado**: recupero acumulado a la fecha por camada.
- **Modo comparativo**: superposición de curvas de recupero de distintas camadas para comparar velocidad de recuperación entre meses de originación.
- Debe soportar exportación y drill-down desde una celda de la tabla hacia el detalle de causas que la componen.
- **Confirmación de fuente (entrevista Mandante, §3.6.0)**: el término "vintage" fue definido explícitamente por el Mandante (Ángelo Gambini, Tanner) como la asignación homogénea de una camada a T0 (ej. "100 pesos a Phoenix, 100 a Cogestión, 100 a Del Oro") y su seguimiento de recupero a distintas ventanas de tiempo (3/6/12/18 meses) — **no** se refiere a un estilo visual "retro"; es exclusivamente el reporte de cohortes de recupero. Cita literal: *"al final la vista como mía... siempre con vista vintage, porque por camada... ¿cómo esa camada se ha ido recuperando en el tiempo?"*
- La asignación entre estudios debe ser homogénea (sin sesgo, ej. no asignar a un estudio solo los casos "difíciles" que otros no captaron) para que la comparación entre camadas sea válida — esto es un requisito de **calidad de datos de entrada**, no solo de visualización.

### 3.3 Ranking por estudios

- Ya contemplado como concepto en `LegalFlow360_Respuestas_Consolidadas.md` (navegación del Mandante: "Dashboard → Ranking Estudios → Seleccionar Estudio") y en `LegalFlow360_Volumen_III_Modelo_Dominio_DDD.md` línea 164 (`LawFirmRanking`), pero sin especificación funcional propia. Este documento la formaliza:
- Aplica cuando un Mandante distribuye cartera entre **más de un estudio jurídico**.
- Métricas de ranking por estudio: % de recupero, tiempo promedio de recuperación, costo judicial por unidad recuperada, cumplimiento de SLA, tasa de causas críticas/estancadas.
- **Medición en tasa, no en volumen absoluto** (requisito explícito del Mandante): si a un estudio se le asignan 1.000 causas y a otro 10.000, el ranking debe comparar tasa de recupero (% recuperado sobre lo asignado) y no montos absolutos — de lo contrario el tamaño de la cartera asignada distorsiona la comparación. La cantidad de personas/recursos que destine cada estudio a la gestión es irrelevante para el ranking (el pago es 100% variable contra recupero).
- El Mandante puede seleccionar un estudio del ranking para "entrar" y ver su detalle ejecutivo (drill-down §3.1) filtrado a ese estudio.
- El Abogado Jefe **no ve el ranking entre estudios** (no aplica a su alcance — solo ve su propio estudio, ver §17.4 actualizado), pero sí debe poder ver cómo se compara su propio estudio contra el período anterior o contra una meta (ver §5).

### 3.4 Rentabilidad / costo por causa

- Nueva vista de **rentabilidad por causa**, drill-down terminal del punto 4 en §3.1.
- Por causa: cuantía reclamada, gasto judicial acumulado (receptor, tasación, otros), recupero confirmado, **margen = recupero − gasto**, y **ratio de rentabilidad = margen / cuantía reclamada**.
- Vista tabular ordenable/filtrable a nivel de cartera o estudio: "causas con menor rentabilidad", "causas con mayor gasto acumulado sin recupero", "causas con gasto > X% de la cuantía" (alerta de causa deficitaria).
- Esta vista requiere que `Expense` y `Recovery` (definidos en Volumen III §5.29 y §5.30) se puedan agregar por `caseId` — hoy están en el modelo de dominio pero sin un objeto de agregación "rentabilidad de causa" explícito (ver entidad nueva sugerida en §6).

### 3.5 Vista ejecutiva comparativa (estados totales, por estudio, por fecha)

- Pantalla de una sola vista que responde: *"¿cómo está mi cartera total hoy, y cómo se compara entre estudios y entre fechas?"*
- Ejes de comparación combinables:
  - **Por estudio** (si hay más de uno asignado).
  - **Por fecha/período** (comparación entre cortes: hoy vs. mes anterior, trimestre vs. trimestre, año vs. año).
- Contenido: estado total de causas (activas, cerradas, críticas, por etapa), recupero acumulado y porcentual, costo judicial, SLA, y variación (delta) entre los cortes de fecha seleccionados.
- Debe evitar tablas densas como pantalla de entrada (principio ya definido en `LegalFlow360_Respuestas_Consolidadas.md` línea 625) y permitir drill-down (§3.1) hacia el detalle cuando el usuario lo requiera.

### 3.6 Insumos directos de la entrevista al Mandante (Ángelo Gambini, Tanner)

Sección fuente: agrega al meta-modelo capacidades verbalizadas directamente por el Mandante en entrevista, que no estaban capturadas (o solo parcialmente) en los documentos previos.

#### 3.6.0 Contexto de la fuente

Entrevista a Ángelo Gambini (Tanner Servicios Financieros), transcripción de audio. No reemplaza documentos previos; los complementa con el detalle verbatim del requerimiento.

#### 3.6.1 Eficiencia de gasto judicial vs. recupero (dolor #1 declarado)

- El 40% de los egresos de Tanner son gasto judicial, y **es la única variable que hoy no está asociada a un recupero** (a diferencia de comisiones o campañas, que siempre van contra recupero confirmado). Cita: *"ese 40%, en muchos casos, mi recupero, a pesar de haber invertido en eso, mi recupero es cero."*
- Hoy solo tiene agregado simple ("gasto tanto en búsquedas, tanto en inscripción de embargos, tanto en receptor... por cada ID judicial gasto 0,8"), **no tiene el cruce gasto→recupero por causa** a ese nivel de detalle — esta capacidad ya está cubierta por §3.4 (`CaseProfitabilitySnapshot`), que responde directamente a este dolor.
- Detectó (con revisión manual, no con herramienta) casos donde el estudio ejecutó más búsquedas negativas que las permitidas por la regla de negocio según el monto de la deuda (ej. caso de 3.8M con 6 búsquedas negativas cuando el parámetro esperado era menor), y Tanner terminó pagando el exceso sin poder controlarlo sistemáticamente. Esto es un caso de uso concreto para una **alerta de incumplimiento de regla de gasto por rango de monto** (nueva capacidad, no cubierta aún — ver 3.6.2).

#### 3.6.2 Motor de recomendación de reglas de negocio (IA) — más allá del control/alerta

- Requisito explícito: el Mandante **no quiere solo alertas de control** ("eso es una llamada telefónica para decir ojo con esto"); quiere que el sistema, en base al comportamiento histórico de la cartera, le **proponga cambios concretos a sus propias reglas de negocio** (ej. "para casos de menos de 8 millones, acota de 3 a 2 búsquedas negativas; para casos de más de 20 millones, extiende de 5 a 6") mostrando el impacto esperado en gasto sin sacrificar recupero.
- Aplica al menos a dos familias de reglas ya identificadas por Tanner:
  1. **Reglas de gasto/acciones procesales permitidas** por rango de monto de deuda (3.6.1).
  2. **Reglas de asignación judicial** (cuándo pasar una obligación de cobranza extrajudicial a vía judicial): hoy el estándar de industria es tiempo de mora + monto (ej. "> 2 millones y > 90 días"); Tanner está desarrollando (piloto planeado abril/mayo 2026) una regla dinámica basada en comportamiento histórico de pago por segmento — adelantar o atrasar el paso a judicial según la probabilidad de pago extrajudicial del segmento en los siguientes 30-60 días.
- **Nueva capacidad a incorporar al meta-modelo**: un `BusinessRuleRecommendation` (propuesta, no cubierta en Volumen III) que tome inputs de `RecoveryCohortSnapshot` (§6) y `CaseProfitabilitySnapshot` (§6) segmentados por regla vigente, y proponga un valor de parámetro alternativo con el delta de gasto/recupero proyectado. El Mandante mantiene el control: la IA propone, la regla la sigue definiendo/aprobando el Mandante.

#### 3.6.3 Timing del recupero (no solo el monto)

- Además del monto recuperado por camada (§3.2), el Mandante quiere ver el **tiempo que tarda cada estudio en traer el recupero** dentro de una misma camada: dos estudios pueden traer el mismo monto total, pero uno lo concentra temprano (mejor gestión extrajudicial/negociación) y otro tarde (vía remate judicial, con mayor costo asociado acumulado). Esta dimensión temporal *"todavía es algo que están desarrollando"* del lado de Tanner — se documenta aquí como capacidad futura del ranking (§3.3) y de la tabla vintage (§3.2): agregar curva de "velocidad de recupero" por estudio, no solo el acumulado final.
- Horizonte de mora de referencia: ciclo judicial completo actual ~370 días (bajó de ~440), medido desde el ingreso a vía judicial (día ~120 desde el otorgamiento), no desde el atraso original. Cortes de medición: 3/6/12/18 meses — el Mandante no mide en semanas ni días para el mundo judicial (sí sería relevante para gestión extrajudicial, fuera del alcance de esta plataforma).

#### 3.6.4 Nivel de detalle esperado: "grandes números", drill-down solo ante anomalía de SLA

- El Mandante confirma que su uso normal es de **panel ejecutivo agregado** ("grandes números"), y que el drill-down a causa individual ocurre únicamente cuando el SLA agregado revela un problema (ej. "50 casos fuera de SLA") — en ese punto delega el detalle al área judicial interna de Tanner, no lo resuelve él mismo en la plataforma. Esto confirma y refuerza el principio ya definido en `LegalFlow360_Respuestas_Consolidadas.md` línea 625 ("la pantalla debe priorizar lectura ejecutiva, evitando tablas densas").

#### 3.6.5 Formato de entrega actual (referencia, no requisito nuevo)

- Hoy Tanner consume analítica vía **paneles de Power BI**, con un correo diario que dispara/entrega el panel consolidado (antes eran 7 reportes separados, ahora una sola vista). No planteó un requisito explícito de vista mobile-first; el entrevistador exploró la pregunta pero el Mandante describió su consumo actual como panel + correo, en escritorio.
- Persiste trabajo manual detrás del panel, en particular el control de gastos, hoy "100% manual, en un Excel enorme" — validando la prioridad de automatizar esta capa (§3.6.1) antes que la capa de presentación.

#### 3.6.6 Restricción de despliegue: independencia del área de TI del Mandante

- Relevante para decisiones de arquitectura/implementación (no es un requisito funcional de UI): Tanner evita depender de su propia área de tecnología (equipo de 3 personas) o de TI del banco para iniciativas de este tipo, por la lentitud de sus procesos de aprobación/comité. Ejemplo citado: una app de terreno construida internamente sin pasar por TI corporativo. El Mandante valora poder pilotear rápido (grupos de control, sin pasar por "30 aprobaciones").
- **Implicancia**: la plataforma debe poder operar y desplegarse como servicio del proveedor (LegalFlow360/estudio), sin requerir integración obligatoria con sistemas internos de TI del Mandante como prerrequisito para el piloto.

---

## 4. Vista Mandante — especificación consolidada

Sustituye y amplía `CRM_Judicial_3_0_Especificacion_Maestra.md` §9.15 (RF-MAN-001 a 015, que se mantienen vigentes) agregando:

| ID | Requerimiento |
|---|---|
| RF-MAN-016 | Ver ranking comparativo entre los estudios jurídicos que gestionan su cartera, con métricas de recupero, SLA, tiempo de recuperación y costo judicial (§3.3). |
| RF-MAN-017 | Seleccionar un estudio del ranking y navegar a su detalle ejecutivo filtrado (drill-down, §3.1). |
| RF-MAN-018 | Ver tablas de recupero tipo vintage/cohorte por camada de originación, en modo acumulado y en modo comparativo entre camadas (§3.2). |
| RF-MAN-019 | Ver comparativo de costos/gastos judiciales por causa individual, con margen y ratio de rentabilidad, para evaluar rentabilidad de cada causa (§3.4). |
| RF-MAN-020 | Ver vista ejecutiva de estado total de causas con comparativas por estudio y por fecha/período (§3.5). |
| RF-MAN-021 | Navegar mediante drill-down consistente entre los 4 niveles definidos en §3.1 sin perder filtros de período. |
| RF-MAN-022 | Exportar cualquiera de las tablas anteriores (vintage, ranking, rentabilidad por causa) a Excel/CSV (reutiliza RF-REP-009). |
| RF-MAN-023 | Recibir recomendaciones de ajuste a sus propias reglas de negocio de gasto/acciones procesales y de asignación judicial, basadas en el comportamiento histórico de su cartera, con el delta de gasto/recupero proyectado (§3.6.2). |
| RF-MAN-024 | Ver, dentro del ranking de estudios (§3.3) y de la tabla vintage (§3.2), la dimensión de **tiempo hasta el recupero** (no solo el monto), para distinguir estudios que recuperan rápido vía gestión extrajudicial de los que recuperan tarde vía remate judicial (§3.6.3). |

Estas capacidades no reemplazan las RF-MAN-001 a 015 existentes (acceso segregado, cartera asignada, causas críticas, consultas, etc.); las complementan como la capa analítica avanzada de la vista.

## 5. Vista Abogado Jefe — especificación consolidada

Nueva sección (no existía como vista analítica propia; hoy `CRM_Judicial_3_0_Especificacion_Maestra.md` §6.3 y §9.14 solo cubren coordinación operativa). Se agrega como nuevo bloque de requerimientos análogo al de Mandante, pero con **alcance limitado a su propio estudio**:

| ID | Requerimiento |
|---|---|
| RF-JEFE-001 | Ver las mismas métricas ejecutivas que el Mandante (recupero, cuantía, rentabilidad, costo judicial, SLA, tiempo de recuperación, remates, daciones, pagos), acotadas exclusivamente a las carteras/causas gestionadas por **su propio estudio** (todos los mandantes que atiende su estudio, consolidados). |
| RF-JEFE-002 | Ver tablas vintage/cohorte de recupero (§3.2) del estudio completo y con posibilidad de acotar por mandante o por abogado/procurador. |
| RF-JEFE-003 | Ver comparativo de costos/gastos y rentabilidad por causa (§3.4), acotado a las causas de su estudio. |
| RF-JEFE-004 | Ver vista ejecutiva comparativa de estado total de causas de su estudio por fecha/período (§3.5), **sin** el eje de comparación "por estudio" (no aplica — no tiene visibilidad de otros estudios). |
| RF-JEFE-005 | Ver métricas desagregadas **por abogado y por procurador** de su equipo: carga de trabajo, productividad (causas resueltas, tareas completadas a tiempo), cumplimiento de SLA individual, recupero atribuido, tareas críticas vencidas. |
| RF-JEFE-006 | Ver la cartera de causas agrupada por abogado/procurador responsable, con capacidad de drill-down desde la métrica agregada del abogado hacia su lista de causas. |
| RF-JEFE-007 | Comparar el desempeño de su estudio contra el período anterior o contra una meta interna (no contra otros estudios, ver RF-JEFE-004). |
| RF-JEFE-008 | Exportar cualquiera de las tablas anteriores a Excel/CSV (reutiliza RF-REP-009). |

**Regla de aislamiento (nueva, agregar a `arquitectura_funcional.md` §23 Reglas de integridad)**: un Abogado Jefe nunca debe poder seleccionar o comparar contra un estudio jurídico distinto del propio — el `scopeType: "ESTUDIO"` de su sesión debe fijarse server-side al `estudioId` de su usuario y no ser parametrizable desde la UI ni la API.

---

## 6. Impacto en el modelo de dominio (Volumen III)

Para soportar §3.2 y §3.4 se sugiere incorporar a `LegalFlow360_Volumen_III_Modelo_Dominio_DDD.md` §5 (Entidades principales) dos vistas agregadas de solo lectura (no son entidades transaccionales, son proyecciones analíticas construidas desde entidades existentes):

- **`CaseProfitabilitySnapshot`**: `caseId`, `claimAmount`, `accumulatedExpense`, `confirmedRecovery`, `margin`, `profitabilityRatio`, `asOfDate`. Se recalcula a partir de `Expense` (§5.29) y `Recovery` (§5.30) agregados por `caseId`.
- **`RecoveryCohortSnapshot`**: `cohortKey` (mes de originación), `scopeType`, `scopeId`, `monthsSinceOrigination`, `cumulativeRecoveryAmount`, `cumulativeRecoveryRate`, `asOfDate`. Se recalcula a partir de `Recovery` agregado por camada de `Assignment`/`Portfolio` (§5.5-§5.6).

Ambas deben marcarse como derivadas (no fuente de verdad) para no violar la regla de integridad #14 de `arquitectura_funcional.md` ("los indicadores del mandante deben provenir de eventos confirmados, no de borradores") — solo se recalculan sobre `Recovery` en estado confirmado.

---

## 7. Actualizaciones aplicadas a los documentos existentes

Como parte de esta actualización se modificaron directamente:

- `CRM_Judicial_3_0_Especificacion_Maestra.md` §6.1 (necesidades del Mandante), §6.3 (necesidades del Abogado Jefe), §9.15 (RF-MAN-016 a 024), nuevo §9.16 "Vista Abogado Jefe" (RF-JEFE-001 a 008), con renumeración de la antigua §9.16 Inteligencia artificial a §9.17.
- `arquitectura_funcional.md` §17.1 (permisos Mandante) y §17.4 (permisos Abogado jefe), y §18 (matriz resumida de permisos).
- `LegalFlow360_Respuestas_Consolidadas.md` "Dashboard Ejecutivo del Mandante", con nueva subsección de analítica avanzada, y nueva sección equivalente "Dashboard Ejecutivo del Abogado Jefe".
- §3.6 (nuevo, 2026-07-14): insumos directos de la entrevista al Mandante (Ángelo Gambini, Tanner) — motor de recomendación de reglas de negocio (RF-MAN-023), timing del recupero (RF-MAN-024), clarificación del concepto "vista vintage" (§3.2), medición en tasa del ranking (§3.3), y restricción de despliegue independiente de TI del Mandante (§3.6.6).

Este documento (`META_MODELO_NEGOCIO.md`) debe tratarse como el punto de entrada para entender el "por qué" y el "para quién" de esos cambios; el detalle funcional exhaustivo permanece en los documentos originales.
