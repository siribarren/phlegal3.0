# CRM Judicial 3.0  
## Especificación funcional, técnica, no funcional y de procesos

**Organización:** PH Legal / Phigital  
**Versión:** 1.0  
**Fecha:** 10 de julio de 2026  
**Estado:** Documento maestro consolidado para validación, diseño, estimación y construcción

---

## 1. Propósito del documento

Este documento consolida en una única especificación el alcance funcional, técnico, operacional y no funcional de la plataforma **CRM Judicial 3.0**.

Su objetivo es servir como:

- Documento base de producto.
- Especificación funcional de referencia.
- Insumo para arquitectura de solución.
- Base para diseño UX/UI.
- Fuente para estimación y planificación.
- Marco para QA, criterios de aceptación y pruebas de usuario.
- Documento de alineamiento entre PH Legal, áreas operacionales, tecnología y mandantes.

El contenido integra requerimientos previamente levantados para gestión judicial, cobranza, automatización documental, integración con plataformas de mandantes, reportería, trazabilidad, gestión de cartera y experiencia diferenciada por rol.

---

## 2. Visión del producto

CRM Judicial 3.0 será una plataforma digital integral para gestionar el ciclo completo de cobranza judicial y extrajudicial, desde el ingreso de cartera hasta el cierre de la causa, recupero, rendición y reportería al mandante.

La solución deberá centralizar información, automatizar tareas repetitivas, priorizar causas, generar alertas y entregar una visión única del estado judicial, comercial, financiero y documental de cada operación.

La plataforma deberá evolucionar desde un CRM centrado en consultas y semáforos hacia un sistema operacional end-to-end, capaz de:

1. Recibir y validar cargas de cartera.
2. Crear y mantener una ficha única por operación, deudor y causa.
3. Coordinar acciones de abogados, procuradores, supervisores y ejecutivos.
4. Automatizar la generación y presentación de escritos.
5. Sincronizar estados con PJUD, VISOR y otros sistemas externos.
6. Registrar gestiones judiciales y comerciales.
7. Gestionar pagos, compromisos, gastos y recuperos.
8. Priorizar causas mediante reglas e inteligencia.
9. Generar alertas, recomendaciones y próximas mejores acciones.
10. Entregar reportería ejecutiva y trazabilidad completa al mandante.

---

## 3. Objetivos estratégicos

### 3.1 Objetivos de negocio

- Aumentar el recupero judicial y extrajudicial.
- Mejorar el cumplimiento de metas por cartera y mandante.
- Reducir tiempos improductivos y tareas manuales.
- Aumentar la productividad de procuradores, abogados y ejecutivos.
- Disminuir causas sin gestión o fuera de SLA.
- Mejorar la calidad, oportunidad y consistencia de la información.
- Reducir pérdidas por gastos judiciales no rendidos o no recuperados.
- Aumentar la transparencia hacia los mandantes.
- Facilitar la incorporación de nuevas carteras y clientes.
- Construir una plataforma escalable para distintos modelos de cobranza.

### 3.2 Objetivos operacionales

- Consolidar información dispersa en CRM, VISOR, PJUD, OneDrive, correo, WhatsApp, Infoget, Power BI y planillas.
- Automatizar la generación y carga de documentos judiciales.
- Mantener una cronología completa de cada causa.
- Permitir una gestión diaria basada en prioridades.
- Habilitar comunicación bidireccional entre roles.
- Evitar duplicidad de registros.
- Controlar excepciones, reintentos y fallas de integración.
- Disponer de auditoría completa sobre cada acción.

### 3.3 Objetivos tecnológicos

- Implementar una arquitectura modular e integrable.
- Reducir deuda técnica y dependencia de procesos heredados.
- Separar ambientes de desarrollo, QA y producción.
- Incorporar observabilidad, seguridad, pruebas y trazabilidad desde el diseño.
- Disponer de APIs y mecanismos de integración reutilizables.
- Implementar procesos asincrónicos para scraping, RPA y sincronizaciones.

---

## 4. Alcance funcional de alto nivel

La solución contempla los siguientes dominios:

1. Autenticación, seguridad y administración.
2. Gestión de mandantes, carteras y campañas.
3. Ingesta y calidad de datos.
4. Gestión de deudores, operaciones y causas.
5. MiCartera y bandeja inteligente de trabajo.
6. Gestión judicial.
7. Gestión de cobranza y negociación.
8. Pagos, recupero y conciliación.
9. Escritos y documentos automáticos.
10. Integración con PJUD.
11. Integración con VISOR y sistemas de mandantes.
12. Gestión de receptores y gastos judiciales.
13. Alertas, SLA y priorización.
14. Comunicación y colaboración.
15. Reporterías y analítica.
16. Vista mandante.
17. Inteligencia artificial y automatización.
18. Auditoría, trazabilidad y gobierno.
19. Configuración y parametrización.
20. Operación técnica y DevOps.

---

## 5. Fuera de alcance inicial

Salvo definición posterior, se consideran fuera del alcance inicial:

- Sustitución total de los sistemas core de cada mandante.
- Modificación directa de plataformas bancarias o sistemas sin API.
- Pago en línea administrado directamente por PH Legal.
- Automatización irreversible sin aprobación humana en acciones judiciales críticas.
- Eliminación inmediata de todos los procesos RPA existentes.
- Integración con cualquier tercero no identificado o sin acceso autorizado.
- Migración histórica ilimitada sin definición de ventana temporal.
- Firma electrónica avanzada propia.
- Motor contable corporativo.
- Motor de scoring crediticio regulatorio.

---

## 6. Actores y perfiles de usuario

### 6.1 Mandante / Cliente

Objetivo: disponer de una visión ejecutiva y trazable del desempeño de sus carteras.

Necesidades:

- Visualizar recupero, meta, cumplimiento y brecha.
- Consultar cartera vigente y castigada.
- Revisar avance judicial.
- Ver causas críticas, estancadas o fuera de SLA.
- Consultar pagos, compromisos, gastos y recuperos.
- Descargar reportes y respaldos.
- Ingresar consultas o solicitudes.
- Acceder solo a la información de su organización.
- Revisar trazabilidad de actividades relevantes.
- Ver ranking comparativo entre los estudios jurídicos que gestionan su cartera.
- Realizar drill-down desde el consolidado hasta la causa individual sin perder filtros de período.
- Ver tablas de recupero tipo vintage/cohorte por camada histórica de originación, en modo acumulado y comparativo.
- Ver comparativo de costos/gastos por causa individual para evaluar su rentabilidad.
- Ver vista ejecutiva del estado total de causas con comparativas entre estudios y entre fechas.

*(Ver especificación consolidada en `META_MODELO_NEGOCIO.md` §4 y RF-MAN-016 a 022 en §9.15.)*

### 6.2 Gerente Legal

Objetivo: dirigir la operación legal mediante indicadores, riesgos y prioridades.

Necesidades:

- Visión consolidada de mandantes y carteras.
- Productividad por equipo y responsable.
- Estado judicial por etapa.
- Casos críticos y riesgos.
- Tiempos de tramitación.
- Cumplimiento de SLA.
- Gastos judiciales y recuperabilidad.
- Ranking de receptores.
- Capacidad de reasignación y escalamiento.

### 6.3 Supervisor / Abogado jefe

Objetivo: coordinar la ejecución diaria y asegurar la calidad jurídica.

Necesidades:

