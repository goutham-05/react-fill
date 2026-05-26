import React, { useState, useEffect } from "react";
import Demo from "./components/Demo";
import Docs from "./components/Docs";
import Playground from "./playground/Playground";
import { parseShareToken, decodeState } from "./playground/shareUrl";
import type { BuilderState } from "./playground/types";

// ─── Icons ────────────────────────────────────────────────────────────────────

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const NpmIcon = () => (
  <svg viewBox="0 0 18 7" fill="currentColor" className="w-8 h-3">
    <path d="M0 0h18v6H9V1H6v5H0zm1 5h2V1H1zm3 0h2V1H4zm8 0V1h-2v4z" />
  </svg>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onPlayground, onDocs }: { onPlayground: () => void; onDocs: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            ⬡
          </div>
          <span className="font-semibold text-sm text-zinc-100 font-mono">ReactFill</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onPlayground}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-blue-600/30 to-violet-600/30 hover:from-blue-600/50 hover:to-violet-600/50 text-blue-300 hover:text-blue-200 border border-blue-500/20 transition-all"
          >
            ✦ Playground
          </button>
          <a
            href="#demo"
            className="hidden sm:block px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/60 transition-all"
          >
            Demo
          </a>
          <button
            onClick={onDocs}
            className="hidden sm:block px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/60 transition-all"
          >
            Docs
          </button>
          <a
            href="https://www.npmjs.com/package/@oqlet/react-fill"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md transition-all border border-zinc-700/50"
            title="View on npm"
          >
            <NpmIcon />
            <span className="text-xs text-zinc-400 font-mono">v1.0.0</span>
          </a>
          <a
            href="https://github.com/goutham-05/react-fill"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md transition-all text-zinc-300 border border-zinc-700/50"
          >
            <GitHubIcon />
            <span className="text-xs hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-3 px-3 py-1 text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all font-mono border border-zinc-600/50"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function Hero({ onPlayground }: { onPlayground: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden grid-bg">
      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          v1.0.0 released — 78 tests passing
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight mb-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-zinc-100">Forms without</span>
          <br />
          <span className="gradient-text">the boilerplate.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Pass a JSON schema. Get a fully functional, accessible, CSS-framework-agnostic form.
          <br className="hidden sm:block" />
          Powered by{" "}
          <a
            href="https://react-hook-form.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            React Hook Form
          </a>
          .
        </p>

        {/* Install command */}
        <div
          className="inline-flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl px-5 py-3 mb-10 font-mono text-sm text-zinc-300 backdrop-blur-sm animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="text-zinc-600 select-none mr-2">$</span>
          <span>npm install @oqlet/react-fill</span>
          <CopyButton text="npm install @oqlet/react-fill" />
        </div>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <button
            onClick={onPlayground}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
          >
            ✦ Open Playground
          </button>
          <a
            href="#demo"
            className="px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold transition-all border border-zinc-700/60"
          >
            See Demo ↓
          </a>
          <a
            href="https://github.com/goutham-05/react-fill"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold transition-all border border-zinc-700/60 flex items-center gap-2"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { label: "Peer deps", value: "3" },
            { label: "Bundle size", value: "~13 kB" },
            { label: "Tests passing", value: "78" },
            { label: "Field types", value: "15" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm"
            >
              <span className="text-xl font-bold text-zinc-100">{stat.value}</span>
              <span className="text-xs text-zinc-500 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s" }}>
        <span className="text-xs text-zinc-600">scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-zinc-700 to-transparent" />
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "⬡",
    color: "from-blue-500 to-blue-600",
    glow: "group-hover:shadow-blue-500/20",
    title: "Schema-Driven",
    desc: "Define your entire form as a plain JSON array. No JSX markup, no repetition, no wiring up state by hand.",
  },
  {
    icon: "🎨",
    color: "from-violet-500 to-violet-600",
    glow: "group-hover:shadow-violet-500/20",
    title: "Framework Agnostic",
    desc: "Works with Tailwind, Bootstrap, MUI, or zero CSS. The FormTheme context wires your class names to every element.",
  },
  {
    icon: "⚡",
    color: "from-amber-500 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
    title: "Conditional Fields",
    desc: "Show or hide fields with AND/OR logic and 6 operators. useWatch subscribes only to relevant fields — zero performance overhead.",
  },
  {
    icon: "✏️",
    color: "from-green-500 to-emerald-600",
    glow: "group-hover:shadow-green-500/20",
    title: "Input Formatters",
    desc: "Transform values on every keystroke. Phone masks, SSNs, currency — any per-character transformation your UX needs.",
  },
  {
    icon: "🎮",
    color: "from-pink-500 to-rose-600",
    glow: "group-hover:shadow-pink-500/20",
    title: "Programmatic Control",
    desc: "formRef exposes the full React Hook Form API. Set values, trigger validation, reset — all from outside the component.",
  },
  {
    icon: "♿",
    color: "from-cyan-500 to-sky-600",
    glow: "group-hover:shadow-cyan-500/20",
    title: "Fully Accessible",
    desc: "aria-required, aria-invalid, fieldset/legend for groups, required asterisks with aria-hidden. WCAG-compliant out of the box.",
  },
];

