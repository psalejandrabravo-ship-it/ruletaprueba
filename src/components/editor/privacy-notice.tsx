import { Info } from "lucide-react";

export function PrivacyNotice() {
  return (
    <aside
      className="flex items-start gap-3 rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-card"
      aria-label="Aviso de privacidad"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-indigo" aria-hidden="true" />
      <p>
        No ingreses nombres, diagnósticos ni otros datos personales o sensibles.
        Utiliza preguntas y situaciones anónimas y generales.
      </p>
    </aside>
  );
}
