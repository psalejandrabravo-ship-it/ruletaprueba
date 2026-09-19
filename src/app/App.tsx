import { useEffect } from "react";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { StorageNoticeBanner } from "@/components/layout/storage-notice";
import { GameView } from "@/components/views/game-view";
import { HomeView } from "@/components/views/home-view";
import { PrepareView } from "@/components/views/prepare-view";
import { SummaryView } from "@/components/views/summary-view";
import { useAppStore } from "@/store/app-store";

export function App() {
  const view = useAppStore((state) => state.view);
  const notice = useAppStore((state) => state.storageNotice);
  const confirm = useAppStore((state) => state.confirm);
  const hydrate = useAppStore((state) => state.hydrate);
  const dismissNotice = useAppStore((state) => state.dismissNotice);
  const confirmAction = useAppStore((state) => state.confirmAction);
  const cancelConfirm = useAppStore((state) => state.cancelConfirm);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <StorageNoticeBanner notice={notice} onDismiss={dismissNotice} />
      {view === "home" ? <HomeView /> : null}
      {view === "prepare" ? <PrepareView /> : null}
      {view === "game" ? <GameView /> : null}
      {view === "summary" ? <SummaryView /> : null}
      <ConfirmDialog request={confirm} onConfirm={confirmAction} onCancel={cancelConfirm} />
    </div>
  );
}
