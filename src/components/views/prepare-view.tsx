import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, RotateCcw } from "lucide-react";
import { LIMIT_COPY, LIMITS } from "@/data/limits";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/editor/category-card";
import { ModeSelector } from "@/components/editor/mode-selector";
import { PrivacyNotice } from "@/components/editor/privacy-notice";
import { ColorPicker } from "@/components/editor/color-picker";
import { canAddCategory } from "@/lib/game/validation";
import {
  getEditorCategories,
  suggestedNewCategoryColor,
  useAppStore,
} from "@/store/app-store";

export function PrepareView() {
  const config = useAppStore((state) => state.config);
  const playErrors = useAppStore((state) => state.playErrors);
  const setMode = useAppStore((state) => state.setMode);
  const toggleCategory = useAppStore((state) => state.toggleCategory);
  const renameCategory = useAppStore((state) => state.renameCategory);
  const recolorCategory = useAppStore((state) => state.recolorCategory);
  const addCategory = useAppStore((state) => state.addCategory);
  const requestDeleteCategory = useAppStore((state) => state.requestDeleteCategory);
  const addQuestion = useAppStore((state) => state.addQuestion);
  const updateQuestion = useAppStore((state) => state.updateQuestion);
  const deleteQuestion = useAppStore((state) => state.deleteQuestion);
  const requestReset = useAppStore((state) => state.requestReset);
  const startGame = useAppStore((state) => state.startGame);
  const goTo = useAppStore((state) => state.goTo);

  const categories = useMemo(() => getEditorCategories(config), [config]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(suggestedNewCategoryColor(config));
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (playErrors.length === 0) return;
    const first = playErrors[0];
    const node = document.getElementById(first.field);
    if (node) {
      if ("focus" in node && typeof node.focus === "function") {
        (node as HTMLElement).focus();
      } else {
        node.scrollIntoView({ block: "center" });
      }
    }
  }, [playErrors]);

  const globalError = playErrors.find((error) => error.field === "global");
  const editable = config.mode === "custom";
  const colorLabelId = "new-category-color-label";

  function toggleExpand(id: string) {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }

  function handleCreate() {
    const result = addCategory(newName, newColor);
    if (!result.ok) {
      setCreateError(result.error);
      document.getElementById("new-category-name")?.focus();
      return;
    }
    setCreateError(null);
    setNewName("");
    setCreating(false);
    setExpanded((current) => ({ ...current, [result.id]: true }));
    setNewColor(suggestedNewCategoryColor(useAppStore.getState().config));
  }

  function handleStart() {
    const ok = startGame();
    if (!ok) {
      const first = useAppStore.getState().playErrors[0];
      const node = first ? document.getElementById(first.field) : null;
      node?.scrollIntoView({ block: "center" });
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <AppHeader
        trailing={
          <Button variant="ghost" onClick={() => goTo("home")} aria-label="Volver al inicio">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Inicio
          </Button>
        }
      />
      <main id="main" className="flex-1 px-4 pb-32 sm:px-6">
        <h1 className="text-2xl font-extrabold text-indigo sm:text-3xl">Preparar actividad</h1>
        <p className="mt-2 text-ink-muted">
          Elige las categorías que girarán en la ruleta. El contenido se guarda solo en este
          navegador.
        </p>

        <div className="mt-6">
          <ModeSelector mode={config.mode} onChange={setMode} />
        </div>

        <div className="mt-6">
          <PrivacyNotice />
        </div>

        {globalError ? (
          <p id="global" tabIndex={-1} className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger" role="alert">
            {globalError.message}
          </p>
        ) : null}

        <section className="mt-6 space-y-3" aria-label="Categorías">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              editable={editable}
              expanded={Boolean(expanded[category.id])}
              errors={playErrors}
              onToggleExpand={() => toggleExpand(category.id)}
              onToggleEnabled={(enabled) => toggleCategory(category.id, enabled)}
              onRename={(name) => renameCategory(category.id, name)}
              onRecolor={(color) => recolorCategory(category.id, color)}
              onAddQuestion={(text) => addQuestion(category.id, text)}
              onUpdateQuestion={(questionId, text) =>
                updateQuestion(category.id, questionId, text)
              }
              onDeleteQuestion={(questionId) => deleteQuestion(category.id, questionId)}
              onDeleteCategory={() => requestDeleteCategory(category.id)}
            />
          ))}
        </section>

        {editable ? (
          <section className="mt-6 rounded-2xl bg-surface p-4 shadow-card">
            {creating ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleCreate();
                }}
              >
                <h2 className="text-lg font-extrabold text-indigo">Nueva categoría</h2>
                <label htmlFor="new-category-name" className="mt-3 block text-sm font-semibold">
                  Nombre
                </label>
                <input
                  id="new-category-name"
                  value={newName}
                  maxLength={LIMITS.categoryNameMax}
                  onChange={(event) => setNewName(event.target.value)}
                  aria-invalid={Boolean(createError)}
                  aria-describedby="new-category-name-help"
                  className="mt-1 w-full rounded-lg bg-cream px-3 py-2 font-semibold text-ink"
                />
                <p id="new-category-name-help" className="mt-1 text-xs text-ink-muted">
                  {LIMIT_COPY.categoryName}
                </p>
                {createError ? (
                  <p className="mt-1 text-sm text-danger" role="alert">
                    {createError}
                  </p>
                ) : null}
                <p id={colorLabelId} className="mt-4 text-sm font-semibold text-indigo">
                  Color
                </p>
                <div className="mt-2">
                  <ColorPicker value={newColor} onChange={setNewColor} labelledBy={colorLabelId} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="submit">Crear categoría</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCreating(false);
                      setCreateError(null);
                      setNewName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : canAddCategory(categories.length) ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCreating(true);
                  setNewColor(suggestedNewCategoryColor(config));
                }}
              >
                <Plus className="size-4" aria-hidden="true" />
                Crear una categoría personalizada
              </Button>
            ) : (
              <p className="text-sm text-ink-muted">{LIMIT_COPY.maxCategories}</p>
            )}
          </section>
        ) : null}
      </main>

      <div className="sticky bottom-0 z-20 border-t border-border bg-cream/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="sm:flex-1" onClick={requestReset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Restablecer contenido
          </Button>
          <Button size="lg" className="sm:flex-[2]" onClick={handleStart}>
            Iniciar actividad
          </Button>
        </div>
      </div>
    </div>
  );
}