function Features() {
  return (
    <section className="py-24 px-4 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
            Why ReactFill
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
            Everything you need.
            <br />
            <span className="gradient-text">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-xl ${f.glow}`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} mb-4 text-lg shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Theme Showcase ────────────────────────────────────────────────────────────

const TAILWIND_CODE = `import { DynamicForm } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";

const theme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: [
    "w-full rounded-md border border-gray-300 px-3 py-2",
    "text-sm shadow-sm focus:outline-none",
    "focus:ring-2 focus:ring-blue-500",
  ].join(" "),
  inputErrorClass: "border-red-500 focus:ring-red-500",
  errorClass: "mt-1 text-xs text-red-600",
  requiredMarkClass: "text-red-500 ml-0.5",
  submitButtonClass: [
    "px-4 py-2 bg-blue-600 text-white text-sm",
    "font-semibold rounded-md hover:bg-blue-700",
  ].join(" "),
};

<DynamicForm schema={schema} theme={theme} onSubmit={fn} />`;

const BOOTSTRAP_CODE = `import { DynamicForm } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";

const theme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-3",
  labelClass: "form-label",
  inputClass: "form-control",
  inputErrorClass: "is-invalid",
  errorClass: "invalid-feedback d-block",
  helpTextClass: "form-text",
  radioGroupClass: "d-flex flex-column gap-1",
  optionWrapperClass: "form-check",
  checkboxGroupClass: "form-check",
  requiredMarkClass: "text-danger",
  submitButtonClass: "btn btn-primary",
  resetButtonClass: "btn btn-secondary",
};

<DynamicForm schema={schema} theme={theme} onSubmit={fn} />`;

const MUI_CODE = `import { DynamicForm } from "@oqlet/react-fill";
import type { FormTheme } from "@oqlet/react-fill";

// No theme needed — use render prop for full MUI control:
const schema = [
  {
    name: "email",
    label: "Email",
    type: "email",
    render: ({ name, register, error }) => (
      <TextField
        {...register(name, { required: true })}
        label="Email"
        error={!!error}
        helperText={error?.message}
        fullWidth
        variant="outlined"
        size="small"
      />
    ),
  },
];