- Bandeja de pendientes.
- Aprobación de escritos y demandas.
- Distribución de carga.
- Reasignación de causas.
- Control de semáforos.
- Revisión de gestiones vencidas.
- Consultas grupales.
- Alertas por errores o inconsistencias.
- Monitoreo de procuradores y abogados.
- Gestión de excepciones.
- Ver las mismas métricas ejecutivas que el Mandante (recupero, cuantía, rentabilidad, costo judicial, SLA, tiempo de recuperación), acotadas a su propio estudio.
- Ver tablas vintage/cohorte de recupero y comparativo de rentabilidad por causa, acotados a su estudio.
- Ver vista ejecutiva comparativa del estado total de causas de su estudio por fecha/período (sin comparación contra otros estudios).
- Ver métricas desagregadas por abogado y por procurador de su equipo (carga, productividad, SLA individual, recupero atribuido).
- Ver la cartera agrupada por abogado/procurador responsable, con drill-down hacia sus causas.

*(Ver especificación consolidada en `META_MODELO_NEGOCIO.md` §5 y RF-JEFE-001 a 008 en §9.16.)*

### 6.4 Abogado

Objetivo: gestionar jurídicamente causas y tomar decisiones procesales.

Necesidades:

- Ver causas asignadas.
- Consultar expediente y cronología.
- Crear instrucciones.
- Revisar y aprobar escritos.
- Solicitar acciones al procurador.
- Registrar hitos y decisiones.
- Adjuntar documentos.
- Responder consultas.
- Revisar alertas y plazos.

### 6.5 Procurador

Objetivo: ejecutar tareas judiciales de manera priorizada y trazable.

Necesidades:

- Bandeja diaria de trabajo.
- Priorización por SLA, urgencia y etapa.
- Consulta de antecedentes.
- Registro de gestiones.
- Carga de respaldos.
- Comunicación con abogado.
- Resolución de alertas.
- Confirmación de acciones realizadas.
- Vista simple y móvil cuando corresponda.

### 6.6 Ejecutivo comercial / Cobranza

Objetivo: gestionar contacto, negociación, compromisos y pagos.

Necesidades:

- Ver ficha del cliente.
- Consultar deuda.
- Registrar contactos y resultados.
- Crear compromisos de pago.
- Solicitar cupones o liquidaciones.
- Adjuntar comprobantes.
- Consultar estado judicial.
- Generar consultas al área legal.
- Gestionar daciones, PUT u otras soluciones.
- Ver seguimiento y recupero.

### 6.7 Analista / Backoffice

Objetivo: validar información, procesar excepciones y mantener la calidad de datos.

Necesidades:

- Validar cargas.
- Resolver duplicidades.
- Corregir inconsistencias.
- Gestionar documentos.
- Revisar conciliaciones.
- Procesar rendiciones.
- Exportar información.
- Supervisar integraciones.
- Administrar colas de errores.

### 6.8 Administrador

Objetivo: configurar y gobernar el funcionamiento de la plataforma.

Necesidades:

- Crear usuarios.
- Configurar roles y permisos.
- Administrar mandantes y carteras.
- Parametrizar estados, SLA y reglas.
- Gestionar catálogos.
- Configurar integraciones.
- Revisar auditoría.
- Habilitar o deshabilitar funcionalidades.
- Administrar plantillas.

---

## 7. Modelo conceptual de información

### 7.1 Entidades principales

- Mandante.
- Empresa relacionada.
- Cartera.
- Campaña.
- Deudor.
- Operación.
- Producto.
- Contrato.
- Pagaré.
- Causa.
- ROL.
- Tribunal.
- Abogado.
- Procurador.
- Receptor judicial.
- Gestión.
- Hito procesal.
- Documento.
- Escrito.
- Demanda.
- Notificación.
- Alerta.
- Tarea.
- Consulta.
- Conversación.
- Contacto.
- Negociación.
- Compromiso de pago.
- Cupón.
- Pago.
- Recupero.
- Gasto judicial.
- Rendición.
- Reembolso.
- Conciliación.
- Usuario.
- Rol.
- Permiso.
- Integración.
- Evento de auditoría.

### 7.2 Relaciones clave

- Un mandante posee una o más carteras.
- Una cartera agrupa operaciones.
- Una operación pertenece a un deudor.
- Una operación puede asociarse a una o más causas.
- Una causa puede tener múltiples gestiones, hitos, documentos y responsables.
- Una causa puede tener uno o más ROL según tribunal o instancia.
- Una operación puede generar compromisos, pagos y recuperos.
- Un gasto judicial debe asociarse a causa, responsable, proveedor, rendición y estado de reembolso.
- Cada acción relevante debe generar un evento de auditoría.

### 7.3 Identificadores críticos

La plataforma deberá manejar al menos:

- ID interno único.
- RUT del deudor.
- Número de operación u OP.
- Número de pagaré.
- ROL de causa.
- Código de mandante.
- Código de cartera.
- Código de tribunal.
- ID externo VISOR.
- ID externo PJUD cuando exista.
- Identificador de documento.
- Identificador de pago.
- Identificador de gestión.
- Identificador de integración.

---

## 8. Procesos de negocio

## 8.1 Proceso de ingreso de cartera

### Objetivo

Recibir, validar, normalizar y habilitar la nueva cartera para su gestión.

### Flujo

1. El mandante o TI carga un archivo o envía datos por API.
2. El sistema valida estructura, formato y campos obligatorios.
3. Se normalizan RUT, nombres, direcciones, montos, fechas y códigos.
4. Se detectan registros duplicados.
5. Se valida la relación OP–RUT–demandado.
6. Se consulta existencia previa de operación o causa.
7. Los errores quedan en una bandeja de observaciones.
8. Los registros válidos se incorporan a la cartera.
9. Se aplican reglas de segmentación y asignación.
10. Se genera reporte de carga.
11. Se notifica al responsable.
12. Se conserva evidencia del archivo original y del resultado.

### Reglas

- No se debe crear una operación duplicada sin advertencia.
- Toda carga debe ser trazable.
- Debe existir reversa controlada.
- Los errores parciales no deben invalidar necesariamente la carga completa.
- Los campos mínimos objetivo para automatización end-to-end son OP, RUT y demandado.

---

## 8.2 Proceso de actualización de estado diario

### Objetivo

Mantener el estado judicial actualizado a partir de fuentes internas y externas.

### Flujo

1. Se ejecuta una carga programada.
2. El sistema obtiene estados desde CRM, VISOR, PJUD u otras fuentes.
3. Se normalizan estados y subestados.
4. Se comparan con el estado anterior.
5. Se registran cambios.
6. Se recalculan semáforos.
7. Se generan alertas.
8. Se actualiza la ficha de causa.
9. Se notifica cuando el cambio requiere acción.
10. Se registra resultado de integración.

### Requerimiento de omni-estado

La solución deberá unificar los distintos estados diarios en un modelo común denominado **omni-estado**, evitando interpretaciones diferentes entre sistemas.

---

## 8.3 Proceso de generación de demanda

### Objetivo

Generar demandas judiciales de manera masiva y controlada a partir de información de pagarés y operaciones.

### Flujo

1. Se identifica la operación demandable.
2. Se obtiene el pagaré desde VISOR u otra fuente.
3. Se extraen datos mediante OCR o lectura estructurada.
4. Se identifica el tipo de demanda.
5. Se selecciona la plantilla correspondiente.
6. Se completan campos variables.
7. Se validan reglas jurídicas y campos obligatorios.
8. Se genera documento preliminar.
9. El abogado o procurador revisa.
10. Se corrigen observaciones.
11. Se aprueba.
12. Se genera PDF final.
13. Se deja disponible para presentación.
14. Se registra versión, autor y aprobación.

### Consideraciones

- Existen múltiples tipos de demanda.
- El mapeo de campos debe ser parametrizable.
- La plataforma debe tolerar documentos con calidad variable.
- Los campos extraídos deben mostrar nivel de confianza.
- Los documentos de baja confianza requieren revisión manual.

---

## 8.4 Proceso de escritos automáticos

