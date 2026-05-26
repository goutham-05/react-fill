import React, { useState, useCallback } from "react";
import { DynamicForm } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";
import type { FieldConfig } from "./types";
import { generateSchemaCode, generateUsageCode, toFormSchema } from "./codegen";

// ─── Dark preview theme ───────────────────────────────────────────────────────

const previewTheme: FormTheme = {
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
    "w-full mt-1 py-2 bg-gradient-to-r from-blue-600 to-violet-600 " +
    "hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer",
};

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className={[
        "px-3 py-1 text-[10px] font-semibold rounded-md transition-all border",
        copied
          ? "bg-green-500/20 text-green-400 border-green-500/30"
          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border-zinc-700/50",
      ].join(" ")}
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}

// ─── Theme editor ─────────────────────────────────────────────────────────────

const THEME_SLOTS: { key: keyof FormTheme; label: string; hint: string }[] = [
  { key: "wrapperClass",      label: "Field wrapper",    hint: "e.g. mb-4" },
  { key: "labelClass",        label: "Label",            hint: "e.g. block text-sm font-medium text-gray-700" },
  { key: "inputClass",        label: "Input / select",   hint: "e.g. w-full border rounded px-3 py-2" },
  { key: "inputErrorClass",   label: "Input (error)",    hint: "e.g. border-red-500" },
  { key: "errorClass",        label: "Error message",    hint: "e.g. text-red-500 text-xs mt-1" },
  { key: "helpTextClass",     label: "Help text",        hint: "e.g. text-gray-500 text-xs mt-1" },
  { key: "requiredMarkClass", label: "Required mark",    hint: "e.g. text-red-500 ml-0.5" },
  { key: "radioGroupClass",   label: "Radio group",      hint: "e.g. flex flex-col gap-2" },
  { key: "checkboxGroupClass",label: "Checkbox group",   hint: "e.g. flex flex-col gap-2" },
  { key: "optionWrapperClass",label: "Option row",       hint: "e.g. flex items-center gap-2" },
  { key: "submitButtonClass", label: "Submit button",    hint: "e.g. w-full bg-blue-600 text-white py-2 rounded" },
  { key: "resetButtonClass",  label: "Reset button",     hint: "e.g. w-full border py-2 rounded" },
];

function generateThemeCode(theme: Partial<FormTheme>): string {
  const entries = Object.entries(theme).filter(([, v]) => v !== "" && v !== undefined);
  if (entries.length === 0) return `import type { FormTheme } from "@oqlet/react-fill";\n\nconst theme: FormTheme = {\n  unstyled: true,\n};\n`;
  const lines = entries.map(([k, v]) => `  ${k}: "${v}",`).join("\n");
  return `import type { FormTheme } from "@oqlet/react-fill";\n\nconst theme: FormTheme = {\n  unstyled: true,\n${lines}\n};\n`;
}

const inputCls =
  "w-full bg-zinc-900/80 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 " +
  "focus:outline-none focus:border-blue-500/80 transition-all placeholder-zinc-600 font-mono";

