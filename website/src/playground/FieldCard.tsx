import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BuilderAction, FieldConfig, FieldOption, FieldValidation } from "./types";
import { uid } from "./defaults";

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inputCls =
  "w-full bg-zinc-900/80 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-zinc-200 " +
  "focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all";

const TYPE_BADGE: Record<string, string> = {
  text:       "bg-blue-500/20 text-blue-300",
  email:      "bg-sky-500/20 text-sky-300",
  number:     "bg-amber-500/20 text-amber-300",
  textarea:   "bg-violet-500/20 text-violet-300",
  select:     "bg-green-500/20 text-green-300",
  radio:      "bg-pink-500/20 text-pink-300",
  checkbox:   "bg-cyan-500/20 text-cyan-300",
  date:       "bg-teal-500/20 text-teal-300",
  file:       "bg-indigo-500/20 text-indigo-300",
  slider:     "bg-lime-500/20 text-lime-300",
  rating:     "bg-yellow-500/20 text-yellow-300",
  fieldArray: "bg-rose-500/20 text-rose-300",
  group:      "bg-orange-500/20 text-orange-300",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <div
        onClick={() => onChange(!value)}
        className={`relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? "bg-blue-500" : "bg-zinc-700 group-hover:bg-zinc-600"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
        {label}
      </span>
    </label>
  );
}

function OptionsEditor({
  options, onChange,
}: { options: FieldOption[]; onChange: (opts: FieldOption[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          Options
        </span>
        <button
          onClick={() =>
            onChange([
              ...options,
              { id: uid(), label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` },
            ])
          }
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-1.5">
            <input
              className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300
                focus:outline-none focus:border-blue-500/80 transition-all"
              value={opt.label}
              placeholder="Label"
              onChange={(e) =>
                onChange(options.map((o) => (o.id === opt.id ? { ...o, label: e.target.value } : o)))
              }
            />
            <input
              className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-500 font-mono
                focus:outline-none focus:border-blue-500/80 transition-all"
              value={opt.value}
              placeholder="value"
              onChange={(e) =>
                onChange(options.map((o) => (o.id === opt.id ? { ...o, value: e.target.value } : o)))
              }
            />
            <button
              onClick={() => onChange(options.filter((o) => o.id !== opt.id))}
              className="text-zinc-700 hover:text-red-400 transition-colors text-xs px-1 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-zinc-700 italic">No options yet — click + Add</p>
        )}
      </div>
    </div>
  );
}