### Casos iniciales

- Asume poder y patrocinio.
- Desarchivo con mandato.
- Escritos asociados a regularización de representación.
- Otros escritos parametrizados.

### Flujo

1. Selección de una o múltiples causas.
2. Validación de antecedentes.
3. Selección de plantilla.
4. Completado automático.
5. Previsualización.
6. Revisión.
7. Aprobación.
8. Generación de PDF.
9. Firma cuando corresponda.
10. Envío o presentación.
11. Registro en cronología.

---

## 8.5 Proceso de presentación automatizada en PJUD

### Objetivo

Reducir la carga manual causa por causa.

### Flujo

1. Se selecciona el escrito aprobado.
2. Se valida que la causa tenga ROL y tribunal.
3. El agente automatizado inicia sesión.
4. Navega hacia la causa.
5. Ingresa o selecciona el ROL.
6. Selecciona tipo de escrito.
7. Adjunta PDF.
8. Completa campos requeridos.
9. Presenta o deja listo para confirmación según política.
10. Captura comprobante.
11. Registra resultado.
12. Ante error, aplica reintentos.
13. Si persiste el error, deriva a bandeja manual.

### Riesgos

- Cambios en la interfaz del PJUD.
- Caídas o bloqueos.
- Restricciones anti-bot.
- Problemas de credenciales.
- Reintentos que provoquen duplicidad.
- Diferencias entre tribunales.

### Controles

- Idempotencia.
- Evidencia de cada intento.
- Capturas o comprobantes.
- Reintentos parametrizados.
- Cola de excepciones.
- Confirmación humana para acciones críticas.

---

## 8.6 Proceso de rescate y asociación de nuevas causas

### Flujo objetivo

1. Se presenta la demanda.
2. El sistema consulta PJUD periódicamente.
3. Detecta la nueva causa.
4. Obtiene ROL, tribunal y estado inicial.
5. Intenta asociarla mediante OP.
6. Si existe una coincidencia única, asocia automáticamente.
7. Si existen múltiples coincidencias, presenta opciones.
8. El procurador selecciona la asociación correcta.
9. Se actualiza la ficha.
10. Se inicia seguimiento de estado diario.

---

## 8.7 Proceso MiCartera

### Objetivo

Entregar a cada usuario una bandeja diaria priorizada.

### Flujo

1. El sistema identifica casos asignados.
2. Evalúa SLA, estado, antigüedad, monto, riesgo y alertas.
3. Calcula prioridad.
4. Agrupa por tipo de acción.
5. Presenta tareas y causas.
6. El usuario ejecuta o registra gestión.
7. El sistema actualiza semáforo.
8. Se recalcula la bandeja.
9. Los casos bloqueados se derivan.
10. Los casos completados salen de la vista activa.

### Capacidades

- Filtros.
- Ordenamiento.
- Selección múltiple.
- Acciones masivas.
- Guardado de vistas.
- Columnas configurables.
- Alertas visuales.
- Exportación controlada.
- Acceso al detalle sin perder contexto.

---

## 8.8 Proceso de contacto y negociación

### Flujo

1. El ejecutivo accede a su cartera.
2. Revisa antecedentes de deuda y estado judicial.
3. Contacta al deudor.
4. Registra canal, resultado y observaciones.
5. Si existe interés, simula alternativa.
6. Registra propuesta.
7. Crea compromiso de pago.
8. Solicita liquidación o cupón.
9. Adjunta antecedentes.
10. Realiza seguimiento.
11. Si el cliente paga, inicia proceso de validación.
12. Si incumple, se genera alerta y nueva acción.

### Tipos de gestión

- Contactado.
- No contactado.
- Reagenda.
- Compromiso de pago.
- Dación.
- PUT.
- Renegociación.
- Convenio.
- Rechazo.
- Fallecido.
- Incobrable propuesto.
- Derivación legal.

---

## 8.9 Proceso de pagos y recupero

### Flujo

1. Se registra el acuerdo.
2. Se espera el pago.
3. Se recibe comprobante o información bancaria.
4. Se identifica operación y cliente.
5. Se valida monto y fecha.
6. Se compara con el compromiso.
7. Se obtiene o calcula desglose de capital, intereses y gastos.
8. Se concilia con cartola o sistema del mandante.
9. Se clasifica como conciliado, parcial, excedente o pendiente.
10. Se envía a aplicación o recaudación.
11. Se actualiza recupero.
12. Se informa al ejecutivo y supervisor.
13. Se conserva respaldo.

### Reglas

- Debe existir tolerancia parametrizable cuando el mandante lo permita.
- Los pagos fuera de fecha deben recalcularse o ajustarse según reglas.
- El pago debe mantener trazabilidad desde compromiso hasta aplicación.
- La plataforma debe diferenciar monto acordado, transferido, conciliado, aplicado y recuperado.
- No se debe considerar recupero final mientras el pago no esté confirmado o aplicado según la regla del mandante.

---

## 8.10 Proceso de gastos judiciales

### Flujo

1. Se solicita gasto.
2. Se asocia a causa, operación, receptor y tipo.
3. Se aprueba.
4. Se registra pago.
5. Se adjunta respaldo.
6. Se genera rendición.
7. Se envía al mandante.
8. Se registra aceptación, rechazo o devolución.
9. Se controla reembolso.
10. Los gastos no recuperados quedan en alerta.
11. Se genera análisis de pérdida.

### Indicadores

- Total pagado.
- Total rendido.
- Total reembolsado.
- Pendiente de rendición.
- Pendiente de reembolso.
- Rechazado.
- Devuelto.
- Antigüedad.
- Pérdida neta.
- Distribución por receptor, mandante y causa.

---

## 8.11 Proceso de ranking de receptores

### Flujo

1. Se reciben correos o archivos de gestión.
2. Se extraen datos y estampes.
3. Se clasifican resultados.
4. Se asocian a receptor y causa.
5. Se consolidan métricas.
6. Se calcula ranking.
7. Se identifican niveles de desempeño.
8. Se generan alertas por estancamiento.
9. Se permite análisis por período, mandante y tipo de gestión.

### Métricas

- Notificaciones exitosas.
- Notificaciones negativas.
- Tiempo promedio.
- Gestiones vencidas.
- Tasa de éxito.
- Costo por resultado.
- Casos sin movimiento.
- Rechazos.
- Calidad de respaldo.

---

## 8.12 Proceso de propuesta de incobrable

### Flujo

1. El usuario selecciona causa.
2. El sistema valida criterios mínimos.
3. Se documentan antecedentes.
4. Se adjuntan respaldos.
5. Se envía a revisión.
6. Supervisor aprueba, rechaza u observa.
7. Mandante revisa cuando corresponda.
8. Se registra resolución.
9. Se actualiza estado.
10. Se conserva historial.

---

## 8.13 Proceso de consultas y colaboración

### Casos

- Abogado a procurador.
- Procurador a abogado.
- Gerencia de cobranza a equipo legal.
- Mandante a PH Legal.
- Consulta individual.
- Consulta grupal.
- Consulta con adjuntos.

### Reglas

- Las consultas deberán operar como hilos.
- Deben permitir adjuntos.
- Deben tener estado.
- Deben tener responsable.
- Deben registrar fecha de creación, respuesta y cierre.
- Deben generar notificaciones.
- Las consultas comerciales deberán incluir tipo: PUT, dación, compromiso de pago u otros parametrizables.

---

## 9. Requerimientos funcionales

## 9.1 Autenticación y acceso

**RF-AUT-001** El sistema deberá permitir inicio de sesión seguro.

**RF-AUT-002** Deberá soportar recuperación de contraseña.

**RF-AUT-003** Deberá soportar autenticación multifactor para perfiles críticos.

