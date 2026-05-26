import React, { useState } from "react";
import { DynamicForm } from "@oqlet/react-fill";
import type { FormFieldSchema, FormTheme } from "@oqlet/react-fill";
// @ts-ignore
import SyntaxHighlighter from "react-syntax-highlighter";
// @ts-ignore
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const darkTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5",
  inputClass:
    "w-full bg-zinc-800/70 border border-zinc-700/70 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/40 transition-all",
  inputErrorClass: "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/30",
  errorClass: "mt-1.5 text-xs text-red-400",
  helpTextClass: "mt-1 text-xs text-zinc-500",
  requiredMarkClass: "text-red-400 ml-0.5",
  radioGroupClass: "flex flex-wrap gap-3 mt-1",
  optionWrapperClass: "flex items-center gap-2 text-sm text-zinc-300",
  checkboxGroupClass: "flex items-center gap-2 mt-1 text-sm text-zinc-300",
  submitButtonClass:
    "w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20",
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

export default function Demo() {
  const [activeTab, setActiveTab] = useState<Tab>("schema");
  const [result, setResult] = useState<object | null>(null);

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

  const langMap: Record<Tab, string> = {
    schema: "typescript",
    usage: "tsx",
    result: "json",
  };

  return (
    <section id="demo" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Live Demo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
            See it in action
          </h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
            The form below is rendered entirely from the schema on the left.
            Check the checkbox to see conditional fields appear.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          {/* Code panel */}
          <div className="bg-zinc-950 flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "px-4 py-3 text-xs font-mono transition-colors",
                    activeTab === tab.id
                      ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-950/60"
                      : "text-zinc-500 hover:text-zinc-300",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
              {/* window dots */}
              <div className="ml-auto flex items-center gap-1.5 pr-4">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-auto text-[13px] leading-relaxed" style={{ maxHeight: 540 }}>
              <SyntaxHighlighter
                language={langMap[activeTab]}
                style={atomDark}
                customStyle={{
                  margin: 0,
                  padding: "1.25rem 1rem",
                  background: "transparent",
                  fontSize: "0.8rem",
                  lineHeight: "1.7",
                  minHeight: "100%",
                }}
                showLineNumbers={activeTab !== "result"}
                lineNumberStyle={{ color: "#3f3f46", minWidth: "2.5em" }}
              >
                {codeMap[activeTab]}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Live form panel */}
          <div className="bg-zinc-900/40 border-l border-zinc-800 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-zinc-500 font-mono">live preview</span>
            </div>
            <div className="flex-1 overflow-auto" style={{ maxHeight: 500 }}>
              <DynamicForm
                schema={demoSchema}
                onSubmit={handleSubmit}
                theme={darkTheme}
                defaultValues={{ role: "developer" }}
                submitLabel="Submit →"
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Try checking "Notify me" — the frequency field appears via{" "}
          <code className="text-zinc-400">visibleWhen</code>
        </p>
      </div>
    </section>
  );
}
