import React, { useState, useEffect, useRef } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DocsProps {
  onBack: () => void;
}

// ─── Syntax highlighting (copied from App.tsx — not imported to keep Docs self-contained) ──

function tokenize(line: string): { text: string; cls: string }[] {
  const result: { text: string; cls: string }[] = [];
  let i = 0;
  const kw = new Set([
    "import", "from", "const", "let", "return", "type", "true", "false",
    "null", "undefined", "export", "default", "function", "interface",
    "async", "await", "new", "if", "else",
  ]);
  const types = new Set([
    "FormTheme", "DynamicForm", "FormFieldSchema", "DynamicFormHandle",
    "FormWizard", "useRef", "useEffect", "React",
  ]);

  while (i < line.length) {
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) j++;
      result.push({ text: line.slice(i, j + 1), cls: "text-amber-300" });
      i = j + 1;
      continue;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i + 1;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const cls = kw.has(word)
        ? "text-violet-400"
        : types.has(word)
        ? "text-blue-300"
        : "text-zinc-200";
      result.push({ text: word, cls });
      i = j;
      continue;
    }
    result.push({ text: line[i], cls: "text-zinc-400" });
    i++;
  }
  return result;
}

function HighlightLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#")) {
    return <span className="text-zinc-600 italic">{line}</span>;
  }
  const tokens = tokenize(line);
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} className={tok.cls}>
          {tok.text}
        </span>
      ))}
    </>
  );
}

function SimpleHighlight({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="table w-full">
      {lines.map((line, li) => (
        <div key={li} className="table-row">
          <span className="table-cell pr-5 text-zinc-700 select-none text-right w-8 text-[0.75rem]">
            {li + 1}
          </span>
          <span className="table-cell">
            <HighlightLine line={line} />
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group mt-4">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
          <button
            onClick={copy}
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      )}
      {!label && (
        <button
          onClick={copy}
          className="absolute top-3 right-3 text-[10px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 opacity-0 group-hover:opacity-100"
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      )}
      <pre className="p-5 font-mono text-[0.8rem] leading-relaxed overflow-auto max-h-[480px]">
        <SimpleHighlight code={code} />
      </pre>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  accentColor,
  accentLabel,
  title,
  children,
}: {
  id: string;
  accentColor: string;
  accentLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 mb-16">
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${accentColor}`}>
        {accentLabel}
      </p>
      <h2 className="text-2xl font-bold text-zinc-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

// ─── Prose ────────────────────────────────────────────────────────────────────

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-zinc-400 text-sm leading-relaxed">{children}</p>
  );
}

// ─── Props table ─────────────────────────────────────────────────────────────

function PropsTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="overflow-x-auto mt-4 rounded-xl border border-zinc-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-zinc-900/80 border-b border-zinc-800">
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Prop</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Default</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([prop, type, def, desc], i) => (
            <tr key={prop} className={i % 2 === 0 ? "bg-zinc-950/40" : "bg-zinc-900/20"}>
              <td className="px-4 py-2.5 font-mono text-blue-300 text-xs whitespace-nowrap">{prop}</td>
              <td className="px-4 py-2.5 font-mono text-amber-300/80 text-xs whitespace-nowrap">{type}</td>
              <td className="px-4 py-2.5 font-mono text-zinc-500 text-xs whitespace-nowrap">{def}</td>
              <td className="px-4 py-2.5 text-zinc-400 text-xs">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Field types grid ─────────────────────────────────────────────────────────

const FIELD_TYPES_DATA = [
  { type: "text",       color: "bg-blue-500/20 text-blue-300",    desc: "Single-line text input",           keyProps: "placeholder, validation" },
  { type: "email",      color: "bg-sky-500/20 text-sky-300",      desc: "Email input with format hint",     keyProps: "placeholder, validation.pattern" },
  { type: "number",     color: "bg-amber-500/20 text-amber-300",  desc: "Numeric input with range control", keyProps: "min, max, step" },
  { type: "textarea",   color: "bg-violet-500/20 text-violet-300",desc: "Multi-line text area",             keyProps: "rows, showWordCount" },
  { type: "select",     color: "bg-green-500/20 text-green-300",  desc: "Dropdown select list",             keyProps: "options, apiEndpoint, dependsOn" },
  { type: "radio",      color: "bg-pink-500/20 text-pink-300",    desc: "Radio button group",               keyProps: "options, apiEndpoint" },
  { type: "checkbox",   color: "bg-cyan-500/20 text-cyan-300",    desc: "Single checkbox or multi-group",   keyProps: "options (multi-group)" },
  { type: "date",       color: "bg-teal-500/20 text-teal-300",    desc: "Native date picker",               keyProps: "min, max" },
  { type: "file",       color: "bg-indigo-500/20 text-indigo-300",desc: "File upload input",                keyProps: "accept, multiple" },
  { type: "slider",     color: "bg-lime-500/20 text-lime-300",    desc: "Range slider with numeric output", keyProps: "min, max, step" },
  { type: "rating",     color: "bg-yellow-500/20 text-yellow-300",desc: "Star rating input",                keyProps: "starCount" },
  { type: "fieldArray", color: "bg-rose-500/20 text-rose-300",    desc: "Dynamic repeater rows",            keyProps: "children, addButtonLabel" },
  { type: "group",      color: "bg-orange-500/20 text-orange-300",desc: "Logical fieldset group",           keyProps: "children" },
  { type: "multiField", color: "bg-fuchsia-500/20 text-fuchsia-300",desc: "Inline multi-part field",        keyProps: "children" },
  { type: "FormWizard", color: "bg-purple-500/20 text-purple-300",desc: "Multi-step wizard (top-level component, not a field type)", keyProps: "steps, onSubmit" },
];

// ─── Code samples ──────────────────────────────────────────────────────────────

const QUICK_START_CODE = `# 1. Install
npm install @oqlet/react-fill

// 2. Define a schema
import { DynamicForm } from "@oqlet/react-fill";
import type { FormFieldSchema } from "@oqlet/react-fill";

const schema: FormFieldSchema[] = [
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "email",     label: "Email",      type: "email", required: true },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Developer", value: "dev" },
      { label: "Designer",  value: "design" },
    ],
  },
];

