export const LIMITS = {
  categoryNameMin: 1,
  categoryNameMax: 40,
  questionMin: 1,
  questionMax: 280,
  maxCategories: 12,
  maxQuestionsPerCategory: 20,
  minActiveCategories: 2,
} as const;

export const LIMIT_COPY = {
  categoryName: `Entre ${LIMITS.categoryNameMin} y ${LIMITS.categoryNameMax} caracteres.`,
  question: `Entre ${LIMITS.questionMin} y ${LIMITS.questionMax} caracteres.`,
  maxCategories: `Puedes crear hasta ${LIMITS.maxCategories} categorías.`,
  maxQuestions: `Hasta ${LIMITS.maxQuestionsPerCategory} preguntas por categoría.`,
} as const;
