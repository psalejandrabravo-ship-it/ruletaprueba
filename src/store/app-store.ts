import { create } from "zustand";
import { LIMITS } from "@/data/limits";
import {
  cloneCategories,
  createDefaultConfig,
  DEFAULT_CATEGORIES,
  resolvePlayableCategories,
} from "@/data/default-content";
import { nextUnusedColor } from "@/data/category-colors";
import { createId } from "@/lib/game/ids";
import { normalizeHex } from "@/lib/game/colors";
import { initialRotation, computeNextRotation } from "@/lib/game/wheel-rotation";
import {
  getAvailableCategories,
  isRoundComplete,
  remainingCount,
  selectCategoryAndQuestion,
  selectQuestionFromCategory,
  totalQuestionCount,
} from "@/lib/game/selection";
import { validateCategoryName, validateForPlay, validateQuestionText } from "@/lib/game/validation";
import { localStorageRepository } from "@/lib/persistence/local-storage";
import type {
  ActivityConfig,
  Category,
  ContentMode,
  CurrentDraw,
  FieldError,
  RoundState,
  StorageNotice,
  SummaryState,
  ViewName,
} from "@/types/activity";

export type ConfirmKind =
  | "delete-category"
  | "reset-content"
  | "leave-game"
  | "finish-open-question"
  | "discard-edit";

export interface ConfirmRequest {
  kind: ConfirmKind;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  categoryId?: string;
  nextView?: ViewName;
}

interface AppStore {
  view: ViewName;
  hydrated: boolean;
  config: ActivityConfig;
  storageNotice: StorageNotice;
  round: RoundState | null;
  summary: SummaryState | null;
  playErrors: FieldError[];
  spinDurationMs: number;
  instantWheel: boolean;
  confirm: ConfirmRequest | null;
  hydrate: () => void;
  dismissNotice: () => void;
  persistConfig: (config: ActivityConfig) => void;
  goTo: (view: ViewName) => void;
  requestLeaveGame: (nextView: ViewName) => void;
  requestFinish: () => void;
  confirmAction: () => void;
  cancelConfirm: () => void;
  setMode: (mode: ContentMode) => void;
  toggleCategory: (categoryId: string, enabled: boolean) => void;
  renameCategory: (categoryId: string, name: string) => string | null;
  recolorCategory: (categoryId: string, color: string) => void;
  addCategory: (name: string, color: string) => { ok: true; id: string } | { ok: false; error: string };
  deleteCategory: (categoryId: string) => void;
  requestDeleteCategory: (categoryId: string) => void;
  addQuestion: (categoryId: string, text: string) => string | null;
  updateQuestion: (categoryId: string, questionId: string, text: string) => string | null;
  deleteQuestion: (categoryId: string, questionId: string) => void;
  requestReset: () => void;
  resetContent: () => void;
  startGame: () => boolean;
  spin: () => void;
  onSpinEnd: () => void;
  completeQuestion: () => void;
  anotherFromCategory: () => void;
  returnToWheel: () => void;
  playAnotherRound: () => void;
  modifyActivity: () => void;
}

function emptyStats(): RoundState["stats"] {
  return { total: 0, byCategoryId: {} };
}

function createRound(categories: Category[]): RoundState {
  return {
    categories,
    usedQuestionIds: [],
    stats: emptyStats(),
    pendingDraw: null,
    currentDraw: null,
    spinning: false,
    wheelRotation: initialRotation(categories.length),
    roundComplete: false,
    categoryExhaustedName: null,
    announcement: "Ruleta lista para girar.",
  };
}

function editorCategories(config: ActivityConfig): Category[] {
  if (config.mode === "custom" && config.customCategories) {
    return config.customCategories;
  }
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    enabled: config.includedEnabled[category.id] ?? true,
    questions: category.questions.map((question) => ({ ...question })),
  }));
}

function ensureCustom(config: ActivityConfig): Category[] {
  if (config.customCategories) return cloneCategories(config.customCategories);
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    enabled: config.includedEnabled[category.id] ?? true,
    questions: category.questions.map((question) => ({ ...question })),
  }));
}

function updateCustom(
  config: ActivityConfig,
  updater: (categories: Category[]) => Category[],
): ActivityConfig {
  const next = updater(ensureCustom(config));
  return { ...config, mode: "custom", customCategories: next };
}

function findCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

function findQuestion(categories: Category[], draw: CurrentDraw) {
  const category = findCategory(categories, draw.categoryId);
  const question = category?.questions.find((item) => item.id === draw.questionId);
  return { category, question };
}