**RF-AUT-004** Deberá aplicar control de acceso basado en roles.

**RF-AUT-005** Deberá restringir información por mandante, cartera y ámbito de responsabilidad.

**RF-AUT-006** Deberá cerrar sesiones por inactividad.

**RF-AUT-007** Deberá registrar accesos exitosos y fallidos.

**RF-AUT-008** Deberá permitir integración futura con SSO.

---

## 9.2 Administración

**RF-ADM-001** Crear, editar, bloquear y desactivar usuarios.

**RF-ADM-002** Administrar roles y permisos.

**RF-ADM-003** Administrar mandantes.

**RF-ADM-004** Administrar carteras y campañas.

**RF-ADM-005** Asignar usuarios a mandantes y carteras.

**RF-ADM-006** Parametrizar estados y subestados.

**RF-ADM-007** Parametrizar SLA.

**RF-ADM-008** Parametrizar semáforos.

**RF-ADM-009** Administrar catálogos.

**RF-ADM-010** Administrar plantillas de documentos.

**RF-ADM-011** Configurar tolerancias de pago.

**RF-ADM-012** Configurar reglas de priorización.

**RF-ADM-013** Configurar tipos de consulta.

**RF-ADM-014** Configurar notificaciones.

**RF-ADM-015** Configurar integraciones y credenciales mediante almacenamiento seguro.

---

## 9.3 Gestión de cartera

**RF-CAR-001** Cargar cartera por archivo.

**RF-CAR-002** Cargar cartera por API.

**RF-CAR-003** Validar archivos antes de procesar.

**RF-CAR-004** Generar resumen de errores.

**RF-CAR-005** Procesar cargas parciales.

**RF-CAR-006** Detectar duplicados.

**RF-CAR-007** Permitir corrección de errores.

**RF-CAR-008** Registrar versión de carga.

**RF-CAR-009** Permitir reversa controlada.

**RF-CAR-010** Segmentar cartera.

**RF-CAR-011** Asignar responsables.

**RF-CAR-012** Consultar historial de carga.

---

## 9.4 Ficha única

**RF-FIC-001** Disponer de ficha consolidada del deudor.

**RF-FIC-002** Mostrar operaciones asociadas.

**RF-FIC-003** Mostrar causas asociadas.

**RF-FIC-004** Mostrar deuda y desglose.

**RF-FIC-005** Mostrar contactos.

**RF-FIC-006** Mostrar negociaciones.

**RF-FIC-007** Mostrar pagos y recuperos.

**RF-FIC-008** Mostrar documentos.

**RF-FIC-009** Mostrar cronología.

**RF-FIC-010** Mostrar alertas.

**RF-FIC-011** Mostrar responsables.

**RF-FIC-012** Mostrar información de sistemas externos con fecha de actualización.

---

## 9.5 MiCartera

**RF-MIC-001** Bandeja de trabajo inteligente.

**RF-MIC-002** Priorización automática.

**RF-MIC-003** Filtros por mandante, cartera, estado, responsable y SLA.

**RF-MIC-004** Guardar vistas personalizadas.

**RF-MIC-005** Selección múltiple.

**RF-MIC-006** Acciones masivas.

**RF-MIC-007** Visualizar semáforo.

**RF-MIC-008** Visualizar causa de prioridad.

**RF-MIC-009** Consultar detalle sin perder filtros.

**RF-MIC-010** Exportar según permisos.

**RF-MIC-011** Aislar causas con inconsistencias de sincronización.

**RF-MIC-012** Ocultar del flujo operacional casos que no deben ser intervenidos.

**RF-MIC-013** Permitir propuestas de incobrable.

**RF-MIC-014** Permitir consultas desde detalle.

**RF-MIC-015** Habilitar comunicación bidireccional.

---

## 9.6 Gestión judicial

**RF-JUD-001** Crear y actualizar causas.

**RF-JUD-002** Asociar una operación a múltiples causas.

**RF-JUD-003** Gestionar ROL y tribunal.

**RF-JUD-004** Registrar estado y subestado.

**RF-JUD-005** Registrar hitos procesales.

**RF-JUD-006** Registrar gestiones.

**RF-JUD-007** Registrar observaciones.

**RF-JUD-008** Adjuntar documentos.

**RF-JUD-009** Asignar abogado y procurador.

**RF-JUD-010** Reasignar responsable.

**RF-JUD-011** Mantener cronología.

**RF-JUD-012** Comparar estado interno y externo.

**RF-JUD-013** Generar alertas de inconsistencia.

**RF-JUD-014** Gestionar acciones por lote.

**RF-JUD-015** Mantener historial completo.

---

## 9.7 Documentos y escritos

**RF-DOC-001** Gestionar repositorio documental.

**RF-DOC-002** Versionar documentos.

**RF-DOC-003** Clasificar documentos.

**RF-DOC-004** Buscar por metadatos.

**RF-DOC-005** Generar documentos desde plantillas.

**RF-DOC-006** Previsualizar antes de emitir.

**RF-DOC-007** Aprobar o rechazar.

**RF-DOC-008** Registrar observaciones.

**RF-DOC-009** Generar PDF.

**RF-DOC-010** Asociar documento a causa y operación.

**RF-DOC-011** Controlar permisos de descarga.

**RF-DOC-012** Registrar hash o evidencia de integridad.

---

## 9.8 Automatización PJUD

**RF-PJU-001** Acceder mediante proceso automatizado autorizado.

**RF-PJU-002** Consultar causa.

**RF-PJU-003** Recuperar datos de estado.

**RF-PJU-004** Presentar escritos.

**RF-PJU-005** Adjuntar PDF.

**RF-PJU-006** Capturar comprobante.

**RF-PJU-007** Registrar intentos.

**RF-PJU-008** Aplicar reintentos.

**RF-PJU-009** Evitar duplicidad.

**RF-PJU-010** Derivar errores a bandeja manual.

**RF-PJU-011** Detectar nuevas causas.

**RF-PJU-012** Asociar causa mediante OP.

---

## 9.9 Integración VISOR

**RF-VIS-001** Consultar operaciones.

**RF-VIS-002** Recuperar pagarés.

**RF-VIS-003** Consultar estados.

**RF-VIS-004** Consultar deuda.

**RF-VIS-005** Registrar gestiones mediante API o RPA.

**RF-VIS-006** Mostrar fecha de última sincronización.

**RF-VIS-007** Controlar errores.

**RF-VIS-008** Evitar registros duplicados.

**RF-VIS-009** Mantener mapeo de estados.

**RF-VIS-010** Registrar respuesta externa.

---

## 9.10 Cobranza y negociación

**RF-COB-001** Registrar contacto.

**RF-COB-002** Registrar resultado.

**RF-COB-003** Registrar canal.

**RF-COB-004** Crear negociación.

**RF-COB-005** Crear compromiso de pago.

**RF-COB-006** Registrar monto y fecha.

**RF-COB-007** Adjuntar comprobantes.

**RF-COB-008** Generar seguimiento.

**RF-COB-009** Generar alertas por incumplimiento.

**RF-COB-010** Crear consulta al área legal.

**RF-COB-011** Gestionar tipos comerciales.

**RF-COB-012** Mostrar estado judicial relevante.

---

## 9.11 Pagos y recupero

**RF-PAG-001** Registrar pago informado.

**RF-PAG-002** Extraer datos desde comprobante mediante OCR.

**RF-PAG-003** Validar monto, fecha, banco y referencia.

**RF-PAG-004** Asociar pago a operación.

**RF-PAG-005** Conciliar con compromiso.

**RF-PAG-006** Conciliar con cartola.

**RF-PAG-007** Clasificar diferencias.

**RF-PAG-008** Aplicar tolerancia parametrizable.

