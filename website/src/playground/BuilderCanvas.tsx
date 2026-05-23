import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BuilderAction, FieldConfig } from "./types";
import FieldCard from "./FieldCard";

interface Props {
  fields: FieldConfig[];
  selectedId: string | null;
  columns: number;
  dispatch: React.Dispatch<BuilderAction>;
}

export default function BuilderCanvas({ fields, selectedId, columns, dispatch }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  const isEmpty = fields.length === 0;

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-zinc-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 h-10 border-b border-zinc-800/60 flex-shrink-0 bg-zinc-950/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Canvas</span>
          {fields.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
              {fields.length} field{fields.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Columns picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-600">Cols</span>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {[1, 2, 3].map((c) => (
                <button
                  key={c}
                  onClick={() => dispatch({ type: "SET_COLUMNS", columns: c })}
                  title={`${c} column${c > 1 ? "s" : ""}`}
                  className={[
                    "w-7 h-6 text-[10px] font-semibold transition-colors",
                    columns === c
                      ? "bg-blue-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {fields.length > 0 && (
            <button
              onClick={() => dispatch({ type: "CLEAR" })}
              className="text-[10px] text-zinc-700 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div className="flex-1 overflow-y-auto p-4">
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={[
              "min-h-full rounded-xl border-2 border-dashed transition-all duration-200 p-2",
              isEmpty
                ? isOver
                  ? "border-blue-500/60 bg-blue-500/5"
                  : "border-zinc-800 bg-transparent"
                : isOver
                ? "border-blue-500/30 bg-blue-500/3"
                : "border-transparent",
            ].join(" ")}
          >
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center pointer-events-none">
                <div
                  className={`text-5xl mb-4 transition-all duration-200 ${
                    isOver ? "opacity-80 scale-110" : "opacity-15"
                  }`}
                >
                  ⊞
                </div>
                <p className={`text-sm transition-colors ${isOver ? "text-blue-400" : "text-zinc-600"}`}>
                  {isOver ? "Release to add field" : "Drop fields here"}
                </p>
                <p className="text-xs text-zinc-700 mt-1.5">
                  or click a template on the left to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    isSelected={selectedId === field.id}
                    allFields={fields}
                    columns={columns}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </main>
  );
}
