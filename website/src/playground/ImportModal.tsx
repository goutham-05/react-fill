import React, { useState, useMemo, useCallback } from "react";
import { DynamicForm, FormWizard } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";
import type { BuilderAction, FieldConfig } from "./types";
import { useTheme } from "../ThemeContext";

// ─── Smart parser ─────────────────────────────────────────────────────────────

function smartParse(raw: string): { data: any[] | null; error: string | null } {
  const t = raw.trim();
  if (!t) return { data: null, error: null };

  // 1. Direct JSON
  try {
    const p = JSON.parse(t);
    if (Array.isArray(p)) return { data: p, error: null };
    return { data: null, error: "Input is not a JSON array." };
  } catch {}

  // 2. Extract array from TypeScript / JavaScript code
  const code = t
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("import"))
    .join("\n");

  // Find start of an array literal (after '=' or standalone)
  const eqMatch = code.match(/=\s*\n?\s*\[/);
  const startIdx =
    eqMatch?.index !== undefined
      ? code.indexOf("[", eqMatch.index)
      : code.indexOf("[");
  if (startIdx < 0)
    return { data: null, error: "No array found in input." };

  // Find matching ] respecting strings and nested brackets
  let depth = 0, endIdx = -1, inStr = false, strCh = "";
  for (let i = startIdx; i < code.length; i++) {
    const ch = code[i];
    if (inStr) {
      if (ch === "\\") { i++; continue; }
      if (ch === strCh) inStr = false;
    } else if (ch === '"' || ch === "'") {
      inStr = true; strCh = ch;
    } else if (ch === "[") depth++;
    else if (ch === "]" && --depth === 0) { endIdx = i; break; }
  }
  if (endIdx < 0)
    return { data: null, error: "Unclosed bracket in input." };

  let s = code.slice(startIdx, endIdx + 1);

  // Convert JS object literal syntax → valid JSON
  s = s.replace(/\/\/[^\n]*/g, ""); // strip // comments
  s = s.replace(/,(\s*[}\]])/g, "$1"); // remove trailing commas
  // Quote unquoted keys — string-aware (match string literals OR unquoted key)
  s = s.replace(
    /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|([{,]\s*)([a-zA-Z_$]\w*)(\s*:(?!\/))/g,
    (m, pre, key, col) => (key !== undefined ? `${pre}"${key}"${col}` : m)
  );
  s = s.replace(/'([^'\\]*)'/g, '"$1"'); // remaining single-quoted strings
  s = s.replace(/:\s*\/(?:[^/\n])+\/[gimsuy]*/g, ": null"); // strip regex literals

  try {
    const p = JSON.parse(s);
    if (Array.isArray(p)) return { data: p, error: null };
  } catch {}

  return {
    data: null,
    error: 'Could not parse — try pasting JSON from the "schema.json" tab.',
  };
}

// ─── Format detection ─────────────────────────────────────────────────────────

type SchemaFormat = "dynamicForm" | "formWizard" | null;

function detectFormat(arr: any[]): SchemaFormat {
  if (!arr.length) return null;
  const f = arr[0];
  if (!f || typeof f !== "object") return null;
  if (Array.isArray(f.fields) || Array.isArray(f.schema)) return "formWizard";
  if (typeof f.name === "string" && typeof f.type === "string") return "dynamicForm";
  return null;
}

// ─── JSON field → FieldConfig (for "load into builder") ──────────────────────