function markUsed(round: RoundState, draw: CurrentDraw): RoundState {
  if (round.usedQuestionIds.includes(draw.questionId)) return round;
  const byCategoryId = { ...round.stats.byCategoryId };
  byCategoryId[draw.categoryId] = (byCategoryId[draw.categoryId] ?? 0) + 1;
  const usedQuestionIds = [...round.usedQuestionIds, draw.questionId];
  const used = new Set(usedQuestionIds);
  return {
    ...round,
    usedQuestionIds,
    stats: {
      total: round.stats.total + 1,
      byCategoryId,
    },
    roundComplete: isRoundComplete(round.categories, used),
  };
}

function buildSummary(round: RoundState): SummaryState {
  const categories = round.categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      count: round.stats.byCategoryId[category.id] ?? 0,
    }))
    .filter((item) => item.count > 0);
  return { total: round.stats.total, categories };
}

function spinDuration(reduced: boolean): number {
  return reduced ? 450 : 3600;
}

function extraSpins(reduced: boolean): number {
  return reduced ? 0 : 5;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function persist(config: ActivityConfig): StorageNotice | null {
  const result = localStorageRepository.save(config);
  if (!result.ok && result.reason === "unavailable") return "unavailable";
  return null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  view: "home",
  hydrated: false,
  config: createDefaultConfig(),
  storageNotice: "none",
  round: null,
  summary: null,
  playErrors: [],
  spinDurationMs: 3600,
  instantWheel: false,
  confirm: null,

  hydrate() {
    if (get().hydrated) return;
    const loaded = localStorageRepository.load();
    if (loaded.notice === "repaired" && loaded.config) {
      persist(loaded.config);
    }
    set({
      config: loaded.config,
      storageNotice: loaded.notice,
      hydrated: true,
    });
  },

  dismissNotice() {
    set({ storageNotice: "none" });
  },

  persistConfig(config) {
    const notice = persist(config);
    set({
      config,
      storageNotice: notice ?? get().storageNotice,
    });
  },

  goTo(view) {
    set({ view, playErrors: [], confirm: null });
  },

  requestLeaveGame(nextView) {
    const { round } = get();
    if (!round) {
      set({ view: nextView, confirm: null });
      return;
    }
    const hasProgress =
      round.stats.total > 0 ||
      round.currentDraw !== null ||
      round.pendingDraw !== null ||
      round.spinning;
    if (!hasProgress) {
      set({ view: nextView, round: nextView === "prepare" ? null : round, confirm: null });
      return;
    }
    const open = Boolean(round?.currentDraw);
    set({
      confirm: {
        kind: "leave-game",
        nextView,
        title: nextView === "prepare" ? "¿Volver a la configuración?" : "¿Salir de la actividad?",
        description: open
          ? "La pregunta actual no se marcará como completada y se perderá el progreso de esta ronda. Las preguntas realizadas no quedan guardadas."
          : "Se perderá el progreso de esta ronda. Las preguntas realizadas no quedan guardadas.",
        confirmLabel: nextView === "prepare" ? "Volver a configuración" : "Salir",
        danger: true,
      },
    });
  },

  requestFinish() {
    const { round } = get();
    if (!round) return;
    if (round.currentDraw) {
      set({
        confirm: {
          kind: "finish-open-question",
          title: "¿Finalizar la actividad?",
          description:
            "La pregunta que está en pantalla no se marcará como completada. El resumen incluirá solo las preguntas ya realizadas.",
          confirmLabel: "Finalizar",
        },
      });
      return;
    }
    set({
      view: "summary",
      summary: buildSummary(round),
      confirm: null,
    });
  },

  confirmAction() {
    const { confirm, round, config } = get();
    if (!confirm) return;
    if (confirm.kind === "delete-category" && confirm.categoryId) {
      const next = updateCustom(config, (categories) =>
        categories.filter((category) => category.id !== confirm.categoryId),
      );
      const notice = persist(next);
      set({
        config: next,
        confirm: null,
        storageNotice: notice ?? get().storageNotice,
      });
      return;
    }
    if (confirm.kind === "reset-content") {
      const next = createDefaultConfig();
      localStorageRepository.clear();
      const notice = persist(next);
      set({
        config: next,
        confirm: null,
        playErrors: [],
        storageNotice: notice ?? "none",
      });
      return;
    }
    if (confirm.kind === "leave-game" && confirm.nextView) {
      set({
        view: confirm.nextView,
        round: null,
        confirm: null,
        playErrors: [],
      });
      return;
    }
    if (confirm.kind === "finish-open-question" && round) {
      set({
        view: "summary",
        summary: buildSummary(round),
        confirm: null,
      });
    }
  },

  cancelConfirm() {
    set({ confirm: null });
  },

  setMode(mode) {
    const { config } = get();
    if (config.mode === mode) return;
    let next: ActivityConfig = { ...config, mode };
    if (mode === "custom" && !config.customCategories) {
      next = {
        ...config,
        mode,
        customCategories: ensureCustom(config),
      };
    }
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
  },

  toggleCategory(categoryId, enabled) {
    const { config } = get();
    if (config.mode === "included") {
      const next: ActivityConfig = {
        ...config,
        includedEnabled: { ...config.includedEnabled, [categoryId]: enabled },
      };
      const notice = persist(next);
      set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
      return;
    }
    const next = updateCustom(config, (categories) =>
      categories.map((category) =>
        category.id === categoryId ? { ...category, enabled } : category,
      ),
    );
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
  },

  renameCategory(categoryId, name) {
    const error = validateCategoryName(name);
    if (error) return error;
    const { config } = get();
    const next = updateCustom(config, (categories) =>
      categories.map((category) =>
        category.id === categoryId ? { ...category, name: name.trim() } : category,
      ),
    );
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
    return null;
  },

  recolorCategory(categoryId, color) {
    const { config } = get();
    const next = updateCustom(config, (categories) =>
      categories.map((category) =>
        category.id === categoryId ? { ...category, color: normalizeHex(color) } : category,
      ),
    );
    const notice = persist(next);
    set({ config: next, storageNotice: notice ?? get().storageNotice });
  },

  addCategory(name, color) {
    const error = validateCategoryName(name);
    if (error) return { ok: false, error };
    const { config } = get();
    const current = ensureCustom(config);
    if (current.length >= LIMITS.maxCategories) {
      return { ok: false, error: `Puedes crear hasta ${LIMITS.maxCategories} categorías.` };
    }
    const category: Category = {
      id: createId("categoria"),
      name: name.trim(),
      color: normalizeHex(color),
      questions: [],
      isPreset: false,
      enabled: true,
    };
    const next = updateCustom(config, (categories) => [...categories, category]);
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
    return { ok: true, id: category.id };
  },

  deleteCategory(categoryId) {
    get().requestDeleteCategory(categoryId);
  },

  requestDeleteCategory(categoryId) {
    const { config } = get();
    const categories = editorCategories(config);
    const category = findCategory(categories, categoryId);
    if (!category || category.isPreset) return;
    set({
      confirm: {
        kind: "delete-category",
        categoryId,
        title: "¿Eliminar esta categoría?",
        description: `Se eliminará la categoría personalizada «${category.name}» y sus preguntas. Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar categoría",
        danger: true,
      },
    });
  },

  addQuestion(categoryId, text) {
    const error = validateQuestionText(text);
    if (error) return error;
    const { config } = get();
    const current = findCategory(ensureCustom(config), categoryId);
    if (!current) return "No se encontró la categoría.";
    if (current.questions.length >= LIMITS.maxQuestionsPerCategory) {
      return `Hasta ${LIMITS.maxQuestionsPerCategory} preguntas por categoría.`;
    }
    const next = updateCustom(config, (categories) =>
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              questions: [
                ...category.questions,
                { id: createId("pregunta"), text: text.trim() },
              ],
            }
          : category,
      ),
    );
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
    return null;
  },

  updateQuestion(categoryId, questionId, text) {
    const error = validateQuestionText(text);
    if (error) return error;
    const { config } = get();
    const next = updateCustom(config, (categories) =>
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              questions: category.questions.map((question) =>
                question.id === questionId ? { ...question, text: text.trim() } : question,
              ),
            }
          : category,
      ),
    );
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
    return null;
  },

  deleteQuestion(categoryId, questionId) {
    const { config } = get();
    const next = updateCustom(config, (categories) =>
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              questions: category.questions.filter((question) => question.id !== questionId),
            }
          : category,
      ),
    );
    const notice = persist(next);
    set({ config: next, playErrors: [], storageNotice: notice ?? get().storageNotice });
  },

  requestReset() {
    set({
      confirm: {
        kind: "reset-content",
        title: "¿Restablecer el contenido?",
        description:
          "Se eliminarán las personalizaciones guardadas en este navegador y se recuperarán las categorías y preguntas originales, con todas las categorías activas. No se envía información a ningún servicio externo.",
        confirmLabel: "Restablecer contenido",
        danger: true,
      },
    });
  },

  resetContent() {
    get().requestReset();
  },

  startGame() {
    const { config } = get();
    const editor = editorCategories(config);
    const errors = validateForPlay(editor);
    if (errors.length > 0) {
      set({ playErrors: errors });
      return false;
    }
    const playable = resolvePlayableCategories(config);
    set({
      view: "game",
      round: createRound(playable),
      summary: null,
      playErrors: [],
      instantWheel: true,
      spinDurationMs: spinDuration(prefersReducedMotion()),
    });
    return true;
  },

  spin() {
    const { round } = get();
    if (!round || round.spinning || round.currentDraw || round.roundComplete) return;
    const used = new Set(round.usedQuestionIds);
    const selected = selectCategoryAndQuestion(round.categories, used);
    if (!selected) {
      set({
        round: {
          ...round,
          roundComplete: true,
          announcement: "¡Ronda completada! Ya utilizaste todas las preguntas disponibles.",
        },
      });
      return;
    }
    const index = round.categories.findIndex((category) => category.id === selected.category.id);
    const reduced = prefersReducedMotion();
    const nextRotation = computeNextRotation(
      round.wheelRotation,
      index,
      round.categories.length,
      extraSpins(reduced),
    );
    set({
      instantWheel: false,
      spinDurationMs: spinDuration(reduced),
      round: {
        ...round,
        spinning: true,
        pendingDraw: {
          categoryId: selected.category.id,
          questionId: selected.question.id,
        },
        currentDraw: null,
        categoryExhaustedName: null,
        wheelRotation: nextRotation,
        announcement: "Girando la ruleta.",
      },
    });
  },

  onSpinEnd() {
    const { round } = get();
    if (!round || !round.spinning) return;
    const draw = round.pendingDraw;
    const found = draw ? findQuestion(round.categories, draw) : { category: undefined, question: undefined };
    const categoryName = found.category?.name ?? "la categoría seleccionada";
    set({
      round: {
        ...round,
        spinning: false,
        pendingDraw: null,
        currentDraw: draw,
        announcement: `La ruleta se detuvo en ${categoryName}.`,
      },
    });
  },

  completeQuestion() {
    const { round } = get();
    if (!round?.currentDraw) return;
    const next = markUsed(round, round.currentDraw);
    const used = new Set(next.usedQuestionIds);
    const complete = isRoundComplete(next.categories, used);
    set({
      round: {
        ...next,
        currentDraw: null,
        pendingDraw: null,
        roundComplete: complete,
        announcement: complete
          ? "¡Ronda completada! Ya utilizaste todas las preguntas disponibles."
          : "Pregunta completada. Puedes volver a girar.",
      },
    });
  },

  anotherFromCategory() {
    const { round } = get();
    if (!round?.currentDraw) return;
    const current = round.currentDraw;
    let next = markUsed(round, current);
    const used = new Set(next.usedQuestionIds);
    const category = findCategory(next.categories, current.categoryId);
    if (!category) {
      set({ round: { ...next, currentDraw: null } });
      return;
    }
    const following = selectQuestionFromCategory(category, used);
    if (following) {
      set({
        round: {
          ...next,
          currentDraw: { categoryId: category.id, questionId: following.id },
          announcement: `Otra pregunta de ${category.name}.`,
        },
      });
      return;
    }
    const complete = isRoundComplete(next.categories, used);
    set({
      round: {
        ...next,
        currentDraw: null,
        roundComplete: complete,
        categoryExhaustedName: complete ? null : category.name,
        announcement: complete
          ? "¡Ronda completada! Ya utilizaste todas las preguntas disponibles."
          : `Se completaron las preguntas de ${category.name}.`,
      },
    });
  },

  returnToWheel() {
    const { round } = get();
    if (!round) return;
    set({
      round: {
        ...round,
        currentDraw: null,
        pendingDraw: null,
        categoryExhaustedName: null,
        announcement: "Pregunta disponible para más adelante. Puedes volver a girar.",
      },
    });
  },

  playAnotherRound() {
    const playable = resolvePlayableCategories(get().config);
    set({
      view: "game",
      round: createRound(playable),
      summary: null,
      instantWheel: true,
      spinDurationMs: spinDuration(prefersReducedMotion()),
    });
  },

  modifyActivity() {
    set({ view: "prepare", round: null, playErrors: [] });
  },
}));

export function suggestedNewCategoryColor(config: ActivityConfig): string {
  const categories =
    config.mode === "custom" && config.customCategories
      ? config.customCategories
      : DEFAULT_CATEGORIES;
  return nextUnusedColor(categories.map((category) => category.color));
}

export function getEditorCategories(config: ActivityConfig): Category[] {
  return editorCategories(config);
}

export function getRoundProgress(round: RoundState | null): {
  done: number;
  total: number;
  remaining: number;
} {
  if (!round) return { done: 0, total: 0, remaining: 0 };
  const total = totalQuestionCount(round.categories);
  const remaining = remainingCount(round.categories, new Set(round.usedQuestionIds));
  return { done: round.stats.total, total, remaining };
}

export function availableCategoryCount(round: RoundState | null): number {
  if (!round) return 0;
  return getAvailableCategories(round.categories, new Set(round.usedQuestionIds)).length;
}
