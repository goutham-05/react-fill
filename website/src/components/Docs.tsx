import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../ThemeContext";

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

function HighlightLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#")) {
    return <span className="text-gray-500 dark:text-zinc-600 italic">{line}</span>;
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
          <span className="table-cell pr-5 text-gray-400 dark:text-zinc-700 select-none text-right w-8 text-[0.75rem]">
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
    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group mt-4">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60">
          <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase tracking-widest">{label}</span>
          <button
            onClick={copy}
            className="text-[10px] font-mono text-gray-500 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700"
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      )}
      {!label && (
        <button
          onClick={copy}
          className="absolute top-3 right-3 text-[10px] font-mono text-gray-500 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors px-2 py-0.5 rounded bg-gray-100/80 dark:bg-zinc-800/80 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 opacity-0 group-hover:opacity-100"
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

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-[10px] font-mono text-gray-500 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

// ─── Prose ────────────────────────────────────────────────────────────────────

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl">{children}</p>
  );
}

// ─── Props table ─────────────────────────────────────────────────────────────

function PropsTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="overflow-x-auto mt-4 rounded-xl border border-gray-200 dark:border-zinc-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">Prop</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">Type</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">Default</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([prop, type, def, desc], i) => (
            <tr key={prop} className={i % 2 === 0 ? "bg-white/40 dark:bg-zinc-950/40" : "bg-gray-50/20 dark:bg-zinc-900/20"}>
              <td className="px-4 py-2.5 font-mono text-blue-600 dark:text-blue-300 text-xs whitespace-nowrap">{prop}</td>
              <td className="px-4 py-2.5 font-mono text-amber-600/80 dark:text-amber-300/80 text-xs whitespace-nowrap">{type}</td>
              <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-zinc-500 text-xs whitespace-nowrap">{def}</td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-zinc-400 text-xs">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Field types grid ─────────────────────────────────────────────────────────

const FIELD_TYPES_DATA = [
  { type: "text",        color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",       desc: "Single-line text input",                 keyProps: "placeholder, validation" },
  { type: "email",       color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",           desc: "Email input with format hint",           keyProps: "placeholder, validation.pattern" },
  { type: "number",      color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",   desc: "Numeric input with range control",       keyProps: "min, max, step" },
  { type: "textarea",    color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",desc: "Multi-line text area",                  keyProps: "rows, showWordCount" },
  { type: "select",      color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",   desc: "Dropdown select list",                   keyProps: "options, apiEndpoint, dependsOn" },
  { type: "multiselect", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300", desc: "Searchable multi-value dropdown",  keyProps: "options, getOptions, apiEndpoint" },
  { type: "radio",       color: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",       desc: "Radio button group",                     keyProps: "options, inline" },
  { type: "checkbox",    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",       desc: "Single checkbox or multi-group",         keyProps: "options (multi-group)" },
  { type: "date",        color: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",       desc: "Native date picker",                     keyProps: "min, max" },
  { type: "time",        color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",       desc: "Time-of-day picker (HH:MM)",             keyProps: "min, max, step" },
  { type: "datetime",    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",desc: "Date + time picker (datetime-local)",   keyProps: "min, max, step" },
  { type: "file",        color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",desc: "File upload input",                     keyProps: "accept, multiple" },
  { type: "slider",      color: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",       desc: "Range slider with numeric output",       keyProps: "min, max, step" },
  { type: "rating",      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",desc: "Star rating input",                    keyProps: "starCount" },
  { type: "fieldArray",  color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",       desc: "Dynamic repeater rows",                  keyProps: "children, addButtonLabel" },
  { type: "group",       color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",desc: "Logical fieldset group",               keyProps: "children" },
  { type: "multiField",  color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",desc: "Inline multi-part field",         keyProps: "multipleField, flex" },
  { type: "FormWizard",  color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",desc: "Multi-step wizard (top-level component, not a field type)", keyProps: "steps, onSubmit" },
];

// ─── Per-type schema snippets ─────────────────────────────────────────────────

const FIELD_TYPE_SNIPPETS: Record<string, string> = {
  text: `{
  name: "fullName",
  label: "Full Name",
  type: "text",
  required: true,
  placeholder: "Jane Smith",
  helpText: "Enter your legal full name",
}`,
  email: `{
  name: "email",
  label: "Email Address",
  type: "email",
  required: true,
  placeholder: "jane@example.com",
  validation: {
    pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email format" },
  },
}`,
  number: `{
  name: "age",
  label: "Age",
  type: "number",
  min: 0,
  max: 120,
  step: 1,
  placeholder: "25",
}`,
  textarea: `{
  name: "bio",
  label: "Bio",
  type: "textarea",
  rows: 4,
  showWordCount: true,
  placeholder: "Tell us about yourself…",
  validation: { maxLength: { value: 300, message: "Max 300 characters" } },
}`,
  select: `{
  name: "country",
  label: "Country",
  type: "select",
  required: true,
  options: [
    { label: "United States",  value: "us" },
    { label: "Canada",         value: "ca" },
    { label: "United Kingdom", value: "uk" },
  ],
}`,
  multiselect: `{
  name: "skills",
  label: "Skills",
  type: "multiselect",
  options: [
    { label: "React",      value: "react" },
    { label: "TypeScript", value: "ts" },
    { label: "Node.js",    value: "node" },
    { label: "GraphQL",    value: "gql" },
  ],
  // or load from an API:
  // getOptions: () => fetch("/api/skills").then(r => r.json()),
}`,
  radio: `{
  name: "plan",
  label: "Plan",
  type: "radio",
  required: true,
  options: [
    { label: "Free",       value: "free" },
    { label: "Pro",        value: "pro" },
    { label: "Enterprise", value: "enterprise" },
  ],
}`,
  checkbox: `// Single checkbox:
{
  name: "terms",
  label: "I agree to the Terms of Service",
  type: "checkbox",
  required: true,
}

// Checkbox group (options array):
{
  name: "interests",
  label: "Interests",
  type: "checkbox",
  options: [
    { label: "Design",      value: "design" },
    { label: "Engineering", value: "eng" },
    { label: "Marketing",   value: "mkt" },
  ],
}`,
  date: `{
  name: "dob",
  label: "Date of Birth",
  type: "date",
  min: "1900-01-01",
  max: "2025-12-31",
  required: true,
}`,
  time: `{
  name: "startTime",
  label: "Start Time",
  type: "time",
  min: "09:00",
  max: "17:00",
  step: 900,  // 15-minute increments
}`,
  datetime: `{
  name: "appointment",
  label: "Appointment",
  type: "datetime",
  min: "2025-01-01T09:00",
  max: "2025-12-31T17:00",
  step: 1800,  // 30-minute increments
}`,
  file: `{
  name: "resume",
  label: "Resume",
  type: "file",
  accept: ".pdf,.doc,.docx",
  multiple: false,
  required: true,
}`,
  slider: `{
  name: "volume",
  label: "Volume",
  type: "slider",
  min: 0,
  max: 100,
  step: 5,
  defaultValue: 50,
  showSliderValue: true,
}`,
  rating: `{
  name: "rating",
  label: "Overall Rating",
  type: "rating",
  starCount: 5,
  required: true,
}`,
  fieldArray: `{
  name: "contacts",
  label: "Emergency Contacts",
  type: "fieldArray",
  addButtonLabel: "+ Add Contact",
  removeButtonLabel: "Remove",
  children: [
    { name: "name",  label: "Full Name",    type: "text", required: true },
    { name: "phone", label: "Phone Number", type: "text" },
    {
      name: "rel",
      label: "Relationship",
      type: "select",
      options: [
        { label: "Parent", value: "parent" },
        { label: "Spouse", value: "spouse" },
        { label: "Friend", value: "friend" },
      ],
    },
  ],
}`,
  group: `{
  name: "address",
  label: "Address",
  type: "group",
  children: [
    { name: "street", label: "Street",   type: "text", fullWidth: true },
    { name: "city",   label: "City",     type: "text" },
    { name: "zip",    label: "ZIP Code", type: "text" },
  ],
}`,
  multiField: `{
  name: "name",
  label: "Full Name",
  type: "multiField",
  multipleField: [
    { name: "firstName", label: "First Name", type: "text", flex: 1 },
    { name: "lastName",  label: "Last Name",  type: "text", flex: 1 },
  ],
}`,
  FormWizard: `import { FormWizard } from "@oqlet/react-fill";
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
    ],
  },
];

export default function SignupWizard() {
  return <FormWizard steps={steps} onSubmit={(data) => console.log(data)} />;
}`,
};

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
    name: "plan",
    label: "Plan",
    type: "select",
    options: [
      { label: "Free",       value: "free" },
      { label: "Pro",        value: "pro" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    name: "promoCode",
    label: "Promo Code",
    type: "text",
    placeholder: "Enter code…",
    // Show only when plan is "pro" or "enterprise"
    visibleWhen: {
      logic: "OR",
      conditions: [
        { field: "plan", operator: "in", value: ["pro", "enterprise"] },
      ],
    },
  },
  {
    name: "billingName",
    label: "Billing Name",
    type: "text",
    // Required only when plan is paid
    requiredWhen: {
      conditions: [{ field: "plan", operator: "notEquals", value: "free" }],
    },
  },
  {
    name: "trialDays",
    label: "Trial Days",
    type: "number",
    defaultValue: 14,
    // Disabled (read-only) when plan is "enterprise"
    disabledWhen: {
      conditions: [{ field: "plan", operator: "equals", value: "enterprise" }],
    },
  },
];

// All three conditionals share the same ConditionConfig shape:
// { logic?: "AND" | "OR", conditions: [{ field, operator, value }] }
// Operators: equals | notEquals | in | notIn | exists | notExists`;

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
      validate: (value) =>
        value !== "admin" || "Username 'admin' is reserved",
    },
  },
];`;

const ERROR_SUMMARY_CODE = `// Show a banner listing all validation errors after a failed submit attempt.
// Uses the same field messages your validation rules already define — no duplication.

<DynamicForm
  schema={schema}
  onSubmit={handleSubmit}
  showErrorSummary
  errorSummaryTitle="Please fix the following errors before submitting:"
/>

// TypeScript generic — narrow the submitted value type:
import type { DynamicFormHandle } from "@oqlet/react-fill";

interface SignupValues {
  email: string;
  password: string;
  confirmPassword: string;
}

<DynamicForm<SignupValues>
  schema={schema}
  onSubmit={(values) => {
    // values is typed as SignupValues — no casting needed
    createAccount(values.email, values.password);
  }}
  showErrorSummary
/>`;

const FORM_THEME_CODE = `import { DynamicForm } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";

// ── 1. Class name slots (CSS framework integration) ──────────────────
const tailwindTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
  inputErrorClass: "border-red-500 focus:ring-red-500",
  errorClass: "mt-1 text-xs text-red-600",
  requiredMarkClass: "text-red-500 ml-0.5",
  submitButtonClass: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
};

// ── 2. Inline style defaults (design system tokens) ──────────────────
const dsTheme: FormTheme = {
  inputStyle:   { borderWidth: "1.5px", borderColor: "#6B748E", borderRadius: "8px", height: "48px" },
  labelStyle:   { fontWeight: 600, fontSize: "16px", color: "#000" },
  wrapperStyle: { marginBottom: "1.25rem" },
};

// ── 3. Component registry (swap built-in renderers by type) ──────────
const registryTheme: FormTheme = {
  components: {
    date:   MyDatePickerField,   // replaces every date field
    select: MyReactSelectField,  // replaces every select field
  },
};

<DynamicForm schema={schema} theme={tailwindTheme} onSubmit={fn} />`;

const DESIGN_SYSTEM_TAILWIND_CODE = `import type { FormTheme } from "@oqlet/react-fill";

// ── inputClass applies to text/email/number/textarea/select/date/file/slider ──
// ── radioInputClass replaces inputClass for every radio <input> ───────────────
// ── checkboxInputClass replaces inputClass for every checkbox <input> ─────────
const theme: FormTheme = {
  unstyled: true,         // strip all library defaults — CSS framework takes over

  wrapperClass:       "mb-4",
  labelClass:         "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1",
  requiredMarkClass:  "text-red-500 ml-0.5",

  // text-type inputs only (w-full, border, padding, etc.)
  inputClass:
    "w-full rounded-md border border-gray-300 dark:border-zinc-700 " +
    "bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 " +
    "placeholder-gray-400 dark:placeholder-zinc-500 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
  inputErrorClass:    "border-red-500 focus:ring-red-500",

  // toggle inputs — keep them small, w-full must NOT appear here
  radioInputClass:    "h-4 w-4 cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25",
  checkboxInputClass: "h-4 w-4 cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25",

  radioGroupClass:    "flex flex-col gap-2 mt-1",
  checkboxGroupClass: "mt-1",
  optionWrapperClass: "flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300",

  errorClass:         "mt-1 text-xs text-red-500",
  helpTextClass:      "mt-1 text-xs text-gray-500 dark:text-zinc-400",

  submitButtonClass:
    "mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors",
};`;

const DESIGN_SYSTEM_CHECKBOX_CODE = `// Checkbox labels: two separate slots
//   label         → text shown inside the <span> next to the checkbox input
//   checkboxLabel → text shown in the <label> element ABOVE the field (like a section header)
//                   set to "" to suppress the top label entirely

const schema: FormFieldSchema[] = [
  {
    name: "terms",
    type: "checkbox",
    // Top label (section header above the input): not shown
    checkboxLabel: "",
    // Text next to the checkbox input:
    label: "I agree to the Terms of Service",
    required: true,
  },
  {
    name: "preferences",
    type: "checkbox",
    checkboxLabel: "Notifications",   // shown above the group as a section header
    options: [
      { label: "Email updates",  value: "email"  },
      { label: "SMS alerts",     value: "sms"    },
      { label: "Browser push",   value: "push"   },
    ],
  },
];`;

const DESIGN_SYSTEM_MUI_CODE = `import { TextField as MuiTextField } from "@mui/material";
import type { FieldComponentProps, FormTheme } from "@oqlet/react-fill";
import { useFormContext, useController } from "react-hook-form";

// Custom renderer for text/email/number inputs using MUI TextField
function MuiTextInput({ field, name, error }: FieldComponentProps) {
  const { control } = useFormContext();
  const { field: ctrl, fieldState } = useController({ name, control,
    rules: { required: field.required },
  });
  return (
    <MuiTextField
      {...ctrl}
      label={field.label}
      type={field.type}
      placeholder={field.placeholder}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
      fullWidth
      size="small"
      required={field.required}
    />
  );
}

// Register the custom renderer at the theme level — no per-field boilerplate
const muiTheme: FormTheme = {
  unstyled: true,
  components: {
    text:   MuiTextInput,
    email:  MuiTextInput,
    number: MuiTextInput,
  },
};

// All text / email / number fields now render as MUI TextFields automatically
<DynamicForm schema={schema} theme={muiTheme} onSubmit={fn} />`;

const TREE_SHAKING_CODE = `// Default — all 15 field types shipped (fine for most apps)
import { DynamicForm } from "@oqlet/react-fill";

// Tree-shaken — only import the field types you actually use
import {
  DynamicForm,
  TextField,
  SelectField,
  CheckboxField,
  type FieldRegistry,
} from "@oqlet/react-fill";

const registry: FieldRegistry = {
  text:     TextField,
  email:    TextField,   // TextField handles both
  select:   SelectField,
  checkbox: CheckboxField,
};

// Bundler drops the other 11 field types automatically
<DynamicForm fieldRegistry={registry} schema={schema} onSubmit={fn} />`;

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
  ["showReset",         "boolean",                "false",        "Show a reset button next to submit"],
  ["onReset",           "() => void",             "—",            "Callback when reset button is clicked"],
  ["fieldRegistry",     "FieldRegistry",          "all built-ins","Map of field type → component; pass a subset to tree-shake unused field types"],
  ["formLabel",         "string",                 "—",            "aria-label on the <form> — recommended when multiple forms are on one page"],
];

const FORM_THEME_SLOTS: [string, string, string, string][] = [
  // ─ Field wrapper & label
  ["wrapperClass",        "string",        "—", "Outer wrapper div for each field"],
  ["labelClass",          "string",        "—", "The <label> element above each field"],
  ["requiredMarkClass",   "string",        "—", "The asterisk (*) appended to required labels"],
  // ─ Text-type inputs
  ["inputClass",          "string",        "—", "Applied to text / email / number / textarea / select / date / file / slider inputs. NOT applied to radio or checkbox — use the dedicated slots below."],
  ["inputErrorClass",     "string",        "—", "Appended to inputClass when the field has a validation error"],
  // ─ Toggle inputs (radio / checkbox)
  ["radioInputClass",     "string",        "—", "Applied to each radio <input>. When set, replaces inputClass for radio inputs — keeps toggle styling independent of text inputs."],
  ["checkboxInputClass",  "string",        "—", "Applied to each checkbox <input>. When set, replaces inputClass for checkbox inputs."],
  ["radioGroupClass",     "string",        "—", "Wrapper div around all radio options"],
  ["checkboxGroupClass",  "string",        "—", "Wrapper div around all checkbox options"],
  ["optionWrapperClass",  "string",        "—", "Wrapper around each individual radio / checkbox option (input + label)"],
  // ─ Feedback
  ["errorClass",          "string",        "—", "Validation error message element"],
  ["helpTextClass",       "string",        "—", "Help text shown below the input"],
  // ─ Buttons
  ["submitButtonClass",   "string",        "—", "Submit button"],
  ["resetButtonClass",    "string",        "—", "Reset button (when showReset is true)"],
  ["extraButtonClass",    "string",        "—", "Any extra buttons rendered via the extraButtons prop"],
  // ─ Layout & wizard
  ["groupLayoutClass",    "string",        "—", "Inner grid/flex wrapper inside a group or fieldArray field"],
  ["wizardClass",         "string",        "—", "Root wrapper of the FormWizard component"],
  ["stepperClass",        "string",        "—", "Step indicator bar inside FormWizard"],
  ["navigationClass",     "string",        "—", "Prev / Next button row inside FormWizard"],
  // ─ Inline styles (design-token bridge)
  ["inputStyle",          "CSSProperties", "—", "Inline style applied to every input — merged under per-field inputStyle. Useful for design-system tokens (border radius, height, colors)."],
  ["labelStyle",          "CSSProperties", "—", "Inline style for every label element"],
  ["wrapperStyle",        "CSSProperties", "—", "Inline style for every field wrapper div"],
  ["errorStyle",          "CSSProperties", "—", "Inline style for error messages"],
  ["helpTextStyle",       "CSSProperties", "—", "Inline style for help text"],
  // ─ Component registry
  ["components",          "Record<FieldType, FC>", "—", "Swap any built-in renderer with your own component — e.g. { date: MyDatePicker, select: MyComboBox }"],
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
  { id: "doc-error-summary",  label: "Error Summary" },
  { id: "doc-form-theme",       label: "FormTheme" },
  { id: "doc-design-system",   label: "Design System Guide" },
  { id: "doc-tree-shaking",    label: "Tree-shaking" },
  { id: "doc-wizard",         label: "Multi-Step Wizard" },
  { id: "doc-programmatic",   label: "Programmatic Control" },
  { id: "doc-api-reference",  label: "API Reference" },
];

// ─── Theme Toggle Button ──────────────────────────────────────────────────────

function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeId }: { activeId: string }) {
  return (
    <nav className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-600 px-2 mb-3">Contents</p>
      {TOC_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={[
            "block px-2 py-1 rounded-md text-xs transition-all leading-snug",
            activeId === item.id
              ? "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 font-medium"
              : "text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100/60 dark:hover:bg-zinc-800/60",
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
  const [selectedFieldType, setSelectedFieldType] = useState<string>("text");
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
    <div className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans min-h-screen flex flex-col">
      {/* ─ Top bar ─ */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-4 sm:px-6 h-14 border-b border-gray-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back</span>
        </button>
        <div className="w-px h-5 bg-gray-200 dark:bg-zinc-800" />
        <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Documentation</span>
        <div className="flex-1" />
        <a
          href="https://github.com/goutham-05/react-fill"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors hidden sm:block"
        >
          GitHub →
        </a>
        <ThemeToggleButton />
      </header>

      {/* ─ Mobile chips row ─ */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-gray-200/60 dark:border-zinc-800/60 bg-gray-50/40 dark:bg-zinc-900/40 flex-shrink-0 scrollbar-none">
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
                ? "bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-400/50 dark:border-blue-500/30"
                : "text-gray-500 dark:text-zinc-500 bg-gray-100/60 dark:bg-zinc-800/60 border border-gray-300/50 dark:border-zinc-700/50 hover:text-gray-700 dark:hover:text-zinc-200",
            ].join(" ")}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* ─ Body ─ */}
      <div className="flex flex-1 min-h-0">
        {/* Fixed sidebar — hidden on mobile */}
        <aside className="hidden sm:block w-40 flex-shrink-0 sticky top-14 self-start pt-8 pb-8 pl-3 pr-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Sidebar activeId={activeId} />
        </aside>

        {/* Main scrollable content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-10"
        >
          {/* ─ Quick Start ─ */}
          <Section
            id="doc-quick-start"
            accentColor="text-blue-600 dark:text-blue-400"
            accentLabel="Getting Started"
            title="Quick Start"
          >
            <Prose>
              Install the package and its three peer dependencies — React, ReactDOM, and React Hook Form — then define a field schema and pass it to{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
              No configuration needed beyond the schema.
            </Prose>
            <CodeBlock code={QUICK_START_CODE} label="typescript" />
          </Section>

          {/* ─ Field Types ─ */}
          <Section
            id="doc-field-types"
            accentColor="text-violet-600 dark:text-violet-400"
            accentLabel="Reference"
            title="Field Types"
          >
            <Prose>
              ReactFill supports 18 field types out of the box. Each type maps directly to the{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">type</code>{" "}
              property in the schema. Click any type to see a ready-to-copy example.
            </Prose>

            <div className="mt-4 flex flex-col lg:flex-row gap-5 items-start">
              {/* ── Card grid — 3 cols, panel takes remaining space ── */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {FIELD_TYPES_DATA.map((ft) => {
                    const isSelected = selectedFieldType === ft.type;
                    return (
                      <button
                        key={ft.type}
                        type="button"
                        onClick={() => setSelectedFieldType(ft.type)}
                        className={[
                          "p-3.5 rounded-xl text-left transition-all border",
                          isSelected
                            ? "bg-white dark:bg-zinc-900 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/40 dark:ring-blue-500/30 shadow-sm"
                            : "bg-gray-50/60 dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900",
                        ].join(" ")}
                      >
                        <span className={`inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md mb-2 ${ft.color}`}>
                          {ft.type}
                        </span>
                        <p className="text-xs text-gray-700 dark:text-zinc-300 font-medium leading-snug mb-1">{ft.desc}</p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-600 font-mono">{ft.keyProps}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Sticky snippet panel — always visible, defaults to "text" ── */}
              <div className="w-full lg:w-[480px] lg:flex-shrink-0 lg:sticky lg:top-4">
                <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-widest">typescript</span>
                      <span className="text-gray-300 dark:text-zinc-700">·</span>
                      <code className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-300">{selectedFieldType}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-600 hidden sm:block">← select a type</span>
                      <CopyButton code={FIELD_TYPE_SNIPPETS[selectedFieldType] ?? ""} />
                    </div>
                  </div>
                  <pre className="p-4 font-mono text-[0.75rem] leading-relaxed overflow-auto max-h-[60vh]">
                    <SimpleHighlight code={FIELD_TYPE_SNIPPETS[selectedFieldType] ?? ""} />
                  </pre>
                </div>
              </div>
            </div>
          </Section>

          {/* ─ Async Options ─ */}
          <Section
            id="doc-async-options"
            accentColor="text-emerald-600 dark:text-emerald-400"
            accentLabel="Dynamic Data"
            title="Async Options"
          >
            <Prose>
              Populate select, radio, or checkbox-group fields dynamically by setting an{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">apiEndpoint</code>.
              Use <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">dependsOn</code> to refetch options when another field changes — perfect for cascading selects like country → state.
            </Prose>
            <CodeBlock code={ASYNC_OPTIONS_CODE} label="typescript" />
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                { prop: "apiEndpoint", desc: "URL to fetch. Must return an array of { label, value } objects." },
                { prop: "dependsOn",   desc: "Field name (or array of names) to watch. When any watched field changes, the endpoint is re-fetched and getOptions is called with the new value(s)." },
                { prop: "getOptions",  desc: "Sync or async function. Receives the dependsOn value (or { [field]: value } object for arrays). Returns { label, value }[]." },
              ].map((r) => (
                <div key={r.prop} className="p-3.5 rounded-xl bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800">
                  <code className="text-emerald-600 dark:text-emerald-300 font-mono text-xs">{r.prop}</code>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ─ Conditional Fields ─ */}
          <Section
            id="doc-conditional"
            accentColor="text-amber-600 dark:text-amber-400"
            accentLabel="Logic"
            title="Conditional Fields"
          >
            <Prose>
              Three props control field behavior conditionally — all accept the same{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">ConditionConfig</code> shape:
            </Prose>
            <div className="mt-4 grid sm:grid-cols-3 gap-3 mb-4">
              {[
                { prop: "visibleWhen", color: "text-amber-600 dark:text-amber-300", desc: "Show the field only when conditions are met. Hidden fields have their value cleared (unless preserveValue: true)." },
                { prop: "requiredWhen", color: "text-red-600 dark:text-red-300", desc: "Make the field required only when conditions are met. Combines with required: true via OR." },
                { prop: "disabledWhen", color: "text-gray-600 dark:text-zinc-400", desc: "Disable the field when conditions are met. Combines with disabled: true via OR." },
              ].map((r) => (
                <div key={r.prop} className="p-3.5 rounded-xl bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800">
                  <code className={`font-mono text-xs font-semibold ${r.color}`}>{r.prop}</code>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
            <Prose>
              Conditions support <strong className="text-gray-700 dark:text-zinc-300">AND/OR</strong> logic with 6 operators:{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">equals</code>,{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">notEquals</code>,{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">in</code>,{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">notIn</code>,{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">exists</code>, and{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">notExists</code>.
              A single{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">useWatch</code> subscription covers all three props — zero overhead for unrelated fields.
            </Prose>
            <CodeBlock code={CONDITIONAL_CODE} label="typescript" />
          </Section>

          {/* ─ Field Array ─ */}
          <Section
            id="doc-field-array"
            accentColor="text-rose-600 dark:text-rose-400"
            accentLabel="Repeater"
            title="Field Array"
          >
            <Prose>
              The <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">fieldArray</code> type
              renders a dynamic list of grouped sub-fields. Users can add and remove rows at runtime.
              Child field values are namespaced under the array field name.
            </Prose>
            <CodeBlock code={FIELD_ARRAY_CODE} label="typescript" />
          </Section>

          {/* ─ Grid Layout ─ */}
          <Section
            id="doc-grid-layout"
            accentColor="text-sky-600 dark:text-sky-400"
            accentLabel="Layout"
            title="Grid Layout"
          >
            <Prose>
              Control the number of columns with the <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">columns</code> prop on{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
              Individual fields can span multiple columns with{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">colSpan</code> or take the full row width with{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">fullWidth</code>.
            </Prose>
            <CodeBlock code={GRID_LAYOUT_CODE} label="tsx" />
          </Section>

          {/* ─ Validation ─ */}
          <Section
            id="doc-validation"
            accentColor="text-orange-600 dark:text-orange-400"
            accentLabel="Constraints"
            title="Validation"
          >
            <Prose>
              Each field accepts a{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">validation</code> object
              with <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">minLength</code>,{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">maxLength</code>,{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">pattern</code>, and{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">custom</code> rules.
              Each rule accepts either a value or a <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">{"{ value, message }"}</code> object for custom error messages.
            </Prose>
            <CodeBlock code={VALIDATION_CODE} label="typescript" />
          </Section>

          {/* ─ Error Summary ─ */}
          <Section
            id="doc-error-summary"
            accentColor="text-red-600 dark:text-red-400"
            accentLabel="UX"
            title="Error Summary &amp; TypeScript Generics"
          >
            <Prose>
              Add{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">showErrorSummary</code>{" "}
              to display a validation error banner above the submit button after a failed submit attempt.
              The banner is hidden on the first render and only appears after the user clicks submit —
              it flattens all field errors (including nested group/fieldArray errors) into a single list,
              reusing the same messages your validation rules already define.
            </Prose>
            <Prose>
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code> is now generic:{" "}
              pass a type argument to get fully typed{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">onSubmit</code> values with no casting.
            </Prose>
            <CodeBlock code={ERROR_SUMMARY_CODE} label="tsx" />
          </Section>

          {/* ─ FormTheme ─ */}
          <Section
            id="doc-form-theme"
            accentColor="text-cyan-600 dark:text-cyan-400"
            accentLabel="Theming"
            title="FormTheme"
          >
            <Prose>
              The <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">theme</code> prop gives you three independent controls applied from one place:{" "}
              <strong className="text-gray-700 dark:text-zinc-300">class name slots</strong> for CSS framework integration,{" "}
              <strong className="text-gray-700 dark:text-zinc-300">inline style defaults</strong> for design-system tokens, and a{" "}
              <strong className="text-gray-700 dark:text-zinc-300">component registry</strong> to swap built-in renderers by type.
              Set <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">unstyled: true</code> to strip all library defaults.
            </Prose>
            <CodeBlock code={FORM_THEME_CODE} label="tsx" />
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3">Theme Slots &amp; Style Props</p>
              <PropsTable rows={FORM_THEME_SLOTS} />
            </div>
          </Section>

          {/* ─ Design System Guide ─ */}
          <Section
            id="doc-design-system"
            accentColor="text-teal-600 dark:text-teal-400"
            accentLabel="Integration"
            title="Design System Guide"
          >
            <Prose>
              This guide covers the three most common integration patterns: Tailwind CSS class-name slots,
              design-system inline-style tokens, and fully custom renderers via the component registry.
              No limitations — every visual aspect of the form is overridable.
            </Prose>

            {/* ── Tailwind / CSS framework ── */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">
                1 — Tailwind CSS (class-name slots)
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-0">
                Set{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">unstyled: true</code>{" "}
                to strip all built-in inline styles, then apply your own classes through the theme slots.
                The key separation: <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">inputClass</code> is
                for text-type inputs only —{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">radioInputClass</code>{" "}
                and <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">checkboxInputClass</code>{" "}
                are dedicated slots that replace{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">inputClass</code>{" "}
                for toggle controls so text-input sizing classes (
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">w-full</code>,{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">px-3 py-2</code>) never bleed
                into radio/checkbox inputs.
              </p>
              <CodeBlock code={DESIGN_SYSTEM_TAILWIND_CODE} label="theme.ts" />
            </div>

            {/* ── Checkbox label slots ── */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">
                2 — Checkbox label slots
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                The checkbox field has two label slots. <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">label</code> appears
                as the text next to the checkbox input.{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">checkboxLabel</code> is an optional section
                header rendered above the field — set it to{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">""</code>{" "}
                to suppress the header when you only need the inline label.
                For checkbox groups (multiple options), <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">checkboxLabel</code> becomes
                the group header and <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">options[].label</code>{" "}
                drives each item's text.
              </p>
              <CodeBlock code={DESIGN_SYSTEM_CHECKBOX_CODE} label="schema.ts" />
            </div>

            {/* ── Inline styles / design tokens ── */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">
                3 — Inline style tokens (no CSS framework)
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                If you use a design-system token API (CSS-in-JS, inline styles, or a token object), use
                the <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">*Style</code> props on the theme.
                These are merged on top of built-in defaults, so you only need to specify what changes.
                Per-field <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">*Style</code>{" "}
                props always win over theme-level ones.
              </p>
              <CodeBlock
                label="theme.ts"
                code={`const dsTheme: FormTheme = {
  // No unstyled: true — library defaults still apply, these are merged on top
  inputStyle:   { borderWidth: "1.5px", borderColor: "#6B748E",
                  borderRadius: "8px",  height: "48px" },
  labelStyle:   { fontWeight: 600, fontSize: "16px", color: "#1a1a1a" },
  wrapperStyle: { marginBottom: "1.25rem" },
  errorStyle:   { color: "#c0392b", fontSize: "12px", marginTop: "4px" },
};`}
              />
            </div>

            {/* ── Component registry / MUI ── */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">
                4 — Component registry (MUI / Ant Design / headless UI)
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                Register custom renderers at the theme level using{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">theme.components</code>.
                Your component receives the same props as any built-in renderer:{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">{"{ field, name, error, register }"}</code>.
                Use React Hook Form's{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">useController</code> inside your renderer to
                connect to the form state — the library calls your component with all context already
                in scope via{" "}
                <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">FormProvider</code>.
                Per-field <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">overrideComponent</code> takes
                precedence over the theme-level registry if both are set.
              </p>
              <CodeBlock code={DESIGN_SYSTEM_MUI_CODE} label="mui-theme.tsx" />
            </div>

            {/* ── Quick callout cards ── */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                {
                  title: "unstyled: true",
                  color: "text-teal-600 dark:text-teal-400",
                  desc: "Removes all built-in inline styles so your CSS framework has full control. Theme-level *Style props still apply — they're treated as consumer intent, not library defaults.",
                },
                {
                  title: "Per-field overrides",
                  color: "text-violet-600 dark:text-violet-400",
                  desc: "Every theme class/style prop has a per-field counterpart (e.g. field.inputClass, field.wrapperStyle). Per-field always wins over the theme, so you can customize a single field without changing the theme.",
                },
                {
                  title: "radioInputClass / checkboxInputClass",
                  color: "text-blue-600 dark:text-blue-400",
                  desc: "These slots replace inputClass for their input type. Without them, inputClass would apply to radio/checkbox inputs too, forcing w-full and padding onto toggle controls.",
                },
                {
                  title: "components registry",
                  color: "text-pink-600 dark:text-pink-400",
                  desc: "Swap any built-in field renderer with your own at the theme level. No schema changes required — register once and every field of that type uses your component.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="p-3.5 rounded-xl bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800"
                >
                  <p className={`text-xs font-mono font-semibold mb-1 ${c.color}`}>{c.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ─ Tree-shaking ─ */}
          <Section
            id="doc-tree-shaking"
            accentColor="text-lime-600 dark:text-lime-400"
            accentLabel="Bundle Size"
            title="Tree-shaking"
          >
            <Prose>
              By default <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code> ships
              all 15 built-in field types. Pass a custom{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">fieldRegistry</code> to include
              only the types your project uses — the bundler drops the rest automatically.
              The package ships with <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">"sideEffects": false</code> so
              your bundler can eliminate unused field components at build time.
            </Prose>
            <CodeBlock code={TREE_SHAKING_CODE} label="tsx" />
          </Section>

          {/* ─ Wizard ─ */}
          <Section
            id="doc-wizard"
            accentColor="text-purple-600 dark:text-purple-400"
            accentLabel="Multi-Step"
            title="Multi-Step Wizard"
          >
            <Prose>
              Use the <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">FormWizard</code> component
              to split long forms into labeled steps. Each step validates independently before advancing.
              The final step triggers{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">onSubmit</code> with the merged data from all steps.
              {" "}<code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">FormWizard</code> is structural-only —
              it adds no background, shadow, or padding. Wrap it in your own container or pass{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">wizardStyle</code> to apply visual chrome.
              Accepts the same <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">theme</code> and{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">fieldRegistry</code> props as <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
            </Prose>
            <CodeBlock code={WIZARD_CODE} label="tsx" />
          </Section>

          {/* ─ Programmatic Control ─ */}
          <Section
            id="doc-programmatic"
            accentColor="text-pink-600 dark:text-pink-400"
            accentLabel="Imperative API"
            title="Programmatic Control"
          >
            <Prose>
              Attach a{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">formRef</code> typed as{" "}
              <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">Ref&lt;DynamicFormHandle&gt;</code>{" "}
              to access the full imperative API: set values, trigger validation, reset state, and read current values from outside the component tree.
            </Prose>
            <CodeBlock code={PROGRAMMATIC_CODE} label="tsx" />
          </Section>

          {/* ─ API Reference ─ */}
          <Section
            id="doc-api-reference"
            accentColor="text-blue-600 dark:text-blue-400"
            accentLabel="API"
            title="API Reference"
          >
            <Prose>
              Complete list of props accepted by <code className="text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs">DynamicForm</code>.
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