function jsonFieldToConfig(f: any): Omit<FieldConfig, "id"> {
  const { validation, visibleWhen, options, multipleField, id: _id, ...rest } = f;
  const rnd = () => Math.random().toString(36).slice(2, 9);
  return {
    ...rest,
    ...(options
      ? {
          options: (options as any[]).map((o: any) => ({
            id: rnd(),
            label: String(o.label ?? ""),
            value: String(o.value ?? ""),
          })),
        }
      : {}),
    ...(multipleField
      ? {
          subFields: (multipleField as any[]).map((sf: any) => ({
            id: rnd(),
            type: sf.type,
            name: sf.name,
            label: sf.label ?? sf.name,
            placeholder: sf.placeholder,
            required: sf.required,
            flex: sf.flex,
            options: sf.options?.map((o: any) => ({
              id: rnd(),
              label: String(o.label ?? ""),
              value: String(o.value ?? ""),
            })),
          })),
        }
      : {}),
    ...(validation
      ? {
          validation: {
            minLength:
              validation.minLength?.value ??
              (typeof validation.minLength === "number"
                ? validation.minLength
                : undefined),
            minLengthMessage: validation.minLength?.message,
            maxLength:
              validation.maxLength?.value ??
              (typeof validation.maxLength === "number"
                ? validation.maxLength
                : undefined),
            maxLengthMessage: validation.maxLength?.message,
            pattern:
              typeof validation.pattern?.value === "string"
                ? validation.pattern.value
                : undefined,
            patternMessage: validation.pattern?.message,
          },
        }
      : {}),
    ...(visibleWhen?.conditions?.[0]
      ? {
          condition: {
            field: visibleWhen.conditions[0].field,
            operator: visibleWhen.conditions[0].operator ?? "equals",
            value: visibleWhen.conditions[0].value,
          },
        }
      : {}),
  };
}

// ─── Preview themes ───────────────────────────────────────────────────────────

const lightPreviewTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-3",
  labelClass: "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5",
  inputClass:
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 " +
    "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all",
  inputErrorClass: "border-red-400",
  errorClass: "mt-1 text-xs text-red-500",
  helpTextClass: "mt-1 text-xs text-gray-400",
  requiredMarkClass: "text-red-500 ml-0.5",
  radioGroupClass: "flex flex-wrap gap-3 mt-1",
  optionWrapperClass: "flex items-center gap-2 text-xs text-gray-600",
  checkboxGroupClass: "flex items-center gap-2 mt-1 text-xs text-gray-600",
  submitButtonClass:
    "w-full mt-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer",
};

const darkPreviewTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-3",
  labelClass: "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5",
  inputClass:
    "w-full bg-zinc-800/70 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm text-zinc-100 " +
    "placeholder-zinc-600 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/20 transition-all",
  inputErrorClass: "border-red-500/50",
  errorClass: "mt-1 text-xs text-red-400",
  helpTextClass: "mt-1 text-xs text-zinc-600",
  requiredMarkClass: "text-red-400 ml-0.5",
  radioGroupClass: "flex flex-wrap gap-3 mt-1",
  optionWrapperClass: "flex items-center gap-2 text-xs text-zinc-400",
  checkboxGroupClass: "flex items-center gap-2 mt-1 text-xs text-zinc-400",
  submitButtonClass:
    "w-full mt-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer",
};

// ─── Placeholder example ──────────────────────────────────────────────────────

const PLACEHOLDER = `// Paste a JSON array or TypeScript schema variable.
// Both DynamicForm fields and FormWizard steps are supported.

// Example — DynamicForm fields:
[
  { "name": "email",   "label": "Email",   "type": "email",    "required": true },
  { "name": "message", "label": "Message", "type": "textarea"  }
]

// Example — FormWizard steps:
[
  {
    "label": "Step 1",
    "fields": [
      { "name": "firstName", "label": "First Name", "type": "text" }
    ]
  }
]`;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  dispatch: React.Dispatch<BuilderAction>;
  onClose: () => void;
}