<DynamicForm schema={schema} onSubmit={fn} />`;

type ThemeTab = "tailwind" | "bootstrap" | "mui";

function ThemeShowcase() {
  const [tab, setTab] = useState<ThemeTab>("tailwind");

  const tabs: { id: ThemeTab; label: string; color: string }[] = [
    { id: "tailwind", label: "Tailwind CSS", color: "text-cyan-400" },
    { id: "bootstrap", label: "Bootstrap 5", color: "text-purple-400" },
    { id: "mui", label: "Material UI", color: "text-blue-400" },
  ];

  const codeMap: Record<ThemeTab, string> = {
    tailwind: TAILWIND_CODE,
    bootstrap: BOOTSTRAP_CODE,
    mui: MUI_CODE,
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">
            CSS Framework Agnostic
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
            Your CSS framework.
            <br />
            <span className="gradient-text">Your way.</span>
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            The <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">FormTheme</code> context
            provides named slots for every structural element. Pass your framework's class names once and every field uses them automatically.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          {/* Tab bar */}
          <div className="flex bg-zinc-900/80 border-b border-zinc-800">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "px-5 py-3.5 text-xs font-semibold transition-all",
                  tab === t.id
                    ? `${t.color} border-b-2 border-current bg-zinc-950/40`
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Code */}
          <div className="bg-zinc-950 text-[0.8rem] overflow-auto" style={{ maxHeight: 440 }}>
            <ThemeCodeBlock code={codeMap[tab]} />
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
          {[
            { emoji: "🎨", label: "17 theme slots", desc: "Every element is addressable" },
            { emoji: "🔒", label: "unstyled mode", desc: "Zero inline styles applied" },
            { emoji: "🧩", label: "Per-field overrides", desc: "inputClass, wrapperClass, etc." },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="text-sm font-semibold text-zinc-200">{item.label}</div>
              <div className="text-xs text-zinc-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThemeCodeBlock({ code }: { code: string }) {
  // Lazy-import to avoid issues; inline style-based highlighter
  return (
    <pre className="p-5 font-mono text-[0.8rem] leading-relaxed text-zinc-300 overflow-auto">
      <SimpleHighlight code={code} />
    </pre>
  );
}

function SimpleHighlight({ code }: { code: string }) {
  // Simple tokenizer: strings, keywords, comments, punctuation
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <div key={li} className="table-row">
          <span className="table-cell pr-4 text-zinc-700 select-none text-right w-8">{li + 1}</span>
          <span className="table-cell">
            <HighlightLine line={line} />
          </span>
        </div>
      ))}
    </>
  );
}

function HighlightLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//")) {
    return <span className="text-zinc-600 italic">{line}</span>;
  }
  // Tokenize: strings, keywords, types, punctuation
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

function tokenize(line: string): { text: string; cls: string }[] {
  const result: { text: string; cls: string }[] = [];
  let i = 0;
  const kw = new Set(["import", "from", "const", "let", "return", "type", "true", "false", "null"]);
  const types = new Set(["FormTheme", "DynamicForm", "FormFieldSchema"]);

  while (i < line.length) {
    // String
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) j++;
      result.push({ text: line.slice(i, j + 1), cls: "text-amber-300" });
      i = j + 1;
      continue;
    }
    // Word
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
    // Punctuation / other
    result.push({ text: line[i], cls: "text-zinc-400" });
    i++;
  }
  return result;
}

// ─── How It Works ──────────────────────────────────────────────────────────────

const STEP1 = `import { DynamicForm } from "@oqlet/react-fill";
import type { FormFieldSchema } from "@oqlet/react-fill";`;

const STEP2 = `const schema: FormFieldSchema[] = [
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
    validation: {
      pattern: {
        value: /^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$/,
        message: "Enter a valid email",
      },
    },
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Developer", value: "dev" },
      { label: "Designer",  value: "design" },
    ],
  },
  {
    name: "agreeToTerms",
    label: "I agree to the terms",
    type: "checkbox",
    required: true,
    fullWidth: true,
  },
];`;

const STEP3 = `export default function MyForm() {
  return (
    <DynamicForm
      schema={schema}
      onSubmit={(data) => {
        console.log(data);
        // { email: "...", role: "dev", agreeToTerms: true }
      }}
      defaultValues={{ role: "dev" }}
      showReset
    />
  );
}`;

function HowItWorks() {
  const steps = [
    { n: "01", title: "Install", desc: "Add the package and its peer dependencies.", code: `npm install @oqlet/react-fill\n# react, react-dom, and react-hook-form\n# are peer dependencies`, lang: "bash" },
    { n: "02", title: "Define the schema", desc: "Describe your fields as a plain array. No JSX, no component wiring.", code: STEP2, lang: "typescript" },
    { n: "03", title: "Render", desc: "Drop in DynamicForm with your schema and an onSubmit handler. Done.", code: STEP3, lang: "tsx" },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-zinc-950/60">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
            Get started in 3 steps
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
            From zero to form
            <br />
            <span className="gradient-text">in under a minute.</span>
          </h2>
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.n} className="grid lg:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-zinc-800">
              {/* Description */}
              <div className="flex items-start gap-4 p-8 bg-zinc-900/40">
                <span className="text-4xl font-extrabold text-zinc-800 font-mono leading-none">{step.n}</span>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {/* Code */}
              <div className="bg-zinc-950 border-l border-zinc-800 overflow-auto" style={{ maxHeight: 320 }}>
                <pre className="p-5 font-mono text-[0.8rem] leading-relaxed text-zinc-300 overflow-auto h-full">
                  {step.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onPlayground, onDocs }: { onPlayground: () => void; onDocs: () => void }) {
  return (
    <footer className="border-t border-zinc-800/60 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              ⬡
            </div>
            <div>
              <p className="font-semibold text-sm font-mono text-zinc-300">ReactFill</p>
              <p className="text-xs text-zinc-600 mt-0.5">MIT License · Built with React Hook Form</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <button
              onClick={onPlayground}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              ✦ Playground
            </button>
            <a
              href="https://github.com/goutham-05/react-fill"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <GitHubIcon />
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@oqlet/react-fill"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              npm
            </a>
            <a
              href="https://github.com/goutham-05/react-fill/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              Issues
            </a>
            <button
              onClick={onDocs}
              className="hover:text-zinc-300 transition-colors"
            >
              Docs
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/40 text-center text-xs text-zinc-700">
          Made with care by{" "}
          <a
            href="https://github.com/goutham-05"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Goutham Posannapeta
          </a>
          . Open source and free forever.
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function isPlaygroundHash(hash: string) {
  return hash === "#playground" || hash.startsWith("#playground:");
}

function isDocsHash(hash: string) {
  return hash === "#docs";
}

function hashToPage(hash: string): "landing" | "playground" | "docs" {
  if (isPlaygroundHash(hash)) return "playground";
  if (isDocsHash(hash)) return "docs";
  return "landing";
}

export default function App() {
  const [page, setPage] = useState<"landing" | "playground" | "docs">(
    () => hashToPage(window.location.hash)
  );

  // Parse shared state from URL on initial load
  const [sharedState] = useState<Partial<BuilderState> | null>(() => {
    const token = parseShareToken(window.location.hash);
    return token ? decodeState(token) : null;
  });

  const goPlayground = () => {
    window.location.hash = "playground";
    setPage("playground");
    window.scrollTo(0, 0);
  };

  const goLanding = () => {
    window.location.hash = "";
    setPage("landing");
    window.scrollTo(0, 0);
  };

  const goDocs = () => {
    window.location.hash = "docs";
    setPage("docs");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onHashChange = () => {
      setPage(hashToPage(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (page === "playground") {
    return <Playground onBack={goLanding} initialState={sharedState} />;
  }

  if (page === "docs") {
    return <Docs onBack={goLanding} />;
  }

  return (
    <div className="bg-[#09090b] text-zinc-100 font-sans min-h-screen">
      <Navbar onPlayground={goPlayground} onDocs={goDocs} />
      <Hero onPlayground={goPlayground} />
      <Features />
      <Demo />
      <ThemeShowcase />
      <HowItWorks />
      <Footer onPlayground={goPlayground} onDocs={goDocs} />
    </div>
  );
}