**RF-PAG-009** Gestionar pagos parciales.

**RF-PAG-010** Gestionar pagos excedentes.

**RF-PAG-011** Registrar aplicación.

**RF-PAG-012** Registrar recupero final.

**RF-PAG-013** Mantener trazabilidad financiera.

**RF-PAG-014** Exportar información a recaudación.

---

## 9.12 Gastos judiciales

**RF-GAS-001** Solicitar gasto.

**RF-GAS-002** Aprobar gasto.

**RF-GAS-003** Registrar pago.

**RF-GAS-004** Asociar receptor.

**RF-GAS-005** Adjuntar respaldo.

**RF-GAS-006** Crear rendición.

**RF-GAS-007** Registrar envío a mandante.

**RF-GAS-008** Registrar aceptación o rechazo.

**RF-GAS-009** Controlar reembolso.

**RF-GAS-010** Alertar antigüedad.

**RF-GAS-011** Medir pérdida neta.

**RF-GAS-012** Generar reportes evolutivos.

---

## 9.13 Alertas y notificaciones

**RF-ALT-001** Alertar causas fuera de SLA.

**RF-ALT-002** Alertar causas sin gestión.

**RF-ALT-003** Alertar pagos pendientes.

**RF-ALT-004** Alertar compromisos vencidos.

**RF-ALT-005** Alertar gastos sin rendición.

**RF-ALT-006** Alertar gastos sin reembolso.

**RF-ALT-007** Alertar errores de integración.

**RF-ALT-008** Alertar documentos pendientes de aprobación.

**RF-ALT-009** Alertar nuevas consultas.

**RF-ALT-010** Permitir marcar, posponer, asignar y cerrar alertas.

**RF-ALT-011** Evitar alertas redundantes.

**RF-ALT-012** Registrar historial de atención.

---

## 9.14 Analítica y reportería

**RF-REP-001** Dashboard ejecutivo general.

**RF-REP-002** Dashboard por mandante.

**RF-REP-003** Dashboard por cartera.

**RF-REP-004** Dashboard por responsable.

**RF-REP-005** Dashboard de recupero.

**RF-REP-006** Dashboard judicial.

**RF-REP-007** Dashboard de gastos.

**RF-REP-008** Ranking de receptores.

**RF-REP-009** Exportación Excel y CSV.

**RF-REP-010** Descarga PDF cuando corresponda.

**RF-REP-011** Filtros por período.

**RF-REP-012** Comparación entre períodos.

**RF-REP-013** Visualización de tendencia.

**RF-REP-014** Acceso a detalle desde indicador.

**RF-REP-015** Programación de reportes.

---

## 9.15 Vista mandante

**RF-MAN-001** Acceso segregado por organización.

**RF-MAN-002** Visualizar cartera asignada.

**RF-MAN-003** Visualizar recupero y metas.

**RF-MAN-004** Visualizar estado judicial.

**RF-MAN-005** Visualizar avance por etapa.

**RF-MAN-006** Visualizar causas críticas.

**RF-MAN-007** Visualizar compromisos y pagos.

**RF-MAN-008** Visualizar gastos y rendiciones.

**RF-MAN-009** Descargar respaldos autorizados.

**RF-MAN-010** Ingresar consultas.

**RF-MAN-011** Revisar respuestas.

**RF-MAN-012** Consultar trazabilidad.

**RF-MAN-013** Comparar vigente y castigada.

**RF-MAN-014** Diferenciar dación y recupero.

**RF-MAN-015** Visualizar brecha contra meta.

**RF-MAN-016** Ver ranking comparativo entre los estudios jurídicos que gestionan su cartera (recupero, SLA, tiempo de recuperación, costo judicial).

**RF-MAN-017** Seleccionar un estudio del ranking y navegar a su detalle ejecutivo filtrado.

**RF-MAN-018** Ver tablas de recupero tipo vintage/cohorte por camada de originación, en modo acumulado y comparativo entre camadas.

**RF-MAN-019** Ver comparativo de costos/gastos judiciales por causa individual, con margen y ratio de rentabilidad.

**RF-MAN-020** Ver vista ejecutiva de estado total de causas con comparativas por estudio y por fecha/período.

**RF-MAN-021** Navegar mediante drill-down consistente entre consolidado, mandante/cartera, segmento y causa individual, sin perder filtros de período.

**RF-MAN-022** Exportar tablas de vintage, ranking y rentabilidad por causa a Excel/CSV.

*(Detalle funcional y de negocio en `META_MODELO_NEGOCIO.md` §3-4.)*

---

## 9.16 Vista Abogado Jefe

**RF-JEFE-001** Ver métricas ejecutivas (recupero, cuantía, rentabilidad, costo judicial, SLA, tiempo de recuperación, remates, daciones, pagos) acotadas a las carteras/causas gestionadas por su propio estudio.

**RF-JEFE-002** Ver tablas vintage/cohorte de recupero del estudio, con posibilidad de acotar por mandante o por abogado/procurador.

**RF-JEFE-003** Ver comparativo de costos/gastos y rentabilidad por causa, acotado a las causas de su estudio.

**RF-JEFE-004** Ver vista ejecutiva comparativa de estado total de causas de su estudio por fecha/período, sin eje de comparación entre estudios.

**RF-JEFE-005** Ver métricas desagregadas por abogado y por procurador de su equipo (carga, productividad, SLA individual, recupero atribuido, tareas críticas vencidas).

**RF-JEFE-006** Ver la cartera agrupada por abogado/procurador responsable, con drill-down hacia sus causas.

**RF-JEFE-007** Comparar el desempeño de su estudio contra el período anterior o una meta interna.

**RF-JEFE-008** Exportar las tablas anteriores a Excel/CSV.

*(Detalle funcional y de negocio en `META_MODELO_NEGOCIO.md` §3, §5. Regla de aislamiento: el alcance "ESTUDIO" del Abogado Jefe se fija server-side y no es parametrizable desde la UI ni la API — ver `arquitectura_funcional.md` §23.)*

---

## 9.17 Inteligencia artificial

**RF-IA-001** Priorizar causas.

**RF-IA-002** Sugerir próximas acciones.

**RF-IA-003** Detectar estancamiento.

**RF-IA-004** Resumir cronología.

**RF-IA-005** Extraer datos de documentos.

**RF-IA-006** Clasificar escritos y comprobantes.

**RF-IA-007** Detectar inconsistencias.

**RF-IA-008** Recomendar reasignaciones.

**RF-IA-009** Generar borradores controlados.

**RF-IA-010** Explicar factores de priorización.

### Condiciones

- Las sugerencias no deberán ocultar su naturaleza automatizada.
- Las decisiones jurídicas críticas requerirán validación humana.
- Se deberá registrar versión del modelo o regla utilizada.
- Los resultados deberán ser auditables.
- Debe existir mecanismo de corrección por parte del usuario.

---

## 10. Requerimientos no funcionales

## 10.1 Seguridad

**RNF-SEG-001** Cifrado TLS para comunicaciones.

**RNF-SEG-002** Cifrado de datos sensibles en reposo.

**RNF-SEG-003** Gestión segura de secretos.

**RNF-SEG-004** RBAC de mínimo privilegio.

**RNF-SEG-005** MFA para administradores y perfiles críticos.

**RNF-SEG-006** Registro de accesos.

**RNF-SEG-007** Protección contra OWASP Top 10.

**RNF-SEG-008** Políticas de contraseña.

**RNF-SEG-009** Bloqueo ante intentos fallidos.

**RNF-SEG-010** Segregación de datos por mandante.

**RNF-SEG-011** Revisión periódica de permisos.

**RNF-SEG-012** Capacidad de revocación inmediata.

---

## 10.2 Privacidad

