import React, { useState, useEffect, useSyncExternalStore } from "react";
import Demo from "./components/Demo";
import Docs from "./components/Docs";
import Examples from "./components/Examples";
import Playground from "./playground/Playground";
import { parseShareToken, decodeState } from "./playground/shareUrl";
import type { BuilderState } from "./playground/types";
import { useTheme } from "./ThemeContext";

const PACKAGE_VERSION = __PACKAGE_VERSION__;

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

// ─── ThemeToggleButton ────────────────────────────────────────────────────────

function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
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

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  activePage,
  onHome,
  onDemo,
  onPlayground,
  onDocs,
  onExamples,
}: {
  activePage: "landing" | "playground" | "docs" | "examples";
  onHome: () => void;
  onDemo: () => void;
  onPlayground: () => void;
  onDocs: () => void;
  onExamples: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItemClass = (isActive: boolean) =>
    [
      "hidden sm:block px-3 py-1.5 text-xs rounded-md transition-all",
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-600/15 dark:text-blue-300"
        : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100/60 dark:hover:bg-zinc-800/60",
    ].join(" ");

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-80"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            ⬡
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100 font-mono">ReactFill</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={onPlayground}
            className={[
              "hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all",
              activePage === "playground"
                ? "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-500/40 dark:bg-blue-600/25 dark:text-blue-200"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-500/25 dark:bg-blue-600/15 dark:text-blue-300 dark:hover:bg-blue-600/25 dark:hover:text-blue-200",
            ].join(" ")}
          >
            ✦ Playground
          </button>
          <button
            type="button"
            onClick={onDemo}
            className={navItemClass(activePage === "landing")}
          >
            Demo
          </button>
          <button
            type="button"
            onClick={onExamples}
            className={navItemClass(activePage === "examples")}
          >
            Examples
          </button>
          <button
            type="button"
            onClick={onDocs}
            className={navItemClass(activePage === "docs")}
          >
            Docs
          </button>
          <ThemeToggleButton />
          <a
            href="https://www.npmjs.com/package/@oqlet/react-fill"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 rounded-md transition-all border border-gray-300 dark:border-zinc-700/50"
            title="View on npm"
          >
            <NpmIcon />
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
              v{PACKAGE_VERSION}
            </span>
          </a>
          <a
            href="https://github.com/goutham-05/react-fill"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 rounded-md transition-all text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/50"
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
      type="button"
      onClick={copy}
      className="ml-3 px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300 hover:text-white transition-all font-mono border border-gray-400/50 dark:border-zinc-600/50"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function Hero({
  onPlayground,
  onExamples,
}: {
  onPlayground: () => void;
  onExamples: () => void;
}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden grid-bg">
      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-400 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          v{PACKAGE_VERSION} released, 114 tests passing
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight mb-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-gray-900 dark:text-zinc-100">Forms without</span>
          <br />
          <span className="text-blue-600 dark:text-blue-400">the boilerplate.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Pass a JSON schema. Get a fully functional, accessible, CSS-framework-agnostic form.
          <br className="hidden sm:block" />
          Powered by{" "}
          <a
            href="https://react-hook-form.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            React Hook Form
          </a>
          .
        </p>

        {/* Install command */}
        <div
          className="inline-flex items-center bg-gray-50/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800 rounded-xl px-5 py-3 mb-10 font-mono text-sm text-gray-700 dark:text-zinc-300 backdrop-blur-sm animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="text-gray-500 dark:text-zinc-600 select-none mr-2">$</span>
          <span>npm install @oqlet/react-fill</span>
          <CopyButton text="npm install @oqlet/react-fill" />
        </div>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <button
            type="button"
            onClick={onPlayground}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            ✦ Open Playground
          </button>
          <a
            href="#demo"
            className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-white text-sm font-semibold transition-all border border-gray-300/60 dark:border-zinc-700/60"
          >
            See Demo ↓
          </a>
          <button
            type="button"
            onClick={onExamples}
            className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-white text-sm font-semibold transition-all border border-gray-300/60 dark:border-zinc-700/60"
          >
            Examples
          </button>
          <a
            href="https://github.com/goutham-05/react-fill"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-white text-sm font-semibold transition-all border border-gray-300/60 dark:border-zinc-700/60 flex items-center gap-2"
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
            { label: "Bundle size", value: "~16 kB" },
            { label: "Tests passing", value: "114" },
            { label: "Field types", value: "18" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200/80 dark:border-zinc-800/80 backdrop-blur-sm"
            >
              <span className="text-xl font-bold text-gray-900 dark:text-zinc-100">{stat.value}</span>
              <span className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s" }}>
        <span className="text-xs text-gray-500 dark:text-zinc-600">scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-300 dark:from-zinc-700 to-transparent" />
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "⬡",
    color: "bg-blue-600",
    glow: "group-hover:shadow-blue-500/20",
    title: "Schema-Driven",
    desc: "Define your entire form as a plain JSON array. No JSX markup, no repetition, no wiring up state by hand.",
  },
  {
    icon: "🎨",
    color: "bg-violet-600",
    glow: "group-hover:shadow-violet-500/20",
    title: "Framework Agnostic",
    desc: "Works with Tailwind, Bootstrap, MUI, or zero CSS. The FormTheme context wires your class names to every element.",
  },
  {
    icon: "⚡",
    color: "bg-amber-500",
    glow: "group-hover:shadow-amber-500/20",
    title: "Conditional Fields",
    desc: "Show or hide fields with AND/OR logic and 6 operators. useWatch subscribes only to relevant fields — zero performance overhead.",
  },
  {
    icon: "✏️",
    color: "bg-green-600",
    glow: "group-hover:shadow-green-500/20",
    title: "Input Formatters",
    desc: "Transform values on every keystroke. Phone masks, SSNs, currency — any per-character transformation your UX needs.",
  },
  {
    icon: "🎮",
    color: "bg-pink-500",
    glow: "group-hover:shadow-pink-500/20",
    title: "Programmatic Control",
    desc: "formRef exposes the full React Hook Form API. Set values, trigger validation, reset — all from outside the component.",
  },
  {
    icon: "♿",
    color: "bg-cyan-600",
    glow: "group-hover:shadow-cyan-500/20",
    title: "Fully Accessible",
    desc: "aria-required, aria-invalid, fieldset/legend for groups, required asterisks with aria-hidden. WCAG-compliant out of the box.",
  },
];

function Features() {
  return (
    <section className="py-24 px-4 bg-white/50 dark:bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3">
            Why ReactFill
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-100">
            Everything you need.
            <br />
            <span className="text-violet-600 dark:text-violet-400">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-xl bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all hover:shadow-xl ${f.glow}`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${f.color} mb-4 text-lg`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
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
    { id: "tailwind", label: "Tailwind CSS", color: "text-cyan-600 dark:text-cyan-400" },
    { id: "bootstrap", label: "Bootstrap 5", color: "text-purple-700 dark:text-purple-400" },
    { id: "mui", label: "Material UI", color: "text-blue-600 dark:text-blue-400" },
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
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400 mb-3">
            CSS Framework Agnostic
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-100">
            Your CSS framework.
            <br />
            <span className="text-green-600 dark:text-green-400">Your way.</span>
          </h2>
          <p className="mt-4 text-gray-500 dark:text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            The <code className="text-gray-800 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">FormTheme</code> context
            provides named slots for every structural element. Pass your framework's class names once and every field uses them automatically.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl">
          {/* Tab bar */}
          <div className="flex bg-gray-50/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
            {tabs.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "px-5 py-3.5 text-xs font-semibold transition-all",
                  tab === t.id
                    ? `${t.color} border-b-2 border-current bg-white/40 dark:bg-zinc-950/40`
                    : "text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Code */}
          <div className="bg-white dark:bg-zinc-950 overflow-auto" style={{ maxHeight: 440 }}>
            <ThemeCodeBlock code={codeMap[tab]} />
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
          {[
            { emoji: "🎨", label: "17 theme slots", desc: "Every element is addressable" },
            { emoji: "🔒", label: "unstyled mode", desc: "Zero inline styles applied" },
            { emoji: "🧩", label: "Per-field overrides", desc: "inputClass, wrapperClass, etc." },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{item.label}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThemeCodeBlock({ code }: { code: string }) {
  return (
    <pre className="p-5 font-mono text-[0.8rem] leading-relaxed overflow-auto">
      <SimpleHighlight code={code} />
    </pre>
  );
}

function SimpleHighlight({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="table w-full">
      {lines.map((line, li) => (
        <div key={li} className="table-row">
          <span className="table-cell pr-5 text-gray-400 dark:text-zinc-700 select-none text-right w-8 text-[0.75rem]">{li + 1}</span>
          <span className="table-cell">
            <HighlightLine line={line} />
          </span>
        </div>
      ))}
    </div>
  );
}

function HighlightLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#")) {
    return <span className="text-gray-500 dark:text-zinc-600 italic">{line}</span>;
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
      result.push({ text: line.slice(i, j + 1), cls: "text-amber-600 dark:text-amber-300" });
      i = j + 1;
      continue;
    }
    // Word
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
    // Punctuation / other
    result.push({ text: line[i], cls: "text-gray-600 dark:text-zinc-400" });
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
    <section id="how-it-works" className="py-24 px-4 bg-white/60 dark:bg-zinc-950/60">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">
            Get started in 3 steps
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-100">
            From zero to form
            <br />
            <span className="text-amber-600 dark:text-amber-400">in under a minute.</span>
          </h2>
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.n} className="grid lg:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800">
              {/* Description */}
              <div className="flex items-start gap-4 p-8 bg-gray-50/40 dark:bg-zinc-900/40">
                <span className="text-4xl font-extrabold text-gray-200 dark:text-zinc-800 font-mono leading-none">{step.n}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {/* Code */}
              <div className="bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 overflow-auto" style={{ maxHeight: 320 }}>
                <ThemeCodeBlock code={step.code} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({
  onPlayground,
  onDocs,
  onExamples,
}: {
  onPlayground: () => void;
  onDocs: () => void;
  onExamples: () => void;
}) {
  return (
    <footer className="border-t border-gray-200/60 dark:border-zinc-800/60 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              ⬡
            </div>
            <div>
              <p className="font-semibold text-sm font-mono text-gray-700 dark:text-zinc-300">ReactFill</p>
              <p className="text-xs text-gray-500 dark:text-zinc-600 mt-0.5">MIT License · Built with React Hook Form</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-zinc-500">
            <button
              type="button"
              onClick={onPlayground}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              ✦ Playground
            </button>
            <button
              type="button"
              onClick={onExamples}
              className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            >
              Examples
            </button>
            <a
              href="https://github.com/goutham-05/react-fill"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <GitHubIcon />
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@oqlet/react-fill"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            >
              npm
            </a>
            <a
              href="https://github.com/goutham-05/react-fill/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            >
              Issues
            </a>
            <button
              type="button"
              onClick={onDocs}
              className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            >
              Docs
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/40 dark:border-zinc-800/40 text-center text-xs text-gray-400 dark:text-zinc-700">
          Made with care by{" "}
          <a
            href="https://github.com/goutham-05"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
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

function isExamplesHash(hash: string) {
  return hash === "#examples";
}

function pathToPage(pathname: string, hash: string): "landing" | "playground" | "docs" | "examples" {
  if (pathname === "/playground" || isPlaygroundHash(hash)) return "playground";
  if (pathname === "/docs" || isDocsHash(hash)) return "docs";
  if (pathname === "/examples" || isExamplesHash(hash)) return "examples";
  return "landing";
}

function locationSnapshotToPage(snapshot: string): "landing" | "playground" | "docs" | "examples" {
  const [pathname, hash = ""] = snapshot.split("#");
  return pathToPage(pathname || "/", hash ? `#${hash}` : "");
}

function subscribeToLocationChange(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}

function getLocationSnapshot() {
  return `${window.location.pathname}${window.location.hash}`;
}

function navigateTo(path: string) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const locationSnapshot = useSyncExternalStore(subscribeToLocationChange, getLocationSnapshot, () => "/");
  const page = locationSnapshotToPage(locationSnapshot);

  // Parse shared state from URL on initial load
  const [sharedState] = useState<Partial<BuilderState> | null>(() => {
    const token = parseShareToken(window.location.hash);
    return token ? decodeState(token) : null;
  });

  const goPlayground = () => {
    navigateTo("/playground");
    window.scrollTo(0, 0);
  };

  const goLanding = () => {
    navigateTo("/");
    window.scrollTo(0, 0);
  };

  const goDemo = () => {
    navigateTo("/");
    window.setTimeout(() => {
      document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const goDocs = () => {
    navigateTo("/docs");
    window.scrollTo(0, 0);
  };

  const goExamples = () => {
    navigateTo("/examples");
    window.scrollTo(0, 0);
  };

  if (page === "playground") {
    return <Playground onBack={goLanding} initialState={sharedState} />;
  }

  if (page === "docs") {
    return (
      <div className="bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 font-sans min-h-screen">
        <Navbar
          activePage={page}
          onHome={goLanding}
          onDemo={goDemo}
          onPlayground={goPlayground}
          onDocs={goDocs}
          onExamples={goExamples}
        />
        <Docs />
      </div>
    );
  }

  if (page === "examples") {
    return (
      <div className="bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 font-sans min-h-screen">
        <Navbar
          activePage={page}
          onHome={goLanding}
          onDemo={goDemo}
          onPlayground={goPlayground}
          onDocs={goDocs}
          onExamples={goExamples}
        />
        <Examples />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 font-sans min-h-screen">
      <Navbar
        activePage={page}
        onHome={goLanding}
        onDemo={goDemo}
        onPlayground={goPlayground}
        onDocs={goDocs}
        onExamples={goExamples}
      />
      <Hero onPlayground={goPlayground} onExamples={goExamples} />
      <Features />
      <Demo />
      <ThemeShowcase />
      <HowItWorks />
      <Footer onPlayground={goPlayground} onDocs={goDocs} onExamples={goExamples} />
    </div>
  );
}
