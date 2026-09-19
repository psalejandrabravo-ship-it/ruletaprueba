import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { contrastText } from "@/lib/game/colors";
import { useAppStore } from "@/store/app-store";

export function SummaryView() {
  const summary = useAppStore((state) => state.summary);
  const playAnotherRound = useAppStore((state) => state.playAnotherRound);
  const modifyActivity = useAppStore((state) => state.modifyActivity);
  const goTo = useAppStore((state) => state.goTo);

  const total = summary?.total ?? 0;
  const categories = summary?.categories ?? [];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <AppHeader />
      <main id="main" className="flex-1 px-4 pb-10 sm:px-6">
        <h1 className="text-2xl font-extrabold text-indigo sm:text-3xl">Resumen de la actividad</h1>
        <p className="mt-3 text-lg text-ink">
          {total === 1
            ? "Se realizó 1 pregunta."
            : `Se realizaron ${total} preguntas.`}
        </p>

        <section className="mt-6 rounded-2xl bg-surface p-5 shadow-card" aria-label="Categorías que aparecieron">
          <h2 className="text-base font-extrabold text-indigo">Categorías que aparecieron</h2>
          {categories.length === 0 ? (
            <p className="mt-3 text-ink-muted">
              Esta ronda no registró preguntas completadas.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate font-semibold text-ink">{category.name}</span>
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-sm font-extrabold tabular-nums"
                    style={{
                      backgroundColor: category.color,
                      color: contrastText(category.color),
                    }}
                  >
                    {category.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 max-w-xl text-ink">
          Gracias por abrir este espacio de conversación. El resumen no se guarda: cada ronda
          empieza de nuevo cuando tú lo decidas.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" onClick={playAnotherRound}>
            Jugar otra ronda
          </Button>
          <Button variant="secondary" onClick={modifyActivity}>
            Modificar actividad
          </Button>
          <Button variant="outline" onClick={() => goTo("home")}>
            Volver al inicio
          </Button>
        </div>
      </main>
    </div>
  );
}
