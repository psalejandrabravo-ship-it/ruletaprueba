import type { ActivityConfig, Category } from "@/types/activity";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "emociones",
    name: "Emociones",
    color: "#E07A5F",
    isPreset: true,
    enabled: true,
    questions: [
      { id: "emociones-1", text: "¿Qué emoción te resulta más fácil reconocer?" },
      { id: "emociones-2", text: "¿Cómo notas que alguien está alegre?" },
      { id: "emociones-3", text: "¿Qué puedes hacer cuando sientes mucha frustración?" },
      { id: "emociones-4", text: "¿En qué parte del cuerpo puedes sentir los nervios?" },
      { id: "emociones-5", text: "Menciona una situación que pueda producir tranquilidad." },
    ],
  },
  {
    id: "convivencia",
    name: "Convivencia",
    color: "#2F7D73",
    isPreset: true,
    enabled: true,
    questions: [
      { id: "convivencia-1", text: "¿Qué ayuda a que un grupo se sienta respetado?" },
      { id: "convivencia-2", text: "¿Qué podrías hacer si dos personas quieren usar lo mismo?" },
      { id: "convivencia-3", text: "¿Cómo podemos incluir a alguien que está solo?" },
      { id: "convivencia-4", text: "¿Qué significa escuchar con atención?" },
      { id: "convivencia-5", text: "Menciona una forma respetuosa de expresar desacuerdo." },
    ],
  },
  {
    id: "resolucion-problemas",
    name: "Resolución de problemas",
    color: "#E6B84C",
    isPreset: true,
    enabled: true,
    questions: [
      {
        id: "resolucion-1",
        text: "¿Qué podrías hacer antes de reaccionar ante un problema?",
      },
      {
        id: "resolucion-2",
        text: "Si una primera solución no funciona, ¿qué podrías intentar?",
      },
      {
        id: "resolucion-3",
        text: "¿A quién podrías pedir ayuda en una situación difícil?",
      },
      {
        id: "resolucion-4",
        text: "¿Por qué es útil pensar en más de una solución?",
      },
      {
        id: "resolucion-5",
        text: "¿Qué información necesitas antes de tomar una decisión?",
      },
    ],
  },
  {
    id: "fortalezas",
    name: "Fortalezas",
    color: "#5C4E86",
    isPreset: true,
    enabled: true,
    questions: [
      { id: "fortalezas-1", text: "Menciona algo que hayas aprendido con esfuerzo." },
      { id: "fortalezas-2", text: "¿Qué cualidad valoras en ti?" },
      {
        id: "fortalezas-3",
        text: "¿Cómo puedes usar una fortaleza para ayudar a otras personas?",
      },
      { id: "fortalezas-4", text: "¿Qué haces bien cuando trabajas en grupo?" },
      {
        id: "fortalezas-5",
        text: "Menciona algo que antes era difícil y ahora haces mejor.",
      },
    ],
  },
];

export function cloneCategories(categories: Category[]): Category[] {
  return categories.map((category) => ({
    ...category,
    questions: category.questions.map((question) => ({ ...question })),
  }));
}

export function defaultIncludedEnabled(): Record<string, boolean> {
  return Object.fromEntries(DEFAULT_CATEGORIES.map((category) => [category.id, true]));
}

export function createDefaultConfig(): ActivityConfig {
  return {
    mode: "included",
    includedEnabled: defaultIncludedEnabled(),
    customCategories: null,
  };
}

export function includedCategoriesFromConfig(
  includedEnabled: Record<string, boolean>,
): Category[] {
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    questions: category.questions.map((question) => ({ ...question })),
    enabled: includedEnabled[category.id] ?? true,
  }));
}

export function resolveEditorCategories(config: ActivityConfig): Category[] {
  if (config.mode === "custom" && config.customCategories) {
    return cloneCategories(config.customCategories);
  }
  return includedCategoriesFromConfig(config.includedEnabled);
}

export function resolvePlayableCategories(config: ActivityConfig): Category[] {
  return resolveEditorCategories(config)
    .filter((category) => category.enabled)
    .map((category) => ({
      ...category,
      name: category.name.trim(),
      questions: category.questions
        .map((question) => ({ ...question, text: question.text.trim() }))
        .filter((question) => question.text.length > 0),
    }))
    .filter((category) => category.name.length > 0 && category.questions.length > 0);
}
