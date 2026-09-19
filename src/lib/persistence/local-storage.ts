import {
  cloneCategories,
  createDefaultConfig,
  DEFAULT_CATEGORIES,
} from "@/data/default-content";
import { LIMITS } from "@/data/limits";
import { createId } from "@/lib/game/ids";
import { isValidHexColor, normalizeHex } from "@/lib/game/colors";
import type {
  ActivityConfig,
  Category,
  ContentMode,
  PersistedV1,
  Question,
  StorageNotice,
} from "@/types/activity";
import { STORAGE_SCHEMA_VERSION } from "@/types/activity";

export const STORAGE_KEY = "mirarim-ruleta-config";

export interface LoadResult {
  config: ActivityConfig;
  notice: StorageNotice;
}

export interface SaveResult {
  ok: boolean;
  reason?: "unavailable";
}

export interface ConfigRepository {
  load(): LoadResult;
  save(config: ActivityConfig): SaveResult;
  clear(): SaveResult;
}

const presetIds = new Set(DEFAULT_CATEGORIES.map((category) => category.id));

let memoryFallback: string | null = null;
let storageUnavailable = false;

function canUseLocalStorage(): boolean {
  if (storageUnavailable) return false;
  if (typeof window === "undefined") return false;
  try {
    const probe = "__mirarim_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    storageUnavailable = true;
    return false;
  }
}

function readRaw(): string | null {
  if (canUseLocalStorage()) {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      storageUnavailable = true;
      return memoryFallback;
    }
  }
  return memoryFallback;
}

function writeRaw(value: string): SaveResult {
  memoryFallback = value;
  if (!canUseLocalStorage()) {
    return { ok: false, reason: "unavailable" };
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    return { ok: true };
  } catch {
    storageUnavailable = true;
    return { ok: false, reason: "unavailable" };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function repairQuestion(value: unknown, index: number): Question | null {
  if (!isRecord(value)) return null;
  const text = typeof value.text === "string" ? value.text.trim() : "";
  if (!text) return null;
  const clipped = text.slice(0, LIMITS.questionMax);
  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : createId(`pregunta-${index}`);
  return { id, text: clipped };
}

function repairCategory(value: unknown, index: number): Category | null {
  if (!isRecord(value)) return null;
  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : createId("categoria");
  const isKnownPreset = presetIds.has(id);
  const fallback = DEFAULT_CATEGORIES.find((category) => category.id === id);
  const rawName = typeof value.name === "string" ? value.name.trim() : "";
  const name = (rawName || fallback?.name || "").slice(0, LIMITS.categoryNameMax);
  if (!name) return null;

  const rawQuestions = Array.isArray(value.questions) ? value.questions : [];
  const questions = rawQuestions
    .map((question, questionIndex) => repairQuestion(question, questionIndex))
    .filter((question): question is Question => question !== null)
    .slice(0, LIMITS.maxQuestionsPerCategory);

  const color =
    typeof value.color === "string" && isValidHexColor(value.color)
      ? normalizeHex(value.color)
      : (fallback?.color ?? "#2B2155");

  return {
    id,
    name,
    color,
    questions,
    isPreset: isKnownPreset,
    enabled: typeof value.enabled === "boolean" ? value.enabled : true,
  };
}

function repairIncludedEnabled(value: unknown): Record<string, boolean> {
  const enabled: Record<string, boolean> = {};
  for (const category of DEFAULT_CATEGORIES) {
    enabled[category.id] = true;
  }
  if (!isRecord(value)) return enabled;
  for (const category of DEFAULT_CATEGORIES) {
    const raw = value[category.id];
    if (typeof raw === "boolean") enabled[category.id] = raw;
  }
  return enabled;
}

function repairConfig(raw: unknown): { config: ActivityConfig; repaired: boolean } {
  if (!isRecord(raw)) {
    return { config: createDefaultConfig(), repaired: true };
  }

  const version = raw.version;
  if (version !== STORAGE_SCHEMA_VERSION && version !== undefined) {
    return { config: createDefaultConfig(), repaired: true };
  }

  const mode: ContentMode = raw.mode === "custom" ? "custom" : "included";
  const includedEnabled = repairIncludedEnabled(raw.includedEnabled);
  let repaired = raw.mode !== mode || version !== STORAGE_SCHEMA_VERSION;

  let customCategories: Category[] | null = null;
  if (raw.customCategories !== null && raw.customCategories !== undefined) {
    if (!Array.isArray(raw.customCategories)) {
      repaired = true;
    } else {
      const repairedList = raw.customCategories
        .map((category, index) => repairCategory(category, index))
        .filter((category): category is Category => category !== null)
        .slice(0, LIMITS.maxCategories);

      if (repairedList.length === 0) {
        customCategories = cloneCategories(DEFAULT_CATEGORIES);
        repaired = true;
      } else {
        if (repairedList.length !== raw.customCategories.length) repaired = true;
        customCategories = repairedList;
      }
    }
  }

  if (mode === "custom" && !customCategories) {
    customCategories = cloneCategories(DEFAULT_CATEGORIES).map((category) => ({
      ...category,
      enabled: includedEnabled[category.id] ?? true,
    }));
    repaired = true;
  }

  return {
    config: { mode, includedEnabled, customCategories },
    repaired,
  };
}

export function parseStoredConfig(raw: string | null): LoadResult {
  if (!raw) {
    return { config: createDefaultConfig(), notice: "none" };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    const { config, repaired } = repairConfig(parsed);
    return { config, notice: repaired ? "repaired" : "none" };
  } catch {
    return { config: createDefaultConfig(), notice: "repaired" };
  }
}

export function toPersisted(config: ActivityConfig): PersistedV1 {
  return {
    version: STORAGE_SCHEMA_VERSION,
    mode: config.mode,
    includedEnabled: config.includedEnabled,
    customCategories: config.customCategories
      ? cloneCategories(config.customCategories)
      : null,
  };
}

export const localStorageRepository: ConfigRepository = {
  load() {
    if (typeof window === "undefined") {
      return { config: createDefaultConfig(), notice: "none" };
    }
    if (!canUseLocalStorage() && !memoryFallback) {
      return { config: createDefaultConfig(), notice: "unavailable" };
    }
    const raw = readRaw();
    const loaded = parseStoredConfig(raw);
    if (!canUseLocalStorage()) {
      return { config: loaded.config, notice: "unavailable" };
    }
    return loaded;
  },
  save(config) {
    const payload = JSON.stringify(toPersisted(config));
    const result = writeRaw(payload);
    return result;
  },
  clear() {
    memoryFallback = null;
    if (!canUseLocalStorage()) {
      return { ok: false, reason: "unavailable" };
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return { ok: true };
    } catch {
      storageUnavailable = true;
      return { ok: false, reason: "unavailable" };
    }
  },
};

export function resetStorageAvailabilityForTests() {
  storageUnavailable = false;
  memoryFallback = null;
}