// 3. Render
export default function MyForm() {
  return (
    <DynamicForm
      schema={schema}
      onSubmit={(data) => console.log(data)}
      showReset
    />
  );
}`;

const ASYNC_OPTIONS_CODE = `const schema: FormFieldSchema[] = [
  {
    name: "country",
    label: "Country",
    type: "select",
    apiEndpoint: "https://api.example.com/countries",
    // options are fetched from the endpoint at runtime
  },
  {
    name: "state",
    label: "State / Province",
    type: "select",
    apiEndpoint: "https://api.example.com/states",
    dependsOn: "country",
    // re-fetches whenever the "country" field changes
  },
];`;

const CONDITIONAL_CODE = `const schema: FormFieldSchema[] = [
  {
    name: "hasPromoCode",
    label: "I have a promo code",
    type: "checkbox",
  },
  {
    name: "promoCode",
    label: "Promo Code",
    type: "text",
    placeholder: "Enter code…",
    visibleWhen: {
      operator: "AND",
      conditions: [
        { field: "hasPromoCode", operator: "equals", value: true },
      ],
    },
  },
];`;

const FIELD_ARRAY_CODE = `const schema: FormFieldSchema[] = [
  {
    name: "emergencyContacts",
    label: "Emergency Contacts",
    type: "fieldArray",
    addButtonLabel: "+ Add Contact",
    removeButtonLabel: "Remove",
    children: [
      { name: "name",  label: "Full Name",     type: "text",  required: true },
      { name: "phone", label: "Phone Number",  type: "text" },
      { name: "rel",   label: "Relationship",  type: "select",
        options: [
          { label: "Parent", value: "parent" },
          { label: "Spouse", value: "spouse" },
          { label: "Friend", value: "friend" },
        ],
      },
    ],
  },
];`;

const GRID_LAYOUT_CODE = `export default function MyForm() {
  return (
    <DynamicForm
      schema={[
        { name: "first",   label: "First Name", type: "text" },
        { name: "last",    label: "Last Name",  type: "text" },
        { name: "email",   label: "Email",      type: "email", colSpan: 2 },
        { name: "bio",     label: "Bio",        type: "textarea", fullWidth: true },
      ]}
      columns={3}
      gap={4}
      onSubmit={fn}
    />
  );
}`;

const VALIDATION_CODE = `const schema: FormFieldSchema[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    required: true,
    validation: {
      minLength: {
        value: 3,
        message: "Username must be at least 3 characters",
      },
      maxLength: {
        value: 20,
        message: "Username cannot exceed 20 characters",
      },
      pattern: {
        value: /^[a-z0-9_]+$/,
        message: "Only lowercase letters, numbers, and underscores",
      },
      custom: (value) =>
        value !== "admin" || "Username 'admin' is reserved",
    },
  },
];`;

const FORM_THEME_CODE = `import { DynamicForm } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";

