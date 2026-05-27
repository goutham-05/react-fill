import React, { useReducer, useState, useEffect, useCallback } from "react";
import ImportModal from "./ImportModal";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { builderReducer, initialState } from "./reducer";
import type { BuilderState, FieldConfig, FieldType } from "./types";
import { buildShareUrl } from "./shareUrl";
import FieldPalette from "./FieldPalette";
import BuilderCanvas from "./BuilderCanvas";
import OutputPanel from "./OutputPanel";
import { useTheme } from "../ThemeContext";

// ─── Drag overlay preview ─────────────────────────────────────────────────────

function OverlayPreview({ id, fields }: { id: string; fields: FieldConfig[] }) {
  if (id.startsWith("palette-")) {
    const type = id.replace("palette-", "") as FieldType;
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-blue-500/50 rounded-xl shadow-2xl text-sm text-gray-700 dark:text-zinc-300 opacity-95">
        <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">{type}</span>
        <span className="text-gray-500 dark:text-zinc-500">field</span>
      </div>
    );
  }
  const field = fields.find((f) => f.id === id);
  if (!field) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-gray-400 dark:border-zinc-600 rounded-xl shadow-2xl text-sm text-gray-800 dark:text-zinc-200 opacity-95 min-w-[180px]">
      <span className="text-[10px] font-mono bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
        {field.type}
      </span>
      {field.label}
    </div>
  );
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────

function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ─── Playground ───────────────────────────────────────────────────────────────

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ state }: { state: BuilderState }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(buildShareUrl(state));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [state]);
  return (
    <button
      onClick={copy}
      disabled={state.fields.length === 0}
      title="Copy shareable link"
      className={[
        "flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold rounded-md border transition-all",
        state.fields.length === 0
          ? "opacity-30 cursor-not-allowed border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-600"
          : copied
          ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
          : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 border-gray-300/50 dark:border-zinc-700/50",
      ].join(" ")}
    >
      {copied ? "✓ Link copied!" : "⤴ Share"}
    </button>
  );
}

// ─── Playground ───────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
  initialState?: Partial<BuilderState> | null;
}

export default function Playground({ onBack, initialState: sharedState }: Props) {
  const [state, dispatch] = useReducer(
    builderReducer,
    sharedState ? { ...initialState, ...sharedState } : initialState
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // When canvas is cleared, drop any share token from the URL
  useEffect(() => {
    if (state.fields.length === 0 && window.location.hash.startsWith("#playground:")) {
      history.replaceState(null, "", "#playground");
    }
  }, [state.fields.length]);

  // Ctrl+Z / Ctrl+Y keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "UNDO" }); }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) { e.preventDefault(); dispatch({ type: "REDO" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    // Deselect when starting to drag a canvas card
    if (!String(active.id).startsWith("palette-")) {
      dispatch({ type: "SELECT", id: null });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const isPalette = String(active.id).startsWith("palette-");

    if (isPalette) {
      const fieldType = String(active.id).replace("palette-", "") as FieldType;
      // Insert before the field being hovered, or append if over the canvas container
      let insertIndex = state.fields.length;
      if (over.id !== "canvas") {
        const overIdx = state.fields.findIndex((f) => f.id === over.id);
        if (overIdx >= 0) insertIndex = overIdx;
      }
      dispatch({ type: "ADD_FIELD", fieldType, atIndex: insertIndex });
    } else {
      // Reorder within canvas
      if (active.id !== over.id) {
        const oldIndex = state.fields.findIndex((f) => f.id === active.id);
        const newIndex = state.fields.findIndex((f) => f.id === over.id);
        if (oldIndex >= 0 && newIndex >= 0) {
          dispatch({ type: "REORDER", oldIndex, newIndex });
        }
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 overflow-hidden">
      {/* ── Header ── */}
      <header className="h-11 flex items-center justify-between px-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0 bg-white/60 dark:bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xs text-gray-500 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800" />
          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={state.past.length === 0}
              title="Undo (⌘Z)"
              className="w-6 h-6 flex items-center justify-center text-xs rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >↩</button>
            <button
              onClick={() => dispatch({ type: "REDO" })}
              disabled={state.future.length === 0}
              title="Redo (⌘Y)"
              className="w-6 h-6 flex items-center justify-center text-xs rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >↪</button>
          </div>
          <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              ⬡
            </div>
            <span className="text-sm font-semibold font-mono text-gray-700 dark:text-zinc-300">
              Form Playground
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-600">
            beta
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-zinc-700">
          <span>Drag fields → Edit → Copy schema</span>
          {state.fields.length > 0 && (
            <>
              <div className="w-px h-3 bg-gray-200 dark:bg-zinc-800" />
              <span className="text-gray-500 dark:text-zinc-500">{state.fields.length} field{state.fields.length > 1 ? "s" : ""}</span>
              <div className="w-px h-3 bg-gray-200 dark:bg-zinc-800" />
              <span className="text-gray-500 dark:text-zinc-500">{state.columns}-col layout</span>
            </>
          )}
          <div className="w-px h-3 bg-gray-200 dark:bg-zinc-800" />
          <ThemeToggleButton />
          <button
            onClick={() => setImportOpen(true)}
            title="Paste a schema and preview it"
            className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold rounded-md border transition-all bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 border-gray-300/50 dark:border-zinc-700/50"
          >
            ⤵ Import
          </button>
          <ShareButton state={state} />
        </div>
      </header>

      {/* ── Three-panel layout ── */}
      {/* Flex container gives PanelGroup a concrete height to work against */}
      <div className="flex-1 overflow-hidden flex">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <PanelGroup orientation="horizontal" style={{ height: "100%", width: "100%" }}>
            {/* Field palette */}
            <Panel defaultSize="18%" minSize="12%" maxSize="30%" style={{ height: "100%", overflow: "hidden" }}>
              <FieldPalette dispatch={dispatch} />
            </Panel>

            <PanelResizeHandle className="group w-1 bg-gray-200 dark:bg-zinc-800 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors relative flex items-center justify-center cursor-col-resize">
              <div className="absolute flex flex-col gap-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-0.5 h-1 rounded-full bg-white/70" />
                <div className="w-0.5 h-1 rounded-full bg-white/70" />
                <div className="w-0.5 h-1 rounded-full bg-white/70" />
              </div>
            </PanelResizeHandle>

            {/* Builder canvas */}
            <Panel defaultSize="47%" minSize="25%" style={{ height: "100%", overflow: "hidden" }}>
              <BuilderCanvas
                fields={state.fields}
                selectedId={state.selectedId}
                columns={state.columns}
                dispatch={dispatch}
              />
            </Panel>

            <PanelResizeHandle className="group w-1 bg-gray-200 dark:bg-zinc-800 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors relative flex items-center justify-center cursor-col-resize">
              <div className="absolute flex flex-col gap-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-0.5 h-1 rounded-full bg-white/70" />
                <div className="w-0.5 h-1 rounded-full bg-white/70" />
                <div className="w-0.5 h-1 rounded-full bg-white/70" />
              </div>
            </PanelResizeHandle>

            {/* Output panel */}
            <Panel defaultSize="35%" minSize="20%" style={{ height: "100%", overflow: "hidden" }}>
              <OutputPanel fields={state.fields} columns={state.columns} />
            </Panel>
          </PanelGroup>

          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeId && <OverlayPreview id={activeId} fields={state.fields} />}
          </DragOverlay>
        </DndContext>
      </div>

      {importOpen && (
        <ImportModal dispatch={dispatch} onClose={() => setImportOpen(false)} />
      )}
    </div>
  );
}
