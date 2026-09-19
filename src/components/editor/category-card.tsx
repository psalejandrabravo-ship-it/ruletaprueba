import { useEffect, useId, useState } from "react";
import { Check, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { LIMIT_COPY, LIMITS } from "@/data/limits";
import { findColorName } from "@/data/category-colors";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/editor/color-picker";
import { contrastText } from "@/lib/game/colors";
import { cn } from "@/lib/utils";
import { canAddQuestion } from "@/lib/game/validation";
import type { Category, FieldError } from "@/types/activity";

interface CategoryCardProps {
  category: Category;
  editable: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onRename: (name: string) => string | null;
  onRecolor: (color: string) => void;
  onAddQuestion: (text: string) => string | null;
  onUpdateQuestion: (questionId: string, text: string) => string | null;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteCategory: () => void;
  errors: FieldError[];
}

export function CategoryCard({
  category,
  editable,
  expanded,
  onToggleExpand,
  onToggleEnabled,
  onRename,
  onRecolor,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteCategory,
  errors,
}: CategoryCardProps) {
  const nameId = `category-name-${category.id}`;
  const cardId = `category-${category.id}`;
  const colorLabelId = useId();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionError, setNewQuestionError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState("");
  const [questionError, setQuestionError] = useState<string | null>(null);

  useEffect(() => {
    setNameDraft(category.name);
  }, [category.name]);

  const fieldError = errors.find(
    (error) => error.field === cardId || error.field === nameId,
  );
  const nameFieldError = errors.find((error) => error.field === nameId)?.message ?? nameError;

  function saveName() {
    const result = onRename(nameDraft);
    if (result) {
      setNameError(result);
      return;
    }
    setNameError(null);
    setEditingName(false);
  }

  function saveNewQuestion() {
    const result = onAddQuestion(newQuestion);
    if (result) {
      setNewQuestionError(result);
      return;
    }
    setNewQuestion("");
    setNewQuestionError(null);
  }

  function saveQuestion(questionId: string) {
    const result = onUpdateQuestion(questionId, questionDraft);
    if (result) {
      setQuestionError(result);
      return;
    }
    setQuestionError(null);
    setEditingQuestionId(null);
  }

  return (
    <article
      id={cardId}
      className={cn(
        "rounded-2xl bg-surface p-4 shadow-card",
        fieldError && "ring-2 ring-danger",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 size-4 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          {editingName && editable ? (
            <div>
              <label htmlFor={nameId} className="sr-only">
                Nombre de la categoría
              </label>
              <input
                id={nameId}
                value={nameDraft}
                maxLength={LIMITS.categoryNameMax}
                onChange={(event) => setNameDraft(event.target.value)}
                aria-invalid={Boolean(nameFieldError)}
                aria-describedby={`${nameId}-help ${nameFieldError ? `${nameId}-error` : ""}`}
                className="w-full rounded-lg bg-cream px-3 py-2 font-extrabold text-indigo"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveName();
                  }
                  if (event.key === "Escape") {
                    setNameDraft(category.name);
                    setEditingName(false);
                    setNameError(null);
                  }
                }}
              />
              <p id={`${nameId}-help`} className="mt-1 text-xs text-ink-muted">
                {LIMIT_COPY.categoryName}
              </p>
              {nameFieldError ? (
                <p id={`${nameId}-error`} className="mt-1 text-sm text-danger" role="alert">
                  {nameFieldError}
                </p>
              ) : null}
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={saveName}>
                  Guardar nombre
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNameDraft(category.name);
                    setEditingName(false);
                    setNameError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-extrabold text-indigo">
              <span id={nameId}>{category.name}</span>
            </h3>
          )}
          <p className="mt-1 text-sm text-ink-muted">
            {category.questions.length}{" "}
            {category.questions.length === 1 ? "pregunta" : "preguntas"}
            {" · "}
            {findColorName(category.color)}
            {category.isPreset ? " · Incluida" : " · Personalizada"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <label className="flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              className="size-4 accent-coral"
              checked={category.enabled}
              onChange={(event) => onToggleEnabled(event.target.checked)}
            />
            <span>{category.enabled ? "Activa" : "Inactiva"}</span>
          </label>
        </div>
      </div>

      {fieldError && !nameFieldError ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {fieldError.message}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-controls={`${cardId}-content`}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
          {expanded ? "Ocultar preguntas" : "Ver preguntas"}
        </Button>
        {editable ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingName(true)}
              aria-label={`Editar nombre de ${category.name}`}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Nombre
            </Button>
            {!category.isPreset ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteCategory}
                aria-label={`Eliminar categoría ${category.name}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Eliminar
              </Button>
            ) : null}
          </>
        ) : null}
      </div>

      {expanded ? (
        <div id={`${cardId}-content`} className="mt-4 border-t border-border pt-4">
          {editable ? (
            <div className="mb-4">
              <p id={colorLabelId} className="mb-2 text-sm font-semibold text-indigo">
                Color de la categoría
              </p>
              <ColorPicker value={category.color} onChange={onRecolor} labelledBy={colorLabelId} />
            </div>
          ) : null}

          <ul className="space-y-2">
            {category.questions.length === 0 ? (
              <li className="text-sm text-ink-muted">Esta categoría aún no tiene preguntas.</li>
            ) : (
              category.questions.map((question) => (
                <li key={question.id} className="rounded-xl bg-cream px-3 py-3">
                  {editingQuestionId === question.id ? (
                    <div>
                      <label htmlFor={`question-${question.id}`} className="sr-only">
                        Editar pregunta
                      </label>
                      <textarea
                        id={`question-${question.id}`}
                        value={questionDraft}
                        maxLength={LIMITS.questionMax}
                        onChange={(event) => setQuestionDraft(event.target.value)}
                        aria-invalid={Boolean(questionError)}
                        aria-describedby={`question-${question.id}-help`}
                        className="min-h-24 w-full rounded-lg bg-surface px-3 py-2 text-ink"
                      />
                      <p id={`question-${question.id}-help`} className="mt-1 text-xs text-ink-muted">
                        {LIMIT_COPY.question} {questionDraft.length}/{LIMITS.questionMax}
                      </p>
                      {questionError ? (
                        <p className="mt-1 text-sm text-danger" role="alert">
                          {questionError}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => saveQuestion(question.id)}>
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingQuestionId(null);
                            setQuestionError(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm leading-snug text-ink">{question.text}</p>
                      {editable ? (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            aria-label="Editar pregunta"
                            onClick={() => {
                              setEditingQuestionId(question.id);
                              setQuestionDraft(question.text);
                              setQuestionError(null);
                            }}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            aria-label="Eliminar pregunta"
                            onClick={() => onDeleteQuestion(question.id)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>

          {editable && canAddQuestion(category.questions.length) ? (
            <form
              className="mt-4"
              onSubmit={(event) => {
                event.preventDefault();
                saveNewQuestion();
              }}
            >
              <label htmlFor={`new-question-${category.id}`} className="text-sm font-semibold text-indigo">
                Agregar pregunta
              </label>
              <textarea
                id={`new-question-${category.id}`}
                value={newQuestion}
                maxLength={LIMITS.questionMax}
                onChange={(event) => setNewQuestion(event.target.value)}
                aria-invalid={Boolean(newQuestionError)}
                aria-describedby={`new-question-${category.id}-help`}
                className="mt-2 min-h-20 w-full rounded-lg bg-cream px-3 py-2 text-ink"
                placeholder="Escribe una pregunta o situación anónima"
              />
              <p id={`new-question-${category.id}-help`} className="mt-1 text-xs text-ink-muted">
                {LIMIT_COPY.question} {newQuestion.length}/{LIMITS.questionMax}
              </p>
              {newQuestionError ? (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {newQuestionError}
                </p>
              ) : null}
              <Button type="submit" size="sm" className="mt-2">
                <Plus className="size-4" aria-hidden="true" />
                Agregar
              </Button>
            </form>
          ) : editable ? (
            <p className="mt-3 text-sm text-ink-muted">{LIMIT_COPY.maxQuestions}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold"
      style={{ backgroundColor: color, color: contrastText(color) }}
    >
      <Check className="size-3" aria-hidden="true" />
      {name}
    </span>
  );
}