const theme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: [
    "w-full rounded-md border border-gray-300 px-3 py-2",
    "text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
  ].join(" "),
  inputErrorClass: "border-red-500 focus:ring-red-500",
  errorClass: "mt-1 text-xs text-red-600",
  requiredMarkClass: "text-red-500 ml-0.5",
  submitButtonClass: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
};

<DynamicForm schema={schema} theme={theme} onSubmit={fn} />`;

const WIZARD_CODE = `import { FormWizard } from "@oqlet/react-fill";
import type { FormFieldSchema } from "@oqlet/react-fill";

const steps: { label: string; fields: FormFieldSchema[] }[] = [
  {
    label: "Personal Info",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true },
      { name: "lastName",  label: "Last Name",  type: "text", required: true },
    ],
  },
  {
    label: "Contact",
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "text" },
    ],
  },
  {
    label: "Preferences",
    fields: [
      { name: "newsletter", label: "Subscribe to newsletter", type: "checkbox" },
      { name: "theme",      label: "Preferred Theme",         type: "radio",
        options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }],
      },
    ],
  },
];

export default function SignupWizard() {
  return (
    <FormWizard
      steps={steps}
      onSubmit={(data) => console.log(data)}
    />
  );
}`;

const PROGRAMMATIC_CODE = `import { useRef } from "react";
import { DynamicForm } from "@oqlet/react-fill";
import type { DynamicFormHandle, FormFieldSchema } from "@oqlet/react-fill";

const schema: FormFieldSchema[] = [
  { name: "email",    label: "Email",    type: "email",  required: true },
  { name: "password", label: "Password", type: "text",   required: true },
];

