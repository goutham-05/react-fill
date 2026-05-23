import React, { useReducer, useState, useEffect, useCallback } from "react";
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

// ─── Drag overlay preview ─────────────────────────────────────────────────────

function OverlayPreview({ id, fields }: { id: string; fields: FieldConfig[] }) {
  if (id.startsWith("palette-")) {
    const type = id.replace("palette-", "") as FieldType;
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-blue-500/50 rounded-xl shadow-2xl text-sm text-zinc-300 opacity-95">
        <span className="text-xs text-blue-400 font-mono font-semibold">{type}</span>
        <span className="text-zinc-500">field</span>
      </div>
    );
  }
  const field = fields.find((f) => f.id === id);
  if (!field) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 border border-zinc-600 rounded-xl shadow-2xl text-sm text-zinc-200 opacity-95 min-w-[180px]">
      <span className="text-[10px] font-mono bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">
        {field.type}
      </span>
      {field.label}
    </div>
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
          ? "opacity-30 cursor-not-allowed border-zinc-800 text-zinc-600"
          : copied
          ? "bg-green-500/20 text-green-400 border-green-500/30"
          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border-zinc-700/50",
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
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* ── Header ── */}
      <header className="h-11 flex items-center justify-between px-4 border-b border-zinc-800 flex-shrink-0 bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={state.past.length === 0}
              title="Undo (⌘Z)"
              className="w-6 h-6 flex items-center justify-center text-xs rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >↩</button>
            <button
              onClick={() => dispatch({ type: "REDO" })}
              disabled={state.future.length === 0}
              title="Redo (⌘Y)"
              className="w-6 h-6 flex items-center justify-center text-xs rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >↪</button>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              ⬡
            </div>
            <span className="text-sm font-semibold font-mono text-zinc-300">
              Form Playground
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-600">
            beta
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-zinc-700">
          <span>Drag fields → Edit → Copy schema</span>
          {state.fields.length > 0 && (
            <>
              <div className="w-px h-3 bg-zinc-800" />
              <span className="text-zinc-500">{state.fields.length} field{state.fields.length > 1 ? "s" : ""}</span>
              <div className="w-px h-3 bg-zinc-800" />
              <span className="text-zinc-500">{state.columns}-col layout</span>
            </>
          )}
          <div className="w-px h-3 bg-zinc-800" />
          <ShareButton state={state} />
        </div>
      </header>

      {/* ── Three-panel layout ── */}
      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <FieldPalette dispatch={dispatch} />
          <BuilderCanvas
            fields={state.fields}
            selectedId={state.selectedId}
            columns={state.columns}
            dispatch={dispatch}
          />
          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeId && (
              <OverlayPreview id={activeId} fields={state.fields} />
            )}
          </DragOverlay>
        </DndContext>

        <OutputPanel fields={state.fields} columns={state.columns} />
      </div>
    </div>
  );
}
