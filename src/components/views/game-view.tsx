import { useCallback, useMemo, useRef } from "react";
import { Maximize, Minimize, RotateCw } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/modals/question-card";
import { CategoryExhaustedDialog, RoundCompleteDialog } from "@/components/modals/round-complete";
import { SituationWheel } from "@/components/wheel/situation-wheel";
import { useFullscreen } from "@/lib/a11y/use-fullscreen";
import { getRoundProgress, useAppStore } from "@/store/app-store";

export function GameView() {
  const shellRef = useRef<HTMLDivElement>(null);
  const { active, supported, toggle } = useFullscreen(shellRef);
  const round = useAppStore((state) => state.round);
  const spinDurationMs = useAppStore((state) => state.spinDurationMs);
  const instantWheel = useAppStore((state) => state.instantWheel);
  const spin = useAppStore((state) => state.spin);
  const onSpinEnd = useAppStore((state) => state.onSpinEnd);
  const completeQuestion = useAppStore((state) => state.completeQuestion);
  const anotherFromCategory = useAppStore((state) => state.anotherFromCategory);
  const returnToWheel = useAppStore((state) => state.returnToWheel);
  const requestLeaveGame = useAppStore((state) => state.requestLeaveGame);
  const requestFinish = useAppStore((state) => state.requestFinish);
  const playAnotherRound = useAppStore((state) => state.playAnotherRound);
  const modifyActivity = useAppStore((state) => state.modifyActivity);

  const handleSpinEnd = useCallback(() => {
    onSpinEnd();
  }, [onSpinEnd]);

  const progress = getRoundProgress(round);
  const current = useMemo(() => {
    if (!round?.currentDraw) return { category: null, question: null };
    const category = round.categories.find((item) => item.id === round.currentDraw?.categoryId) ?? null;
    const question =
      category?.questions.find((item) => item.id === round.currentDraw?.questionId) ?? null;
    return { category, question };
  }, [round]);

  if (!round) return null;

  const spinning = round.spinning;
  const questionOpen = Boolean(round.currentDraw) && !spinning;
  const canSpin = !spinning && !round.currentDraw && !round.roundComplete && !round.pendingDraw;

  return (
    <div ref={shellRef} className="min-h-dvh overflow-x-clip bg-cream">
      <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col">
        <AppHeader
          trailing={
            supported ? (
              <Button
                variant="outline"
                size="sm"
                className="max-w-full px-3 text-sm"
                onClick={() => void toggle()}
                aria-pressed={active}
                aria-label={active ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {active ? (
                  <Minimize className="size-4" aria-hidden="true" />
                ) : (
                  <Maximize className="size-4" aria-hidden="true" />
                )}
                <span className="truncate">{active ? "Salir" : "Pantalla completa"}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="max-w-full px-3 text-sm"
                title="Tu navegador no admite pantalla completa"
                aria-disabled="true"
              >
                <Maximize className="size-4" aria-hidden="true" />
                <span className="truncate">Pantalla completa no disponible</span>
              </Button>
            )
          }
        />

        <main id="main" className="flex flex-1 flex-col px-4 pb-8 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
                Actividad
              </p>
              <h1 className="text-2xl font-extrabold text-indigo">Ruleta de Situaciones</h1>
            </div>
            <p className="rounded-full bg-surface px-3 py-1 text-sm font-semibold text-ink tabular-nums shadow-card">
              Preguntas realizadas: {progress.done}
            </p>
          </div>

          <div className="mt-6 flex flex-1 flex-col items-center justify-center">
            <SituationWheel
              categories={round.categories}
              rotation={round.wheelRotation}
              spinning={spinning}
              durationMs={spinDurationMs}
              instant={instantWheel}
              onSpinEnd={handleSpinEnd}
            />
            <Button
              size="lg"
              className="relative z-10 mt-6 w-full max-w-sm"
              onClick={spin}
              disabled={!canSpin}
              aria-disabled={!canSpin}
            >
              <RotateCw className="size-5" aria-hidden="true" />
              Girar la ruleta
            </Button>
            <p className="mt-2 text-sm text-ink-muted">
              {progress.remaining === 1
                ? "Queda 1 pregunta disponible."
                : `Quedan ${progress.remaining} preguntas disponibles.`}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => requestLeaveGame("prepare")}
              disabled={spinning}
            >
              Volver a configuración
            </Button>
            <Button
              variant="secondary"
              className="sm:flex-1"
              onClick={requestFinish}
              disabled={spinning}
            >
              Finalizar actividad
            </Button>
          </div>
        </main>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {round.announcement}
      </div>

      <QuestionCard
        open={questionOpen}
        category={current.category}
        question={current.question}
        onCompleted={completeQuestion}
        onAnother={anotherFromCategory}
        onBack={returnToWheel}
      />
      <CategoryExhaustedDialog
        name={round.roundComplete ? null : round.categoryExhaustedName}
        onBack={returnToWheel}
      />
      <RoundCompleteDialog
        open={round.roundComplete && !questionOpen}
        onNewRound={playAnotherRound}
        onModify={modifyActivity}
        onFinish={requestFinish}
      />
    </div>
  );
}