- Minimización de datos.
- Acceso por necesidad operacional.
- Trazabilidad de visualización y descarga.
- Retención parametrizable.
- Eliminación o anonimización según política.
- Control de exportaciones.
- Protección de información financiera, judicial y personal.
- Gestión de consentimiento cuando aplique.
- Cumplimiento de normativa chilena aplicable y contratos con mandantes.

---

## 10.3 Disponibilidad

**RNF-DIS-001** Disponibilidad objetivo mínima de 99,5% mensual para funciones centrales.

**RNF-DIS-002** Mantenimientos programados comunicados.

**RNF-DIS-003** Recuperación ante fallas.

**RNF-DIS-004** Procesos críticos con reintentos.

**RNF-DIS-005** Monitoreo de servicios externos.

**RNF-DIS-006** Degradación controlada cuando una integración falle.

---

## 10.4 Rendimiento

- Carga inicial de vistas comunes: objetivo inferior a 3 segundos.
- Consultas complejas: objetivo inferior a 8 segundos.
- Búsqueda por RUT, OP o ROL: objetivo inferior a 2 segundos.
- Procesos masivos: ejecución asincrónica.
- Exportaciones grandes: generación en segundo plano.
- Caché para indicadores ejecutivos.
- No consultar repetidamente fuentes lentas si la información puede persistirse.
- La información deberá mostrar fecha y hora de actualización.

---

## 10.5 Escalabilidad

- Soportar crecimiento por mandante.
- Soportar aumento de causas y documentos.
- Separar servicios de integración.
- Permitir procesamiento horizontal de colas.
- Incorporar almacenamiento de objetos.
- Diseñar índices para RUT, OP, ROL, mandante, estado y responsable.
- Evitar dependencias monolíticas innecesarias.

---

## 10.6 Usabilidad

- Navegación consistente.
- Menús simples.
- Menor profundidad de navegación.
- Información crítica visible sin exceso de clics.
- Acciones frecuentes accesibles desde la bandeja.
- Feedback inmediato.
- Estados vacíos y errores comprensibles.
- Diseño responsive.
- Accesibilidad básica WCAG 2.1 AA como objetivo.
- Validación con usuarios reales.

---

## 10.7 Auditabilidad

Cada acción crítica deberá registrar:

- Usuario.
- Fecha y hora.
- IP o contexto de sesión cuando corresponda.
- Entidad afectada.
- Acción.
- Valor anterior.
- Valor nuevo.
- Fuente.
- Resultado.
- Identificador de correlación.
- Evidencia asociada.

Los registros de auditoría no deberán ser editables por usuarios operacionales.

---

## 10.8 Mantenibilidad

- Arquitectura modular.
- Código documentado.
- Estándares de desarrollo.
- Revisión por Pull Request.
- Cobertura de pruebas.
- Gestión de versiones.
- Feature flags.
- Configuración fuera del código.
- Catálogos parametrizables.
- Documentación de APIs.
- Gestión formal de deuda técnica.

---

## 10.9 Compatibilidad

- Navegadores modernos.
- Uso prioritario en escritorio.
- Diseño adaptable a tablet.
- Funciones simplificadas para móvil.
- Archivos PDF, XLSX, CSV, DOCX, JPG y PNG cuando corresponda.
- Fechas y moneda en formato local configurable.

---

## 10.10 Respaldo y continuidad

- Respaldos automáticos.
- Política de retención.
- Pruebas de restauración.
- RPO y RTO definidos con negocio.
- Recuperación de documentos.
- Alta disponibilidad para componentes críticos.
- Plan de contingencia para PJUD y VISOR.

---

## 11. Arquitectura funcional propuesta

### 11.1 Capa de experiencia

- Portal interno.
- Portal mandante.
- Bandeja MiCartera.
- Módulo judicial.
- Módulo cobranza.
- Módulo documental.
- Módulo reportería.
- Consola administrativa.

### 11.2 Capa de servicios de negocio

- Servicio de mandantes.
- Servicio de cartera.
- Servicio de deudores.
- Servicio de operaciones.
- Servicio de causas.
- Servicio de gestiones.
- Servicio de documentos.
- Servicio de pagos.
- Servicio de gastos.
- Servicio de alertas.
- Servicio de consultas.
- Servicio de reglas.
- Servicio de auditoría.

### 11.3 Capa de automatización

- Motor de reglas.
- Orquestador de procesos.
- RPA.
- Scraping controlado.
- OCR.
- Generación documental.
- Procesamiento de correo.
- Motor de IA.

### 11.4 Capa de integración

- API Gateway.
- Adaptador VISOR.
- Adaptador PJUD.
- Adaptador CRM legado.
- Adaptador correo.
- Adaptador OneDrive.
- Adaptador WhatsApp.
- Adaptador Power BI.
- Adaptador Infoget.
- Adaptadores por mandante.

### 11.5 Capa de datos

- Base de datos transaccional.
- Repositorio documental.
- Cola de mensajes.
- Caché.
- Data mart analítico.
- Almacén de auditoría.
- Registro de eventos de integración.

---

## 12. Arquitectura técnica sugerida

La tecnología específica deberá validarse según el ecosistema actual, pero la solución debería considerar:

- Frontend web SPA o SSR.
- Backend basado en APIs.
- Autenticación mediante proveedor de identidad.
- Base de datos relacional.
- Almacenamiento de objetos para documentos.
- Procesamiento asincrónico con colas.
- Contenedores.
- CI/CD.
- Infraestructura como código.
- Observabilidad centralizada.
- Integración por REST, archivos, SFTP, correo o RPA.
- Separación de ambientes.
- API versionada.
- Mecanismos de idempotencia.
- Correlation ID para trazabilidad distribuida.

---

## 13. Integraciones

## 13.1 PJUD

### Uso

- Consulta de causas.
- Rescate de estados.
- Detección de nuevas causas.
- Presentación de escritos.
- Captura de comprobantes.

### Tipo

Scraping o RPA, sujeto a autorizaciones, restricciones técnicas y disponibilidad.

### Consideraciones

- Fragilidad ante cambios.
- Reintentos.
- Monitoreo.
- Evidencia.
- Cola manual.
- Limitación de frecuencia.
- Credenciales seguras.

---

## 13.2 VISOR

### Uso

- Consulta de cartera.
- Obtención de pagarés.
- Consulta de deuda.
- Sincronización de estados.
- Registro de gestiones.
- Asociación por OP.

### Tipo

API si está disponible; RPA como alternativa controlada.

---

## 13.3 CRM legado

### Uso

- Recuperar estados y semáforos.
- Consultar detalle de gestiones.
- Consolidar información existente.
- Mantener transición operativa.

### Requerimiento

La consulta lenta deberá ejecutarse de forma programada y persistir su resultado para consumo eficiente.

---

## 13.4 Correo

### Uso

- Procesar bandejas de receptores.
- Recibir adjuntos.
- Generar consultas.
- Enviar alertas.
- Mantener trazabilidad.

### Controles

- Whitelist de remitentes.
- Validación de archivos.
- Prevención de malware.
- Detección de duplicados.
- Registro de correo origen.

---

## 13.5 OneDrive o repositorio documental

### Uso

- Migración o sincronización de documentos.
- Respaldo de expedientes.
- Acceso controlado.

---

## 13.6 Power BI

### Uso

- Consumo analítico.
- Integración temporal con reportes existentes.
- Exposición de datasets controlados.

---

## 13.7 WhatsApp y canales

### Uso

- Registro de contacto.
- Seguimiento de conversaciones.
- Evidencia de interacción.
- Derivación a gestión humana.

Se deberá cumplir la normativa y políticas del proveedor del canal.

---

## 14. Reglas de negocio generales