function ThemeEditor() {
  const [values, setValues] = useState<Partial<FormTheme>>({});
  const set = (key: keyof FormTheme, val: string) =>
    setValues((v) => ({ ...v, [key]: val || undefined }));
  const code = generateThemeCode(values);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-300">Theme Editor</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Assign Tailwind / CSS classes to each slot</p>
        </div>
        <CopyButton text={code} label="Copy theme" />
      </div>

      <div className="space-y-2.5">
        {THEME_SLOTS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1 block">
              {label}
            </label>
            <input
              className={inputCls}
              placeholder={hint}
              value={(values[key] as string) ?? ""}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Generated code</p>
        <pre className="p-3 bg-zinc-900/60 rounded-lg text-[0.65rem] font-mono text-zinc-400 overflow-x-auto whitespace-pre leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}

// ─── OutputPanel ──────────────────────────────────────────────────────────────

type Tab = "schema" | "usage" | "preview" | "theme";

interface Props {
  fields: FieldConfig[];
  columns: number;
}

export default function OutputPanel({ fields, columns }: Props) {
  const [tab, setTab] = useState<Tab>("schema");

  const schemaCode = generateSchemaCode(fields);
  const usageCode = generateUsageCode(fields, columns);
  const formSchema = toFormSchema(fields);

  const codeForTab = tab === "schema" ? schemaCode : usageCode;

  const tabs: { id: Tab; label: string; title: string }[] = [
    { id: "schema", label: "schema.ts", title: "Copy-paste schema array" },
    { id: "usage", label: "usage.tsx", title: "Full component ready to paste" },
    { id: "preview", label: "Preview", title: "Live rendered form" },
    { id: "theme", label: "Theme", title: "Generate a FormTheme object" },
  ];

  return (
    <aside className="w-[380px] flex-shrink-0 flex flex-col bg-zinc-950/80">
      {/* Tab bar */}
      <div className="flex items-center border-b border-zinc-800 h-10 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            title={t.title}
            className={[
              "px-3.5 h-full text-[11px] font-mono font-medium transition-colors relative",
              tab === t.id
                ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                : "text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
        {tab !== "preview" && tab !== "theme" && (
          <div className="ml-auto mr-3">
            <CopyButton text={codeForTab} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "theme" ? (
          <ThemeEditor />
        ) : tab === "preview" ? (
          <div className="p-4">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-700 text-center">
                <p className="text-2xl mb-3 opacity-30">⬡</p>
                <p className="text-xs">Add fields to see the live preview</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-zinc-600 font-mono">live preview</span>
                </div>
                <DynamicForm
                  schema={formSchema as Parameters<typeof DynamicForm>[0]["schema"]}
                  onSubmit={() => {}}
                  theme={previewTheme}
                  hideSubmitButton={false}
                  submitLabel="Submit"
                  columns={columns}
                />
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            {fields.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <p className="text-xs text-zinc-700 italic">
                  Add fields to generate code
                </p>
              </div>
            )}
            <pre
              className={[
                "p-4 font-mono text-[0.7rem] leading-relaxed whitespace-pre overflow-x-auto",
                "text-zinc-400 min-h-full",
                fields.length === 0 ? "opacity-30" : "",
              ].join(" ")}
            >
              <CodeHighlight code={codeForTab} />
            </pre>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {tab !== "preview" && tab !== "theme" && fields.length > 0 && (
        <div className="border-t border-zinc-800/60 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[10px] text-zinc-700">
            {fields.length} field{fields.length > 1 ? "s" : ""} · ready to paste
          </span>
          <CopyButton text={codeForTab} label="Copy all" />
        </div>
      )}
    </aside>
  );
}

// ─── Simple syntax highlighter ────────────────────────────────────────────────

function CodeHighlight({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          <HighlightLine line={line} />
          {"\n"}
        </span>
      ))}
    </>
  );
}

const KW = new Set(["import", "from", "const", "let", "return", "type", "export", "default", "function"]);
const BOOL = new Set(["true", "false", "null", "undefined"]);

function HighlightLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//")) return <span className="text-zinc-600 italic">{line}</span>;
  const tokens = tokenize(line);
  return <>{tokens.map((t, i) => <span key={i} className={t.cls}>{t.text}</span>)}</>;
}

function tokenize(line: string) {
  const out: { text: string; cls: string }[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    // String literal
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j++;
      out.push({ text: line.slice(i, j + 1), cls: "text-amber-300" });
      i = j + 1;
      continue;
    }

    // Identifier / keyword
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const cls = KW.has(word)
        ? "text-violet-400"
        : BOOL.has(word)
        ? "text-blue-300"
        : /^[A-Z]/.test(word)
        ? "text-blue-300"
        : "text-zinc-300";
      out.push({ text: word, cls });
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      out.push({ text: line.slice(i, j), cls: "text-green-300" });
      i = j;
      continue;
    }

    // Punctuation / whitespace
    out.push({ text: ch, cls: "text-zinc-500" });
    i++;
  }

  return out;
}
