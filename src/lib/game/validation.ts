import { LIMITS } from "@/data/limits";
import type { Category, FieldError } from "@/types/activity";

export function trimValue(value: string): string {
  return value.trim();
}

export function validateCategoryName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Escribe un nombre para la categoría.";
  if (trimmed.length > LIMITS.categoryNameMax) {
    return `El nombre no puede superar ${LIMITS.categoryNameMax} caracteres.`;
  }
  return null;
}

export function validateQuestionText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "Escribe una pregunta o situación.";
  if (trimmed.length > LIMITS.questionMax) {
    return `La pregunta no puede superar ${LIMITS.questionMax} caracteres.`;
  }
  return null;
}

export function validateForPlay(categories: Category[]): FieldError[] {
  const errors: FieldError[] = [];
  const enabled = categories.filter((category) => category.enabled);

  for (const category of enabled) {
    const nameError = validateCategoryName(category.name);
    if (nameError) {
      errors.push({ field: `category-name-${category.id}`, message: nameError });
    }
    const validQuestions = category.questions.filter((question) => question.text.trim());
    if (validQuestions.length === 0) {
      errors.push({
        field: `category-${category.id}`,
        message: `«${category.name.trim() || "Esta categoría"}» necesita al menos una pregunta para participar.`,
      });
    }
  }

  const playable = enabled.filter(
    (category) =>
      category.name.trim().length > 0 &&
      category.questions.some((question) => question.text.trim().length > 0),
  );

  if (playable.length < LIMITS.minActiveCategories) {
    errors.unshift({
      field: "global",
      message: "Activa al menos dos categorías, cada una con una pregunta, para iniciar la actividad.",
    });
  }

  return errors;
}

export function canAddCategory(count: number): boolean {
  return count < LIMITS.maxCategories;
}

export function canAddQuestion(count: number): boolean {
  return count < LIMITS.maxQuestionsPerCategory;
}
