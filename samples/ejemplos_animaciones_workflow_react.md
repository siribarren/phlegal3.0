# Ejemplos de Animaciones en React para Workflow de Actividades

## Objetivo

Diseñar una experiencia visual para un workflow donde el usuario selecciona un grupo de tareas, el sistema ejecuta 2 o 3 pasos supervisados, realiza una accion automatica, muestra resultados, cambia estados y genera un registro de auditoria.

El caso contempla entre 3 y 10 tareas masivas. Cada tarea puede seguir distintos arboles de decision despues del analisis, pero todas comparten una base unica de estados.

## Modelo Base del Workflow

Estados comunes sugeridos:

```ts
type TaskStatus =
  | "selected"
  | "queued"
  | "analyzing"
  | "decision"
  | "ready"
  | "executing"
  | "completed"
  | "failed"
  | "manual_review"
  | "logged";
```

Flujo comun:

1. Seleccion de tareas.
2. Evaluacion o analisis.
3. Decision automatica o derivacion.
4. Ejecucion de accion automatica.
5. Visualizacion del resultado.
6. Cambio de estado de cada tarea.
7. Generacion de registro o bitacora.

## 1. Lista de Tareas con Animacion de Seleccion

Este patron sirve para elegir entre 3 y 10 tareas antes de iniciar el proceso.

Animaciones sugeridas:

- La card seleccionada aumenta levemente de escala.
- Aparece borde activo o glow suave.
- El checkbox cambia a un icono de confirmacion.
- Las tareas seleccionadas pueden agruparse visualmente.

Ejemplo conceptual:

```tsx
<motion.div
  layout
  animate={{
    scale: selected ? 1.02 : 1,
    borderColor: selected ? "#2563eb" : "#e5e7eb",
    backgroundColor: selected ? "#eff6ff" : "#ffffff"
  }}
  transition={{ type: "spring", stiffness: 300, damping: 24 }}
>
  <TaskCard task={task} />
</motion.div>
```

Uso recomendado: cuando se quiere reforzar que el usuario esta construyendo un lote antes de ejecutar una accion masiva.

## 2. Pipeline Horizontal de Estados

Sirve para mostrar que todas las tareas comparten una base comun, aunque algunas puedan tomar rutas distintas despues del analisis.

Etapas sugeridas:

```text
Seleccionadas -> Analisis -> Decision -> Ejecucion -> Resultado -> Registro
```

Animaciones sugeridas:

- Cada etapa se ilumina al comenzar.
- La linea entre etapas se llena progresivamente.
- Los pasos completados quedan con check.
- Los errores quedan en rojo.
- Las derivaciones a revision manual quedan en amarillo.

Ejemplo conceptual:

```tsx
<motion.div
  className="progress-bar"
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.6, ease: "easeInOut" }}
/>
```

Uso recomendado: vista ejecutiva o de supervision general.

## 3. Cards por Tarea con Mini Timeline Interno

Cada tarea puede mostrar sus propios pasos internos, permitiendo seguimiento individual dentro del lote.

Ejemplo visual:

```text
Tarea 001
[Validada] -> [Evaluando deuda] -> [Ejecutar accion] -> [Registrar]
```

Animaciones sugeridas:

- La card cambia de estado en tiempo real.
- El paso activo muestra pulso o spinner suave.
- Al completar, aparece un check animado.
- Si se requiere revision manual, la card se mueve o destaca en una zona especial.

Tabla de estados visuales:

| Estado | Color | Animacion sugerida |
| --- | --- | --- |
| Pendiente | Gris | Sin movimiento |
| Analizando | Azul | Pulse o spinner suave |
| Decision | Azul intenso o morado | Highlight |
| Ejecutando | Naranja | Barra animada |
| Completado | Verde | Check y fade |
| Error | Rojo | Shake leve |
| Revision manual | Amarillo | Badge persistente |

Uso recomendado: cuando se necesita supervisar el avance de cada tarea sin perder la vision del lote.

## 4. Arbol de Decision Animado por Tarea

Cuando una tarea termina su analisis, puede mostrar brevemente el camino que tomo.

Ejemplo:

```text
Analisis
├─ Cumple reglas -> Ejecutar automatico
├─ Falta informacion -> Revision manual
└─ Riesgo alto -> Bloquear y registrar
```

Opciones tecnicas:

- `React Flow` si el arbol debe ser navegable o interactivo.
- `framer-motion` si solo se necesita una animacion compacta.
- `XState` si se quiere modelar formalmente la maquina de estados.

Ejemplo conceptual:

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
>
  <DecisionPath status="Cumple reglas" result="Ejecutar automatico" />
