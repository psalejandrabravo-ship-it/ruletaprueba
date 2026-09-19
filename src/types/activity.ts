export type ViewName = "home" | "prepare" | "game" | "summary";

export type ContentMode = "included" | "custom";

export type StorageNotice = "none" | "repaired" | "unavailable";

export interface Question {
  id: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  questions: Question[];
  isPreset: boolean;
  enabled: boolean;
}

export interface ActivityConfig {
  mode: ContentMode;
  includedEnabled: Record<string, boolean>;
  customCategories: Category[] | null;
}

export interface CurrentDraw {
  categoryId: string;
  questionId: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface RoundStats {
  total: number;
  byCategoryId: Record<string, number>;
}

export interface RoundState {
  categories: Category[];
  usedQuestionIds: string[];
  stats: RoundStats;
  pendingDraw: CurrentDraw | null;
  currentDraw: CurrentDraw | null;
  spinning: boolean;
  wheelRotation: number;
  roundComplete: boolean;
  categoryExhaustedName: string | null;
  announcement: string;
}

export interface SummaryState {
  total: number;
  categories: CategoryStat[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PersistedV1 {
  version: 1;
  mode: ContentMode;
  includedEnabled: Record<string, boolean>;
  customCategories: Category[] | null;
}

export const STORAGE_SCHEMA_VERSION = 1;
