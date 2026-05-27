import { useState } from "react";
import { DynamicForm } from "@oqlet/react-fill";
import type { FormFieldSchema, FormTheme } from "@oqlet/react-fill";
import { useTheme } from "../ThemeContext";

const TOGGLE_INPUT = "h-4 w-4 shrink-0 cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25";

const darkTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5",
  inputClass: "w-full bg-zinc-800/70 border border-zinc-700/70 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/40 transition-all",
  radioInputClass: TOGGLE_INPUT,
  checkboxInputClass: TOGGLE_INPUT,
  inputErrorClass: "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/30",
  errorClass: "mt-1.5 text-xs text-red-400",
  helpTextClass: "mt-1 text-xs text-zinc-500",
  requiredMarkClass: "text-red-400 ml-0.5",
  radioGroupClass: "flex flex-col gap-2 mt-1",
  optionWrapperClass: "flex items-center gap-2.5 text-sm text-zinc-300",
  checkboxGroupClass: "mt-1",
  submitButtonClass: "w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer",
};

const lightTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5",
  inputClass: "w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all",
  radioInputClass: TOGGLE_INPUT,
  checkboxInputClass: TOGGLE_INPUT,
  inputErrorClass: "border-red-400 focus:border-red-400 focus:ring-red-400/30",
  errorClass: "mt-1.5 text-xs text-red-500",
  helpTextClass: "mt-1 text-xs text-gray-500",
  requiredMarkClass: "text-red-500 ml-0.5",
  radioGroupClass: "flex flex-col gap-2 mt-1",
  optionWrapperClass: "flex items-center gap-2.5 text-sm text-gray-700",
  checkboxGroupClass: "mt-1",
  submitButtonClass: "w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer",
};

const demoSchema: FormFieldSchema[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Jane Smith",
    fullWidth: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "jane@example.com",
    validation: {
      pattern: {
        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: "Enter a valid email address",
      },
    },
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Developer", value: "developer" },
      { label: "Designer", value: "designer" },
      { label: "Product Manager", value: "pm" },
    ],
  },
  {
    name: "newsletter",
    label: "Notify me about releases",
    checkboxLabel: "",
    type: "checkbox",
    fullWidth: true,
  },
  {
    name: "frequency",
    label: "Email Frequency",
    type: "radio",
    fullWidth: true,
    helpText: "How often would you like to hear from us?",
    options: [
      { label: "Daily digest", value: "daily" },
      { label: "Weekly summary", value: "weekly" },
      { label: "Major releases only", value: "major" },
    ],
    visibleWhen: {
      conditions: [{ field: "newsletter", operator: "equals", value: true }],
    },
  },
];

const SCHEMA_CODE = `const schema: FormFieldSchema[] = [
  {
    name: "name",    label: "Full Name",
    type: "text",    required: true,
    fullWidth: true,
  },
  {
    name: "email",   label: "Email",
    type: "email",   required: true,
    validation: {
      pattern: {
        value: /^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$/,
        message: "Enter a valid email",
      },
    },
  },
  { name: "role", label: "Role", type: "select",
    options: [
      { label: "Developer", value: "developer" },
      { label: "Designer",  value: "designer"  },
    ],
  },
  {
    name: "newsletter",
    label: "Notify me about releases",
    type: "checkbox", fullWidth: true,
  },
  {
    name: "frequency", label: "Email Frequency",
    type: "radio",     fullWidth: true,
    options: [
      { label: "Daily",   value: "daily"  },
      { label: "Weekly",  value: "weekly" },
      { label: "Major releases", value: "major" },
    ],
    // ✨ only visible when checkbox is checked
    visibleWhen: {
      conditions: [{
        field: "newsletter",
        operator: "equals",
        value: true,
      }],
    },
  },
];`;

const RENDER_CODE = `import { DynamicForm } from "@oqlet/react-fill";

<DynamicForm
  schema={schema}
  onSubmit={(data) => console.log(data)}
  theme={myTheme}
  defaultValues={{ role: "developer" }}
  showReset
/>`;

type Tab = "schema" | "usage" | "result";