</motion.div>
```

Uso recomendado: auditoria, explicabilidad del resultado o escenarios donde el usuario necesita entender por que el sistema tomo una decision.

## 5. Vista Tipo Kanban por Estado

Este patron es util para gestion masiva y supervision operativa.

Columnas sugeridas:

```text
Seleccionadas | Analizando | En decision | Ejecutando | Completadas | Revision
```

Animaciones sugeridas:

- Las tareas se mueven de columna con transiciones suaves.
- Las cards usan `layout` para evitar saltos bruscos.
- Las tareas finalizadas se compactan.
- Las tareas con excepciones quedan destacadas.

Ejemplo conceptual:

```tsx
<motion.div layout>
  {tasks.map(task => (
    <motion.div layout key={task.id}>
      <TaskCard task={task} />
    </motion.div>
  ))}
</motion.div>
```

Uso recomendado: cuando se quiere ver flujo, volumen y excepciones al mismo tiempo.

## 6. Execution Console o Bitacora Viva

Despues de ejecutar la accion automatica, conviene mostrar una bitacora en tiempo real.

Ejemplo:

```text
10:31:02 | 8 tareas seleccionadas
10:31:04 | Tarea 001 validada correctamente
10:31:06 | Tarea 002 derivada a revision manual
10:31:08 | Accion automatica ejecutada en 6 tareas
10:31:10 | Registro generado
```

Animaciones sugeridas:

- Cada linea entra con fade-in.
- Iconos segun tipo de evento.
- Scroll automatico hacia el ultimo registro.
- Agrupacion por tarea, hito o severidad.

Uso recomendado: cuando se necesita trazabilidad y confianza operacional.

## 7. Animacion de Accion Automatica Final

Cuando el sistema ejecuta la accion masiva, la interfaz debe mostrar claramente que el proceso esta corriendo y luego cerrar con un resumen.

Opciones visuales:

1. El boton cambia de `Ejecutar` a `Ejecutando...`.
2. Aparece una barra de progreso por lote.
3. Las tareas se van marcando una a una.
4. Al finalizar aparece un resumen ejecutivo.

Ejemplo de resumen:

```text
8 tareas procesadas
6 completadas
1 enviada a revision
1 con error
Registro generado correctamente
```

Ejemplo conceptual:

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
>
  <ExecutionSummary />
</motion.div>
```

Uso recomendado: cierre claro del proceso, especialmente para usuarios ejecutivos o supervisores.

## Patron Recomendado

Para este caso, la mejor combinacion seria:

1. Lista seleccionable de tareas.
2. Pipeline superior del proceso.
3. Cards animadas por tarea.
4. Bitacora lateral.
5. Resumen final del lote.

Estructura sugerida de pantalla:

```text
[Pipeline general del proceso]

[Resumen lote]
8 seleccionadas | 5 analizadas | 2 ejecutadas | 1 revision

[Lista/Cards de tareas]        [Bitacora en vivo]
Tarea 001 - Completada          10:31 Validada
Tarea 002 - Revision            10:32 Derivada
Tarea 003 - Ejecutando          10:33 Accion enviada
```

Esta estructura permite equilibrar control, supervision, trazabilidad y automatizacion.

## Librerias React Recomendadas

| Necesidad | Libreria |
| --- | --- |
| Animaciones fluidas | `framer-motion` |
| Arboles de decision visuales | `reactflow` |
| Estados complejos | `xstate` |
| Iconos | `lucide-react` |
| Drag and drop / Kanban | `@dnd-kit/core` |
| UI base | `shadcn/ui` |
| Tablas masivas | `tanstack/react-table` |

## Experiencia Completa de Usuario

Flujo sugerido:

1. Usuario selecciona 7 tareas.
2. Las cards hacen animacion de seleccion.
3. Usuario presiona `Evaluar tareas`.
4. El pipeline avanza a `Analisis`.
5. Cada tarea muestra spinner o pulso.
6. Algunas tareas pasan directo a `Lista para ejecutar`.
7. Otras muestran arbol de decision y derivan a `Revision`.
8. Usuario supervisa resultados.
9. Usuario presiona `Ejecutar accion automatica`.
10. Se anima el progreso de ejecucion.
11. Las cards cambian a `Completado`, `Error` o `Revision`.
12. Se genera registro en bitacora.
13. Aparece resumen final del lote.

## Recomendacion Final

La interfaz debe transmitir tres ideas:

- Control: el usuario entiende que tareas selecciono y que esta ocurriendo.
- Trazabilidad: cada cambio de estado queda visible y registrado.
- Automatizacion supervisada: el sistema ejecuta acciones, pero explica resultados y excepciones.

Este enfoque evita que el workflow se perciba como una caja negra y permite operar tareas masivas con confianza.