export default function ImportModal({ dispatch, onClose }: Props) {
  const [raw, setRaw] = useState("");
  const [loadDone, setLoadDone] = useState(false);
  const { theme } = useTheme();
  const previewTheme = theme === "dark" ? darkPreviewTheme : lightPreviewTheme;

  const { data, error } = useMemo(() => smartParse(raw), [raw]);
  const format = useMemo(() => (data ? detectFormat(data) : null), [data]);

  const wizardSteps = useMemo(() => {
    if (!data || format !== "formWizard") return null;
    return data.map((s: any) => ({
      title: s.title ?? s.label ?? "Step",
      description: s.description,
      fields: Array.isArray(s.fields)
        ? s.fields
        : Array.isArray(s.schema)
        ? s.schema
        : [],
    }));
  }, [data, format]);

  const loadIntoBuilder = useCallback(() => {
    if (!data || format !== "dynamicForm") return;
    dispatch({ type: "LOAD_TEMPLATE", fields: data.map(jsonFieldToConfig) });
    setLoadDone(true);
    setTimeout(onClose, 700);
  }, [data, format, dispatch, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-6xl h-[85vh] flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
              Paste &amp; Preview
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-zinc-600 mt-0.5">
              Paste a{" "}
              <code className="font-mono">FormFieldSchema[]</code> or{" "}
              <code className="font-mono">FormWizard</code> steps — JSON or
              TypeScript
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Left: paste area */}
          <div className="w-[42%] flex flex-col border-r border-gray-200 dark:border-zinc-800 min-w-0">
            <textarea
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setLoadDone(false);
              }}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              className="flex-1 resize-none p-4 font-mono text-[0.72rem] leading-relaxed bg-gray-50/60 dark:bg-zinc-900/60 text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-700 focus:outline-none"
            />

            {/* Status + action bar */}
            <div className="px-4 py-2.5 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-[10px] min-w-0">
                {!raw.trim() && (
                  <span className="text-gray-400 dark:text-zinc-700 truncate">
                    Paste schema above to preview
                  </span>
                )}
                {raw.trim() && error && (
                  <span className="text-red-500 truncate">{error}</span>
                )}
                {data && format === "dynamicForm" && (
                  <span className="text-green-600 dark:text-green-400 font-semibold truncate">
                    ✓ DynamicForm · {data.length} field
                    {data.length !== 1 ? "s" : ""}
                  </span>
                )}
                {data && format === "formWizard" && (
                  <span className="text-violet-600 dark:text-violet-400 font-semibold truncate">
                    ✓ FormWizard · {data.length} step
                    {data.length !== 1 ? "s" : ""}
                  </span>
                )}
                {data && !format && (
                  <span className="text-amber-600 dark:text-amber-400 truncate">
                    Parsed but format unrecognized
                  </span>
                )}
              </div>

              {format === "dynamicForm" && (
                <button
                  onClick={loadIntoBuilder}
                  disabled={loadDone}
                  className={[
                    "px-3 py-1 text-[10px] font-semibold rounded-md border transition-all flex-shrink-0",
                    loadDone
                      ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"
                      : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer",
                  ].join(" ")}
                >
                  {loadDone ? "✓ Loaded!" : "Load into builder →"}
                </button>
              )}
              {format === "formWizard" && (
                <span className="text-[10px] text-gray-400 dark:text-zinc-600 italic flex-shrink-0">
                  Preview only
                </span>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 min-w-0">
            {!data && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <p className="text-4xl mb-4 opacity-10">⬡</p>
                <p className="text-xs text-gray-400 dark:text-zinc-700">
                  Live preview will appear here
                </p>
                <p className="text-[10px] text-gray-300 dark:text-zinc-800 mt-1">
                  Supports JSON arrays and TypeScript schema variables
                </p>
              </div>
            )}

            {data && format === "dynamicForm" && (
              <div className="p-6">
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-gray-500 dark:text-zinc-600 font-mono">
                    live preview · DynamicForm
                  </span>
                </div>
                <DynamicForm
                  schema={data as any}
                  onSubmit={() => {}}
                  theme={previewTheme}
                  hideSubmitButton={false}
                  submitLabel="Submit"
                />
              </div>
            )}

            {data && format === "formWizard" && wizardSteps && (
              <div className="p-6">
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[10px] text-gray-500 dark:text-zinc-600 font-mono">
                    live preview · FormWizard · {wizardSteps.length} steps
                  </span>
                </div>
                <FormWizard
                  steps={wizardSteps as any}
                  onSubmit={() => {}}
                  theme={previewTheme}
                />
              </div>
            )}

            {data && !format && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                  Array parsed but format not recognized
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-600 max-w-xs leading-relaxed">
                  Expected{" "}
                  <code className="font-mono">FormFieldSchema[]</code> (objects
                  with <code className="font-mono">name</code> +{" "}
                  <code className="font-mono">type</code>) or wizard steps
                  (objects with a{" "}
                  <code className="font-mono">fields</code> array).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