1. La OP es el identificador principal de integración cuando el mandante así lo defina.
2. RUT y demandado deberán utilizarse para validación cruzada.
3. Una OP puede aparecer en más de una causa; en tal caso se requiere desambiguación.
4. El estado interno no deberá sobrescribir silenciosamente un estado externo.
5. Toda discrepancia deberá quedar registrada.
6. Las causas finalizadas no deberán aparecer como pendientes salvo excepción.
7. Los semáforos deberán calcularse desde reglas parametrizadas.
8. Los casos antiguos no sincronizados podrán aislarse temporalmente.
9. Los documentos críticos requieren revisión humana.
10. Las automatizaciones deberán evitar duplicidad.
11. Los pagos deberán diferenciar información, conciliación, aplicación y recupero.
12. Los gastos deberán mantener vínculo con rendición y reembolso.
13. Ningún mandante deberá acceder a información de otro mandante.
14. Las acciones masivas deberán solicitar confirmación.
15. Las modificaciones críticas deberán mostrar impacto antes de guardar.
16. Las reglas de SLA podrán variar por mandante, producto y etapa.
17. Las fechas de fuente y sincronización deben ser visibles.
18. La prioridad automática deberá ser explicable.
19. Los catálogos deberán ser parametrizables.
20. Las excepciones deberán administrarse mediante bandejas y estados.

---

## 15. Semáforos y SLA

### 15.1 Semáforo sugerido

- Verde: dentro del plazo.
- Amarillo: próximo a vencer.
- Rojo: vencido o crítico.
- Gris: sin información suficiente.
- Azul: bloqueado por tercero.
- Morado: pendiente de aprobación.

### 15.2 Variables

- Fecha de última gestión.
- Etapa procesal.
- SLA del mandante.
- Tipo de acción.
- Antigüedad.
- Días hábiles.
- Bloqueos.
- Estado de integración.
- Monto o prioridad estratégica.

### 15.3 Controles

- Recalcular diariamente.
- Recalcular ante gestión.
- Registrar regla aplicada.
- Mantener histórico de cierre de mes cuando se utilice para bonos.
- Permitir auditoría de cambios.

---

## 16. Dashboards e indicadores

## 16.1 Dashboard ejecutivo

- Cartera total.
- Cartera por mandante.
- Causas activas.
- Recupero del período.
- Meta.
- Cumplimiento.
- Brecha.
- Proyección.
- Causas por semáforo.
- Causas sin gestión.
- Causas críticas.
- Escritos generados.
- Escritos pendientes.
- Pagos pendientes de aplicación.
- Gastos pendientes de reembolso.
- Productividad por equipo.

## 16.2 Dashboard judicial

- Causas por etapa.
- Tiempo promedio por etapa.
- Distribución por tribunal.
- Notificaciones.
- Demandas presentadas.
- Escritos presentados.
- Casos fuera de SLA.
- Casos sin movimiento.
- Incobrables propuestos.
- Tasa de avance.

## 16.3 Dashboard de recupero

- Recupero final.
- Recupero informado.
- Recupero conciliado.
- Recupero aplicado.
- Meta.
- Brecha.
- Tendencia.
- Vigente versus castigada.
- Dación versus recupero.
- Ticket promedio.
- Cumplimiento por ejecutivo.
- Concentración por operación.

## 16.4 Dashboard de gastos

- Pagado.
- Rendido.
- Reembolsado.
- Pendiente.
- Rechazado.
- Pérdida.
- Aging.
- Mandante.
- Receptor.
- Tipo de gasto.

## 16.5 Dashboard de receptores

- Gestiones asignadas.
- Gestiones realizadas.
- Tasa de éxito.
- Notificaciones negativas.
- Tiempo promedio.
- Pendientes.
- Ranking.
- Tendencia.

---

## 17. Diseño UX/UI

### Principios

- Vista ejecutiva, limpia y profesional.
- Información priorizada.
- Menos menús y navegación más directa.
- Consistencia entre módulos.
- Uso de tablas avanzadas para operación.
- Uso de tarjetas y gráficos para gestión.
- Detalle lateral o modal para acciones rápidas.
- Timeline para cronología.
- Badges para estados.
- Alertas visibles pero no invasivas.
- Diseño apto para gran volumen de datos.
- Evitar sobrecarga visual.

### Navegación sugerida

1. Inicio.
2. MiCartera.
3. Causas.
4. Cobranza.
5. Pagos.
6. Documentos.
7. Gastos.
8. Reportes.
9. Consultas.
10. Administración.

---

## 18. Auditoría y trazabilidad

### Eventos mínimos

- Inicio de sesión.
- Consulta de información sensible.
- Creación o modificación de causa.
- Cambio de estado.
- Asignación.
- Registro de gestión.
- Generación de documento.
- Aprobación o rechazo.
- Presentación en PJUD.
- Registro de pago.
- Conciliación.
- Aplicación.
- Registro de gasto.
- Rendición.
- Exportación.
- Cambio de permisos.
- Cambio de configuración.
- Ejecución de automatización.
- Error de integración.

### Consulta

La auditoría deberá poder filtrarse por:

- Usuario.
- Mandante.
- Entidad.
- Acción.
- Fecha.
- Resultado.
- Correlation ID.

---

## 19. Gestión de errores y excepciones

La plataforma deberá contar con bandejas específicas para:

- Error de carga.
- Duplicidad.
- Causa no asociada.
- Error PJUD.
- Error VISOR.
- Documento incompleto.
- OCR de baja confianza.
- Pago no conciliado.
- Gasto observado.
- Consulta vencida.
- Integración detenida.
- Registro inconsistente.

Cada excepción deberá incluir:

- Descripción.
- Fuente.
- Fecha.
- Responsable.
- Prioridad.
- Número de intentos.
- Evidencia.
- Acción recomendada.
- Estado.
- Resolución.

---

## 20. DevOps y ciclo de desarrollo

### Requerimientos

- Repositorio Git.
- Estrategia de ramas.
- Pull Requests.
- Revisión de código.
- Pipeline CI/CD.
- Ambientes separados.
- Variables por ambiente.
- Pruebas automáticas.
- Análisis estático.
- Escaneo de dependencias.
- Registro de versiones.
- Rollback.
- Feature flags.
- Monitoreo post despliegue.

### Ambientes

- Desarrollo.
- QA.
- Preproducción, solo cuando sea necesario.
- Producción.

No se deberá utilizar preproducción como ambiente permanente de desarrollo.

---

## 21. Pruebas y calidad

### Tipos de prueba

- Unitarias.
- Integración.
- API.
- UI.
- Seguridad.
- Rendimiento.
- Regresión.
- RPA.
- Compatibilidad.
- Recuperación.
- UAT.

### Criterios de salida

- Casos críticos aprobados.
- Sin defectos bloqueantes.
- Defectos altos con plan aceptado.
- Integraciones monitoreadas.
- Rollback probado.
- Manuales actualizados.
- Usuarios capacitados.

---

## 22. Criterios de aceptación transversales

Una funcionalidad se considerará aceptada cuando:

1. Cumpla el flujo definido.
2. Respete permisos.
3. Registre auditoría.
4. Maneje errores.
5. Entregue feedback al usuario.
6. Evite duplicidad.
7. Sea trazable.
8. Cuente con pruebas.
9. Funcione en ambientes definidos.
10. Haya sido validada por usuarios del rol objetivo.
11. Tenga documentación.
12. Sus indicadores puedan monitorearse.

---

## 23. Backlog consolidado por épica

## Épica A: Ingesta de datos

- Unificación de estados diarios.
- Omni-estado.
- Carga por archivo.
- Carga por API.
- Validación de calidad.
- Detección de duplicados.
- Gestión de errores.
- Sincronización de fuentes.