function ValidationEditor({
  validation, fieldType, onChange,
}: {
  validation: FieldValidation | undefined;
  fieldType: string;
  onChange: (v: FieldValidation | undefined) => void;
}) {
  const v = validation ?? {};
  const set = (patch: Partial<FieldValidation>) => {
    const next = { ...v, ...patch };
    const isEmpty = Object.values(next).every((x) => x === undefined || x === "");
    onChange(isEmpty ? undefined : next);
  };
  const showLength = ["text", "email", "textarea"].includes(fieldType);
  const showPattern = ["text", "email"].includes(fieldType);
  if (!showLength && !showPattern) return null;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Validation</span>
      {showLength && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-600 mb-1 block">Min length</label>
            <input
              type="number"
              className={inputCls}
              min={0}
              value={v.minLength ?? ""}
              placeholder="e.g. 2"
              onChange={(e) => set({ minLength: e.target.value !== "" ? Number(e.target.value) : undefined })}
            />
            {v.minLength != null && (
              <input
                className={`${inputCls} mt-1 text-xs`}
                value={v.minLengthMessage ?? ""}
                placeholder={`Min ${v.minLength} characters`}
                onChange={(e) => set({ minLengthMessage: e.target.value || undefined })}
              />
            )}
          </div>
          <div>
            <label className="text-[10px] text-zinc-600 mb-1 block">Max length</label>
            <input
              type="number"
              className={inputCls}
              min={1}
              value={v.maxLength ?? ""}
              placeholder="e.g. 100"
              onChange={(e) => set({ maxLength: e.target.value !== "" ? Number(e.target.value) : undefined })}
            />
            {v.maxLength != null && (
              <input
                className={`${inputCls} mt-1 text-xs`}
                value={v.maxLengthMessage ?? ""}
                placeholder={`Max ${v.maxLength} characters`}
                onChange={(e) => set({ maxLengthMessage: e.target.value || undefined })}
              />
            )}
          </div>
        </div>
      )}
      {showPattern && (
        <div>
          <label className="text-[10px] text-zinc-600 mb-1 block">Pattern (regex)</label>
          <input
            className={`${inputCls} font-mono`}
            value={v.pattern ?? ""}
            placeholder="^[a-zA-Z]+$"
            onChange={(e) => set({ pattern: e.target.value || undefined })}
          />
          {v.pattern && (
            <input
              className={`${inputCls} mt-1 text-xs`}
              value={v.patternMessage ?? ""}
              placeholder="Invalid format"
              onChange={(e) => set({ patternMessage: e.target.value || undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ConditionEditor({
  condition, allFields, fieldId, onChange,
}: {
  condition: FieldConfig["condition"];
  allFields: FieldConfig[];
  fieldId: string;
  onChange: (c: FieldConfig["condition"]) => void;
}) {
  const otherFields = allFields.filter((f) => f.id !== fieldId);
  const hasCondition = !!condition;

  if (!hasCondition) {
    return (
      <button
        onClick={() =>
          onChange({
            field: otherFields[0]?.name ?? "",
            operator: "equals",
            value: "",
          })
        }
        disabled={otherFields.length === 0}
        className="text-xs text-zinc-600 hover:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Add visibility condition
      </button>
    );
  }

  const OPERATORS = ["equals", "notEquals", "exists", "notExists"] as const;

  return (
    <div className="space-y-2 p-3 bg-zinc-900/60 rounded-lg border border-zinc-700/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          Show this field when
        </span>
        <button
          onClick={() => onChange(null)}
          className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <select
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300
            focus:outline-none focus:border-blue-500/80 transition-all"
          value={condition.field}
          onChange={(e) => onChange({ ...condition, field: e.target.value })}
        >
          <option value="">— pick a field —</option>
          {otherFields.map((f) => (
            <option key={f.id} value={f.name}>{f.label}</option>
          ))}
        </select>
        <select
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300
            focus:outline-none focus:border-blue-500/80 transition-all"
          value={condition.operator}
          onChange={(e) =>
            onChange({ ...condition, operator: e.target.value as typeof condition.operator })
          }
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      </div>
      {condition.operator !== "exists" && condition.operator !== "notExists" && (
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300
            focus:outline-none focus:border-blue-500/80 transition-all"
          value={String(condition.value ?? "")}
          placeholder="value to match"
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        />
      )}
    </div>
  );
}

// ─── FieldCard ────────────────────────────────────────────────────────────────

interface Props {
  field: FieldConfig;
  isSelected: boolean;
  allFields: FieldConfig[];
  columns: number;
  dispatch: React.Dispatch<BuilderAction>;
}

export default function FieldCard({ field, isSelected, allFields, columns, dispatch }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id, data: { source: "canvas" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const update = (changes: Partial<FieldConfig>) =>
    dispatch({ type: "UPDATE_FIELD", id: field.id, changes });

  const toggleSelect = () =>
    dispatch({ type: "SELECT", id: isSelected ? null : field.id });

  return (
    <div ref={setNodeRef} style={style}>
      {/* ─ Card header ─ */}
      <div
        onClick={toggleSelect}
        className={[
          "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all select-none",
          isSelected
            ? "bg-zinc-800 ring-1 ring-blue-500/40 rounded-xl rounded-b-none"
            : "bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 rounded-xl",
        ].join(" ")}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="text-zinc-700 hover:text-zinc-400 cursor-grab active:cursor-grabbing text-sm leading-none px-0.5 flex-shrink-0"
          title="Drag to reorder"
        >
          ⠿
        </div>

        {/* Type badge */}
        <span
          className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
            TYPE_BADGE[field.type] ?? "bg-zinc-700 text-zinc-300"
          }`}
        >
          {field.type}
        </span>

        {/* Label + name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate leading-tight">{field.label}</p>
          <p className="text-[10px] text-zinc-600 font-mono truncate">{field.name}</p>
        </div>

        {/* Badges + actions */}
        <div
          className="flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {field.required && (
            <span className="text-[9px] text-red-400 border border-red-500/30 px-1 rounded">req</span>
          )}
          {field.disabled && (
            <span className="text-[9px] text-zinc-500 border border-zinc-700 px-1 rounded">off</span>
          )}
          {field.validation && (
            <span className="text-[9px] text-amber-400 border border-amber-500/30 px-1 rounded" title="Has validation rules">val</span>
          )}
          {field.condition && (
            <span className="text-[9px] text-blue-400 border border-blue-500/30 px-1 rounded" title="Has visibility condition">if</span>
          )}
          {field.apiEndpoint !== undefined && (
            <span className="text-[9px] text-emerald-400 border border-emerald-500/30 px-1 rounded" title="Uses API endpoint">api</span>
          )}
          {field.fullWidth && (
            <span className="text-[9px] text-zinc-500 border border-zinc-700 px-1 rounded">full</span>
          )}
          {field.colSpan && !field.fullWidth && (
            <span className="text-[9px] text-violet-400 border border-violet-500/30 px-1 rounded">{field.colSpan}col</span>
          )}
          <button
            onClick={() => dispatch({ type: "DUPLICATE", id: field.id })}
            title="Duplicate"
            className="p-1 text-zinc-700 hover:text-zinc-300 rounded transition-colors"
          >
            ⧉
          </button>
          <button
            onClick={() => dispatch({ type: "REMOVE_FIELD", id: field.id })}
            title="Remove"
            className="p-1 text-zinc-700 hover:text-red-400 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─ Inline editor (expanded when selected) ─ */}
      {isSelected && (
        <div className="bg-zinc-800/70 border border-zinc-700/80 border-t-zinc-700/30 rounded-b-xl px-4 pt-3 pb-4 space-y-3">
          {/* Label + Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                Label
              </label>
              <input
                className={inputCls}
                value={field.label}
                onChange={(e) => update({ label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                Name <span className="normal-case tracking-normal font-normal text-zinc-700">(key)</span>
              </label>
              <input
                className={`${inputCls} font-mono`}
                value={field.name}
                onChange={(e) =>
                  update({ name: e.target.value.replace(/\s+/g, "_").toLowerCase() })
                }
              />
            </div>
          </div>

          {/* Placeholder */}
          {!["checkbox", "radio", "group", "date", "file", "slider", "rating", "fieldArray"].includes(field.type) && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                Placeholder
              </label>
              <input
                className={inputCls}
                value={field.placeholder ?? ""}
                placeholder="Hint text shown inside the field…"
                onChange={(e) => update({ placeholder: e.target.value || undefined })}
              />
            </div>
          )}

          {/* Help text + Tooltip */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                Help Text
              </label>
              <input
                className={inputCls}
                value={field.helpText ?? ""}
                placeholder="Shown below the field…"
                onChange={(e) => update({ helpText: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                Tooltip
              </label>
              <input
                className={inputCls}
                value={field.tooltip ?? ""}
                placeholder="Hover hint…"
                onChange={(e) => update({ tooltip: e.target.value || undefined })}
              />
            </div>
          </div>

          {/* Toggles + Layout */}
          <div className="flex items-center gap-5 pt-1 flex-wrap">
            <Toggle label="Required" value={!!field.required} onChange={(v) => update({ required: v || undefined })} />
            <Toggle label="Disabled" value={!!field.disabled} onChange={(v) => update({ disabled: v || undefined })} />
            {columns === 1 ? (
              <Toggle
                label="Full Width"
                value={!!field.fullWidth}
                onChange={(v) => update({ fullWidth: v || undefined })}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Span</span>
                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  {/* Auto — no span override */}
                  <button
                    onClick={() => update({ colSpan: undefined, fullWidth: undefined })}
                    title="Auto (1 column)"
                    className={[
                      "px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      !field.colSpan && !field.fullWidth
                        ? "bg-blue-600 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    1
                  </button>
                  {/* Span 2 — only visible in 3-col mode */}
                  {columns >= 3 && (
                    <button
                      onClick={() => update({ colSpan: 2, fullWidth: undefined })}
                      title="Span 2 columns"
                      className={[
                        "px-2 py-0.5 text-[10px] font-semibold transition-colors",
                        field.colSpan === 2 && !field.fullWidth
                          ? "bg-blue-600 text-white"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      2
                    </button>
                  )}
                  {/* Full width — span all columns */}
                  <button
                    onClick={() => update({ colSpan: undefined, fullWidth: true })}
                    title="Full width (span all columns)"
                    className={[
                      "px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      field.fullWidth
                        ? "bg-blue-600 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    Full
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Number-specific */}
          {field.type === "number" && (
            <div className="grid grid-cols-3 gap-3">
              {(["min", "max", "step"] as const).map((k) => (
                <div key={k}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">{k}</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={field[k] ?? ""}
                    onChange={(e) =>
                      update({ [k]: e.target.value !== "" ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Textarea rows + word count */}
          {field.type === "textarea" && (
            <div className="flex items-end gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">Rows</label>
                <input
                  type="number"
                  className={`${inputCls} w-24`}
                  min={1}
                  max={20}
                  value={field.rows ?? 4}
                  onChange={(e) => update({ rows: Number(e.target.value) })}
                />
              </div>
              <div className="pb-1">
                <Toggle
                  label="Word count"
                  value={!!field.showWordCount}
                  onChange={(v) => update({ showWordCount: v || undefined })}
                />
              </div>
            </div>
          )}

          {/* Options editor — static / API toggle for select, radio, checkbox-group */}
          {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (() => {
            const optionsMode = field.apiEndpoint !== undefined ? "api" : "static";
            const otherFields = allFields.filter((f) => f.id !== field.id);
            return (
              <div className="space-y-2">
                {/* Segmented control */}
                <div className="flex items-center gap-0 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden w-fit">
                  <button
                    onClick={() => {
                      if (optionsMode !== "static") {
                        update({ apiEndpoint: undefined, dependsOn: undefined, options: [] });
                      }
                    }}
                    className={[
                      "px-3 py-1 text-[10px] font-semibold transition-colors",
                      optionsMode === "static"
                        ? "bg-blue-600 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    Static
                  </button>
                  <button
                    onClick={() => {
                      if (optionsMode !== "api") {
                        update({ options: [], apiEndpoint: "" });
                      }
                    }}
                    className={[
                      "px-3 py-1 text-[10px] font-semibold transition-colors",
                      optionsMode === "api"
                        ? "bg-blue-600 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    API Endpoint
                  </button>
                </div>

                {optionsMode === "static" && (
                  <OptionsEditor
                    options={field.options ?? []}
                    onChange={(options) => update({ options })}
                  />
                )}

                {optionsMode === "api" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                        Endpoint URL
                      </label>
                      <input
                        className={inputCls}
                        value={field.apiEndpoint ?? ""}
                        placeholder="https://api.example.com/options"
                        onChange={(e) => update({ apiEndpoint: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">
                        Depends on field
                      </label>
                      <select
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        value={field.dependsOn ?? ""}
                        onChange={(e) => update({ dependsOn: e.target.value || undefined })}
                      >
                        <option value="">— none —</option>
                        {otherFields.map((f) => (
                          <option key={f.id} value={f.name}>{f.label} ({f.name})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* File-specific */}
          {field.type === "file" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">Accept</label>
                <input
                  className={inputCls}
                  value={field.accept ?? ""}
                  placeholder="image/*,.pdf"
                  onChange={(e) => update({ accept: e.target.value || undefined })}
                />
              </div>
              <div className="flex items-end pb-1.5">
                <Toggle label="Multiple" value={!!field.multiple} onChange={(v) => update({ multiple: v || undefined })} />
              </div>
            </div>
          )}

          {/* Slider-specific */}
          {field.type === "slider" && (
            <div className="grid grid-cols-3 gap-3">
              {(["min", "max", "step"] as const).map((k) => (
                <div key={k}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">{k}</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={field[k] ?? ""}
                    onChange={(e) => update({ [k]: e.target.value !== "" ? Number(e.target.value) : undefined })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Rating-specific */}
          {field.type === "rating" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">Stars</label>
              <input
                type="number"
                className={`${inputCls} w-24`}
                min={1}
                max={10}
                value={field.starCount ?? 5}
                onChange={(e) => update({ starCount: Number(e.target.value) })}
              />
            </div>
          )}

          {/* Repeater (fieldArray) buttons */}
          {field.type === "fieldArray" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">Add Button Label</label>
                <input
                  className={inputCls}
                  value={field.addButtonLabel ?? ""}
                  placeholder="+ Add row"
                  onChange={(e) => update({ addButtonLabel: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 block">Remove Button Label</label>
                <input
                  className={inputCls}
                  value={field.removeButtonLabel ?? ""}
                  placeholder="Remove"
                  onChange={(e) => update({ removeButtonLabel: e.target.value || undefined })}
                />
              </div>
            </div>
          )}

          {/* Validation */}
          <div className="border-t border-zinc-700/40 pt-3">
            <ValidationEditor
              validation={field.validation}
              fieldType={field.type}
              onChange={(validation) => update({ validation })}
            />
          </div>

          {/* Condition */}
          <div className="border-t border-zinc-700/40 pt-3">
            <ConditionEditor
              condition={field.condition ?? null}
              allFields={allFields}
              fieldId={field.id}
              onChange={(condition) => update({ condition: condition ?? undefined })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
