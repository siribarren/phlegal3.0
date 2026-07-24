import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const initialTasks = [
  {
    id: 1,
    title: "Validar antecedentes del cliente",
    detail: "Revision documental antes de ejecutar la accion.",
  },
  {
    id: 2,
    title: "Enviar notificacion de seguimiento",
    detail: "Registrar contacto y dejar trazabilidad.",
  },
  {
    id: 3,
    title: "Actualizar estado de la tarea",
    detail: "Mover el caso al siguiente estado operativo.",
  },
];

export default function TaskCompletionAnimation() {
  const [tasks, setTasks] = useState(initialTasks);
  const [completed, setCompleted] = useState([]);
  const [finishingId, setFinishingId] = useState(null);

  function completeTask(task) {
    setFinishingId(task.id);

    window.setTimeout(() => {
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setCompleted((current) => [task, ...current]);
      setFinishingId(null);
    }, 650);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-slate-950">
        Animacion de completitud
      </h1>
      <p className="mt-2 text-slate-600">
        La tarea confirma el cambio de estado, se marca como completada y baja a
        la seccion de tareas realizadas.
      </p>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Tareas pendientes</h2>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold text-slate-700">
            {tasks.length}
          </span>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => {
              const isFinishing = finishingId === task.id;

              return (
                <motion.article
                  layout
                  key={task.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isFinishing ? 0.985 : 1,
                    backgroundColor: isFinishing ? "#f3f4f6" : "#ffffff",
                    color: isFinishing ? "#6b7280" : "#111827",
                  }}
                  exit={{
                    opacity: 0,
                    y: 18,
                    scale: 0.96,
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-lg border border-slate-200 p-4 shadow-sm"
                >
                  {isFinishing && (
                    <motion.div
                      className="absolute left-4 right-4 top-1/2 h-0.5 bg-slate-400"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{ originX: 0 }}
                    />
                  )}

                  <div>
                    <p
                      className={
                        isFinishing
                          ? "font-semibold line-through"
                          : "font-semibold"
                      }
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{task.detail}</p>
                  </div>

                  <button
                    type="button"
                    disabled={isFinishing}
                    onClick={() => completeTask(task)}
                    className="rounded-lg bg-slate-950 px-4 py-2 font-bold text-white transition hover:bg-slate-800 disabled:opacity-0"
                  >
                    {isFinishing ? "Completando..." : "Completar tarea"}
                  </button>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Tareas realizadas</h2>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold text-slate-700">
            {completed.length}
          </span>
        </div>

        <div className="grid gap-3">
          {completed.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-slate-500">
              Todavia no hay tareas realizadas.
            </div>
          )}

          <AnimatePresence>
            {completed.map((task) => (
              <motion.article
                layout
                key={task.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid grid-cols-[28px_1fr] items-center gap-3 rounded-lg border border-slate-300 bg-slate-100 p-4 text-slate-500"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 font-black text-emerald-700">
                  ✓
                </span>
                <p className="line-through">{task.title}</p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