## Épica B: Escritos automáticos

- Generación de asume poder.
- Generación de patrocinio.
- Desarchivo con mandato.
- Plantillas.
- Aprobación.
- Presentación en PJUD.
- Control de reintentos.

## Épica C: Analítica

- Ranking de receptores.
- Demandas masivas.
- Gastos judiciales.
- Recupero.
- Metas.
- Productividad.
- SLA.
- Indicadores para mandante.

## Épica D: MiCartera

- Bandeja inteligente.
- Alertas.
- Incobrables.
- Consultas.
- Comunicación bidireccional.
- Acciones grupales.
- Vista gerencial.
- Refactor UX.
- Aislamiento de causas inconsistentes.
- RPA hacia VISOR.

## Épica E: Cobranza y recupero

- Contacto.
- Negociación.
- Compromisos.
- Cupones.
- Pagos.
- OCR.
- Conciliación.
- Aplicación.
- Recupero.
- Daciones.
- PUT.

## Épica F: Vista mandante

- Dashboard.
- Cartera.
- Metas.
- Recupero.
- Estado judicial.
- Gastos.
- Documentos.
- Consultas.
- Exportaciones.

## Épica G: Integración end-to-end

- Carga OP, RUT y demandado.
- Consulta VISOR.
- Generación de demanda.
- Aprobación.
- Presentación.
- Rescate PJUD.
- Asociación automática.
- Desambiguación.
- Actualización de estado.

## Épica H: Deuda técnica y DevOps

- Gestión de ramas.
- Refactor de código.
- Suite de pruebas.
- Pull Requests.
- Separación de ambientes.
- Observabilidad.
- Seguridad.
- Documentación.

---

## 24. Priorización sugerida

### Fase 1: Estabilización y visibilidad

- Autenticación y roles.
- Mandantes y carteras.
- Ingesta.
- Ficha única.
- MiCartera.
- Semáforos.
- Dashboard.
- Auditoría.
- Corrección VISOR–CRM.
- Gestión de ramas y despliegue.

### Fase 2: Automatización documental

- Plantillas.
- Generación de escritos.
- Aprobación.
- Generación de demandas.
- OCR de pagarés.
- Presentación PJUD.
- Gestión de excepciones.

### Fase 3: Cobranza, pagos y gastos

- Contactos.
- Negociaciones.
- Compromisos.
- OCR de comprobantes.
- Conciliación.
- Recupero.
- Gastos.
- Rendiciones.

### Fase 4: Vista mandante y analítica

- Portal mandante.
- Metas.
- Reportería.
- Ranking de receptores.
- Tendencias.
- Programación de reportes.

### Fase 5: Inteligencia y end-to-end

- Priorización IA.
- Próxima mejor acción.
- Resúmenes.
- Automatización VISOR.
- Rescate de causas.
- Asociación automática.
- Optimización completa del ciclo.

---

## 25. Riesgos principales

1. Dependencia de PJUD.
2. Cambios en interfaces externas.
3. Ausencia de APIs.
4. Calidad de datos.
5. Duplicidad de operaciones.
6. Reglas distintas por mandante.
7. Exceso de automatización sin control.
8. Credenciales compartidas.
9. Falta de trazabilidad histórica.
10. Resistencia al cambio.
11. Integraciones lentas.
12. Deuda técnica.
13. Falta de ambientes.
14. Documentos de baja calidad.
15. Divergencia entre datos internos y reportes externos.
16. Errores en aplicación de pagos.
17. Exposición de información entre mandantes.
18. Falta de definición de SLA.
19. Backlog no priorizado.
20. Dependencia de personas clave.

---

## 26. Dependencias

- Acceso autorizado a PJUD.
- Acceso a VISOR.
- Credenciales técnicas.
- Definición de campos por tipo de demanda.
- Plantillas jurídicas validadas.
- Reglas de negocio por mandante.
- Definición de SLA.
- Catálogo de estados.
- Fuentes de pagos.
- Fuentes de cartolas.
- Acceso a correos de receptores.
- Mapeo de roles.
- Infraestructura.
- Política de seguridad.
- Disponibilidad de usuarios para pruebas.

---

## 27. Decisiones pendientes

1. Arquitectura tecnológica definitiva.
2. Proveedor de identidad.
3. Estrategia de integración PJUD.
4. Fuente maestra de estados.
5. Política de persistencia histórica de semáforos.
6. Modelo de permisos por mandante.
7. Ventana de migración histórica.
8. Política de retención documental.
9. SLA operacionales.
10. Tolerancias de pago.
11. Tipos de demanda iniciales.
12. Acciones que requerirán doble aprobación.
13. Uso de firma electrónica.
14. Alcance móvil.
15. Modelo de IA.
16. Herramienta BI definitiva.
17. Plan de contingencia por caída de sistemas externos.
18. Modelo de soporte.

---

## 28. Métricas de éxito del producto

- Reducción del tiempo medio por gestión.
- Reducción de carga manual.
- Porcentaje de causas dentro de SLA.
- Porcentaje de estados sincronizados.
- Porcentaje de escritos generados automáticamente.
- Porcentaje de presentaciones exitosas.
- Reducción de errores de carga.
- Reducción de pagos no conciliados.
- Reducción de gastos no recuperados.
- Aumento de recupero final.
- Cumplimiento de meta.
- Productividad por usuario.
- Tiempo de respuesta a consultas.
- Adopción por rol.
- Satisfacción del mandante.
- Disponibilidad de plataforma.
- Tasa de errores de integración.
- Tiempo de resolución de excepciones.

---

## 29. Estrategia de implementación

Se recomienda un modelo **Dual-Track**:

### Discovery

- Levantamiento.
- Validación de procesos.
- Diseño UX/UI.
- Prototipos.
- Pruebas con usuarios.
- Definición de reglas.
- Refinamiento técnico.

### Delivery

- Desarrollo incremental.
- Integración continua.
- QA.
- Pilotos.
- Despliegues controlados.
- Medición.
- Ajustes.

El diseño y la validación deberán adelantarse al desarrollo, pero ambos tracks deberán operar de manera superpuesta, evitando un enfoque en cascada y evitando también desarrollar todas las áreas simultáneamente sin priorización.

---

## 30. Fuentes de consolidación

Este documento se elaboró a partir de los antecedentes funcionales y técnicos disponibles para CRM Judicial 3.0, incluyendo:

- Backlog de la Plataforma de Gestión Judicial y Cobranza.
- Resumen ejecutivo de requerimientos PH Legal.
- Especificación de integración CRM.
- Levantamientos sobre MiCartera.
- Requerimientos de escritos automáticos.
- Requerimientos de generación de demandas.
- Requerimientos de vista mandante.
- Requerimientos de cobranza, pagos, gastos y recupero.
- Requerimientos de integración VISOR y PJUD.
- Definiciones de roles y vistas.
- Roadmap y enfoque Dual-Track.

---

## 31. Conclusión

CRM Judicial 3.0 deberá constituirse como la plataforma central de operación legal y de recupero de PH Legal.

Su valor no radica únicamente en digitalizar pantallas existentes, sino en coordinar personas, procesos, datos, documentos, automatizaciones e integraciones dentro de un flujo único y auditable.

El producto objetivo deberá permitir que cada rol acceda a una vista específica y accionable, manteniendo una única fuente de información para la operación. La plataforma deberá combinar gestión judicial, cobranza, control financiero, automatización documental, analítica e inteligencia, con un diseño seguro, escalable y trazable.

La construcción deberá priorizar primero la estabilidad de datos, la bandeja operativa, los roles y la auditoría. Sobre esa base deberán incorporarse progresivamente la automatización documental, la gestión de pagos, la vista mandante y el ciclo end-to-end.
