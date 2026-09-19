import type { Category, Question } from "@/types/activity";
import { pickRandom } from "@/lib/game/random";

export function unusedQuestions(category: Category, usedIds: Set<string>): Question[] {
  return category.questions.filter(
    (question) => question.text.trim().length > 0 && !usedIds.has(question.id),
  );
}

export function getAvailableCategories(
  categories: Category[],
  usedIds: Set<string>,
): Category[] {
  return categories.filter((category) => unusedQuestions(category, usedIds).length > 0);
}

export function isRoundComplete(categories: Category[], usedIds: Set<string>): boolean {
  return getAvailableCategories(categories, usedIds).length === 0;
}

export function selectCategoryAndQuestion(
  categories: Category[],
  usedIds: Set<string>,
): { category: Category; question: Question } | null {
  const available = getAvailableCategories(categories, usedIds);
  if (available.length === 0) return null;
  const category = pickRandom(available);
  const question = pickRandom(unusedQuestions(category, usedIds));
  return { category, question };
}

export function selectQuestionFromCategory(
  category: Category,
  usedIds: Set<string>,
): Question | null {
  const pool = unusedQuestions(category, usedIds);
  if (pool.length === 0) return null;
  return pickRandom(pool);
}

export function remainingCount(categories: Category[], usedIds: Set<string>): number {
  return categories.reduce(
    (sum, category) => sum + unusedQuestions(category, usedIds).length,
    0,
  );
}

export function totalQuestionCount(categories: Category[]): number {
  return categories.reduce((sum, category) => sum + category.questions.length, 0);
}