export default function LoginForm() {
  const formRef = useRef<DynamicFormHandle>(null);

  const prefill = () => {
    formRef.current?.setValue("email", "user@example.com");
  };

  const validate = async () => {
    const valid = await formRef.current?.trigger();
    if (valid) console.log("All fields valid");
  };

  const reset = () => formRef.current?.reset();

  return (
    <>
      <DynamicForm schema={schema} formRef={formRef} onSubmit={console.log} />
      <button onClick={prefill}>Prefill</button>
      <button onClick={validate}>Validate</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}`;

// ─── API Reference rows ────────────────────────────────────────────────────────

const API_PROPS_ROWS: [string, string, string, string][] = [
  ["schema",            "FormFieldSchema[]",     "required",   "Array of field definitions"],
  ["onSubmit",          "(data: T) => void",     "required",   "Callback when form is submitted successfully"],
  ["defaultValues",     "Record<string, any>",   "—",          "Pre-populate field values on first render"],
  ["mode",              "ValidationMode",         "'onSubmit'", "When to trigger validation: onSubmit, onChange, onBlur, onTouched, all"],
  ["formRef",           "Ref<DynamicFormHandle>", "—",          "Exposes setValue, trigger, reset, getValues, setError"],
  ["theme",             "FormTheme",              "—",          "Override CSS class names for every structural element"],
  ["columns",           "number",                 "1",          "Number of grid columns (1–4)"],
  ["gap",               "number",                 "4",          "Tailwind gap-N between cells"],
  ["maxWidth",          "string",                 "—",          "CSS max-width applied to the form wrapper"],
  ["submitLabel",       "string",                 "'Submit'",   "Label text for the submit button"],
  ["hideSubmitButton",  "boolean",                "false",      "Hide the default submit button"],
  ["showReset",         "boolean",                "false",      "Show a reset button next to submit"],
  ["onReset",           "() => void",             "—",          "Callback when reset button is clicked"],
];

const FORM_THEME_SLOTS: [string, string, string, string][] = [
  ["wrapperClass",        "string", "—", "Wrapper div around each field"],
  ["labelClass",          "string", "—", "The <label> element"],
  ["inputClass",          "string", "—", "text, email, number, textarea, select inputs"],
  ["inputErrorClass",     "string", "—", "Added to input when it has an error"],
  ["errorClass",          "string", "—", "Error message paragraph"],
  ["helpTextClass",       "string", "—", "Help text below the input"],
  ["requiredMarkClass",   "string", "—", "The asterisk (*) after required labels"],
  ["checkboxClass",       "string", "—", "Individual checkbox input element"],
  ["radioClass",          "string", "—", "Individual radio input element"],
  ["radioGroupClass",     "string", "—", "Wrapper around the radio group"],
  ["checkboxGroupClass",  "string", "—", "Wrapper around the checkbox group"],
  ["optionWrapperClass",  "string", "—", "Wrapper around each radio/checkbox option"],
  ["submitButtonClass",   "string", "—", "Submit button"],
  ["resetButtonClass",    "string", "—", "Reset button"],
  ["fieldsetClass",       "string", "—", "fieldset element for group/fieldArray"],
  ["legendClass",         "string", "—", "legend element for group/fieldArray"],
];

// ─── TOC items ────────────────────────────────────────────────────────────────

const TOC_ITEMS = [
  { id: "doc-quick-start",    label: "Quick Start" },
  { id: "doc-field-types",    label: "Field Types" },
  { id: "doc-async-options",  label: "Async Options" },
  { id: "doc-conditional",    label: "Conditional Fields" },
  { id: "doc-field-array",    label: "Field Array" },
  { id: "doc-grid-layout",    label: "Grid Layout" },
  { id: "doc-validation",     label: "Validation" },
  { id: "doc-form-theme",     label: "FormTheme" },
  { id: "doc-wizard",         label: "Multi-Step Wizard" },
  { id: "doc-programmatic",   label: "Programmatic Control" },
  { id: "doc-api-reference",  label: "API Reference" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeId }: { activeId: string }) {
  return (
    <nav className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-3 mb-3">Contents</p>
      {TOC_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={[
            "block px-3 py-1.5 rounded-lg text-sm transition-all",
            activeId === item.id
              ? "bg-blue-600/20 text-blue-300 font-medium"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60",
          ].join(" ")}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// ─── Docs ─────────────────────────────────────────────────────────────────────

export default function Docs({ onBack }: DocsProps) {
  const [activeId, setActiveId] = useState(TOC_ITEMS[0].id);
  const mainRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to highlight active section in TOC
  useEffect(() => {
    const sectionEls = TOC_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-20% 0% -60% 0%",
        threshold: 0,
      }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#09090b] text-zinc-100 font-sans min-h-screen flex flex-col">
      {/* ─ Top bar ─ */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-4 sm:px-6 h-14 border-b border-zinc-800/60 bg-[#09090b]/95 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back</span>
        </button>
        <div className="w-px h-5 bg-zinc-800" />
        <span className="text-sm font-semibold text-zinc-100">Documentation</span>
        <div className="flex-1" />
        <a
          href="https://github.com/goutham-05/react-fill"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block"
        >
          GitHub →
        </a>
      </header>

      {/* ─ Mobile chips row ─ */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-900/40 flex-shrink-0 scrollbar-none">
        {TOC_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={[
              "whitespace-nowrap px-3 py-1 rounded-full text-xs transition-all flex-shrink-0",
              activeId === item.id
                ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                : "text-zinc-500 bg-zinc-800/60 border border-zinc-700/50 hover:text-zinc-200",
            ].join(" ")}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* ─ Body ─ */}
      <div className="flex flex-1 min-h-0">
        {/* Fixed sidebar — hidden on mobile */}
        <aside className="hidden sm:block w-60 flex-shrink-0 sticky top-14 self-start pt-8 pb-8 pl-4 pr-2 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Sidebar activeId={activeId} />
        </aside>

        {/* Main scrollable content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-10 max-w-4xl"
        >
          {/* ─ Quick Start ─ */}
          <Section
            id="doc-quick-start"
            accentColor="text-blue-400"
            accentLabel="Getting Started"
            title="Quick Start"
          >
            <Prose>
              Install the package and its three peer dependencies — React, ReactDOM, and React Hook Form — then define a field schema and pass it to{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
              No configuration needed beyond the schema.
            </Prose>
            <CodeBlock code={QUICK_START_CODE} label="typescript" />
          </Section>

          {/* ─ Field Types ─ */}
          <Section
            id="doc-field-types"
            accentColor="text-violet-400"
            accentLabel="Reference"
            title="Field Types"
          >
            <Prose>
              ReactFill supports 15 field types out of the box. Each type maps directly to the{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">type</code> property in the schema.
            </Prose>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FIELD_TYPES_DATA.map((ft) => (
                <div
                  key={ft.type}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <span
                    className={`inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md mb-2 ${ft.color}`}
                  >
                    {ft.type}
                  </span>
                  <p className="text-xs text-zinc-300 font-medium leading-snug mb-1">{ft.desc}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">{ft.keyProps}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ─ Async Options ─ */}
          <Section
            id="doc-async-options"
            accentColor="text-emerald-400"
            accentLabel="Dynamic Data"
            title="Async Options"
          >
            <Prose>
              Populate select, radio, or checkbox-group fields dynamically by setting an{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">apiEndpoint</code>.
              Use <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">dependsOn</code> to refetch options when another field changes — perfect for cascading selects like country → state.
            </Prose>
            <CodeBlock code={ASYNC_OPTIONS_CODE} label="typescript" />
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                { prop: "apiEndpoint", desc: "URL to fetch. Must return an array of { label, value } objects." },
                { prop: "dependsOn",   desc: "Name of another field. When it changes, the endpoint is re-fetched with the new value as a query parameter." },
              ].map((r) => (
                <div key={r.prop} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <code className="text-emerald-300 font-mono text-xs">{r.prop}</code>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ─ Conditional Fields ─ */}
          <Section
            id="doc-conditional"
            accentColor="text-amber-400"
            accentLabel="Logic"
            title="Conditional Fields"
          >
            <Prose>
              Show or hide any field based on the current form values using{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">visibleWhen</code>.
              Conditions support AND/OR logic with 6 operators:{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">equals</code>,{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">notEquals</code>,{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">in</code>,{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">notIn</code>,{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">exists</code>, and{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">notExists</code>.
              Uses <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">useWatch</code> internally — zero overhead for unrelated fields.
            </Prose>
            <CodeBlock code={CONDITIONAL_CODE} label="typescript" />
          </Section>

          {/* ─ Field Array ─ */}
          <Section
            id="doc-field-array"
            accentColor="text-rose-400"
            accentLabel="Repeater"
            title="Field Array"
          >
            <Prose>
              The <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">fieldArray</code> type
              renders a dynamic list of grouped sub-fields. Users can add and remove rows at runtime.
              Child field values are namespaced under the array field name.
            </Prose>
            <CodeBlock code={FIELD_ARRAY_CODE} label="typescript" />
          </Section>

          {/* ─ Grid Layout ─ */}
          <Section
            id="doc-grid-layout"
            accentColor="text-sky-400"
            accentLabel="Layout"
            title="Grid Layout"
          >
            <Prose>
              Control the number of columns with the <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">columns</code> prop on{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
              Individual fields can span multiple columns with{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">colSpan</code> or take the full row width with{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">fullWidth</code>.
            </Prose>
            <CodeBlock code={GRID_LAYOUT_CODE} label="tsx" />
          </Section>

          {/* ─ Validation ─ */}
          <Section
            id="doc-validation"
            accentColor="text-orange-400"
            accentLabel="Constraints"
            title="Validation"
          >
            <Prose>
              Each field accepts a{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">validation</code> object
              with <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">minLength</code>,{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">maxLength</code>,{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">pattern</code>, and{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">custom</code> rules.
              Each rule accepts either a value or a <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">{"{ value, message }"}</code> object for custom error messages.
            </Prose>
            <CodeBlock code={VALIDATION_CODE} label="typescript" />
          </Section>

          {/* ─ FormTheme ─ */}
          <Section
            id="doc-form-theme"
            accentColor="text-cyan-400"
            accentLabel="Theming"
            title="FormTheme"
          >
            <Prose>
              Pass a <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">theme</code> prop to inject
              CSS class names into every form element. Set{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">unstyled: true</code> to strip
              all built-in styles, giving you full control over appearance.
            </Prose>
            <CodeBlock code={FORM_THEME_CODE} label="tsx" />
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Theme Slots</p>
              <PropsTable rows={FORM_THEME_SLOTS} />
            </div>
          </Section>

          {/* ─ Wizard ─ */}
          <Section
            id="doc-wizard"
            accentColor="text-purple-400"
            accentLabel="Multi-Step"
            title="Multi-Step Wizard"
          >
            <Prose>
              Use the <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">FormWizard</code> component
              to split long forms into labeled steps. Each step validates independently before advancing.
              The final step triggers{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">onSubmit</code> with the merged data from all steps.
            </Prose>
            <CodeBlock code={WIZARD_CODE} label="tsx" />
          </Section>

          {/* ─ Programmatic Control ─ */}
          <Section
            id="doc-programmatic"
            accentColor="text-pink-400"
            accentLabel="Imperative API"
            title="Programmatic Control"
          >
            <Prose>
              Attach a{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">formRef</code> typed as{" "}
              <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">Ref&lt;DynamicFormHandle&gt;</code>{" "}
              to access the full imperative API: set values, trigger validation, reset state, and read current values from outside the component tree.
            </Prose>
            <CodeBlock code={PROGRAMMATIC_CODE} label="tsx" />
          </Section>

          {/* ─ API Reference ─ */}
          <Section
            id="doc-api-reference"
            accentColor="text-blue-400"
            accentLabel="API"
            title="API Reference"
          >
            <Prose>
              Complete list of props accepted by <code className="text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
            </Prose>
            <PropsTable rows={API_PROPS_ROWS} />
          </Section>

          {/* Bottom pad */}
          <div className="h-16" />
        </main>
      </div>
    </div>
  );
}
