import { useRef, useState } from "react";
import { CircleHelp } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { HowToPlayModal } from "@/components/modals/how-to-play-modal";
import { WheelPreview } from "@/components/wheel/wheel-preview";
import { useAppStore } from "@/store/app-store";

export function HomeView() {
  const goTo = useAppStore((state) => state.goTo);
  const [howToOpen, setHowToOpen] = useState(false);
  const howToButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <AppHeader />
      <main id="main" className="flex flex-1 flex-col items-center px-4 pb-10 text-center sm:px-6">
        <h1 className="mt-4 max-w-xl text-3xl font-extrabold text-indigo sm:text-4xl">
          Ruleta de Situaciones
        </h1>
        <p className="mt-3 max-w-lg text-base text-ink sm:text-lg">
          Preguntas para conversar, reflexionar y aprender
        </p>
        <div className="mt-8 w-full">
          <WheelPreview />
        </div>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => goTo("prepare")}>
            Preparar actividad
          </Button>
          <Button
            ref={howToButtonRef}
            variant="secondary"
            className="w-full"
            onClick={() => setHowToOpen(true)}
          >
            <CircleHelp className="size-5" aria-hidden="true" />
            Cómo jugar
          </Button>
        </div>
      </main>
      <HowToPlayModal
        open={howToOpen}
        onOpenChange={setHowToOpen}
        onCloseAutoFocus={() => howToButtonRef.current?.focus()}
      />
    </div>
  );
}