function DemoCodeBlock({ code, showLineNumbers }: { code: string; showLineNumbers: boolean }) {
  const lines = code.split("\n");

  return (
    <pre className="p-5 font-mono text-[0.8rem] leading-relaxed overflow-auto h-full">
      <div className="table w-full">
        {lines.map((line, index) => (
          <div key={index} className="table-row">
            {showLineNumbers ? (
              <span className="table-cell pr-5 text-gray-400 dark:text-zinc-700 select-none text-right w-8 text-[0.75rem] align-top">
                {index + 1}
              </span>
            ) : null}
            <span className="table-cell">
              <HighlightLine line={line} />
            </span>
          </div>
        ))}
      </div>
    </pre>
  );
}

function HighlightLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//")) {
    return <span className="text-gray-400 dark:text-zinc-600 italic">{line}</span>;
  }

  const tokens = tokenize(line);
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={token.cls}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function tokenize(line: string): { text: string; cls: string }[] {
  const result: { text: string; cls: string }[] = [];
  let i = 0;
  const kw = new Set(["import", "from", "const", "let", "return", "type", "true", "false", "null"]);
  const types = new Set(["FormTheme", "DynamicForm", "FormFieldSchema"]);

  while (i < line.length) {
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) j++;
      result.push({ text: line.slice(i, j + 1), cls: "text-amber-600 dark:text-amber-300" });
      i = j + 1;
      continue;
    }

    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i + 1;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const cls = kw.has(word)
        ? "text-violet-600 dark:text-violet-400"
        : types.has(word)
        ? "text-blue-600 dark:text-blue-300"
        : "text-gray-900 dark:text-zinc-200";
      result.push({ text: word, cls });
      i = j;
      continue;
    }

    result.push({ text: line[i], cls: "text-gray-600 dark:text-zinc-400" });
    i++;
  }

  return result;
}

export default function Demo() {
  const [activeTab, setActiveTab] = useState<Tab>("schema");
  const [result, setResult] = useState<object | null>(null);
  const { theme } = useTheme();

  const tabAccent: Record<Tab, string> = {
    schema: "text-blue-600 dark:text-blue-400",
    usage: "text-cyan-600 dark:text-cyan-400",
    result: "text-emerald-600 dark:text-emerald-400",
  };

  const handleSubmit = (data: object) => {
    setResult(data);
    setActiveTab("result");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "schema", label: "schema.ts" },
    { id: "usage", label: "usage.tsx" },
    { id: "result", label: result ? "✓ result.json" : "result.json" },
  ];

  const codeMap: Record<Tab, string> = {
    schema: SCHEMA_CODE,
    usage: RENDER_CODE,
    result: result ? JSON.stringify(result, null, 2) : "// Submit the form to see output here",
  };

  return (
    <section id="demo" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Live Demo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-100">
            See it in action
          </h2>
          <p className="mt-3 text-gray-500 dark:text-zinc-400 max-w-xl mx-auto">
            The form below is rendered entirely from the schema on the left.
            Check the checkbox to see conditional fields appear.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950">
          {/* Code panel */}
          <div className="bg-white dark:bg-zinc-950 flex flex-col">
            {/* Tab bar */}
            <div className="flex bg-gray-50/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "px-5 py-3.5 text-xs font-semibold transition-all",
                    activeTab === tab.id
                      ? `${tabAccent[tab.id]} border-b-2 border-current bg-white/40 dark:bg-zinc-950/40`
                      : "text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950" style={{ maxHeight: 440 }}>
              <DemoCodeBlock code={codeMap[activeTab]} showLineNumbers={activeTab !== "result"} />
            </div>
          </div>

          {/* Live form panel */}
          <div className="bg-gray-50/50 dark:bg-zinc-900/50 border-l border-gray-200 dark:border-zinc-800 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Live Preview</span>
            </div>
            <div className="flex-1 overflow-auto" style={{ maxHeight: 500 }}>
              <DynamicForm
                schema={demoSchema}
                onSubmit={handleSubmit}
                theme={theme === "dark" ? darkTheme : lightTheme}
                defaultValues={{ role: "developer" }}
                submitLabel="Submit →"
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-zinc-500 mt-4">
          Try checking "Notify me" — the frequency field appears via{" "}
          <code className="text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">visibleWhen</code>
        </p>
      </div>
    </section>
  );
}
