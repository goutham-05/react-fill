import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { BuilderAction, FieldType } from "./types";
import { TEMPLATES } from "./defaults";

const PALETTE_ITEMS: {
  type: FieldType;
  icon: string;
  label: string;
  iconColor: string;
  bg: string;
}[] = [
  { type: "text",       icon: "Aa", label: "Text",       iconColor: "text-blue-300",    bg: "bg-blue-500/15 border-blue-500/25" },
  { type: "email",      icon: "✉",  label: "Email",      iconColor: "text-sky-300",     bg: "bg-sky-500/15 border-sky-500/25" },
  { type: "number",     icon: "#",  label: "Number",     iconColor: "text-amber-300",   bg: "bg-amber-500/15 border-amber-500/25" },
  { type: "textarea",   icon: "¶",  label: "Textarea",   iconColor: "text-violet-300",  bg: "bg-violet-500/15 border-violet-500/25" },
  { type: "select",     icon: "▾",  label: "Select",     iconColor: "text-green-300",   bg: "bg-green-500/15 border-green-500/25" },
  { type: "radio",      icon: "◉",  label: "Radio",      iconColor: "text-pink-300",    bg: "bg-pink-500/15 border-pink-500/25" },
  { type: "checkbox",   icon: "☑",  label: "Checkbox",   iconColor: "text-cyan-300",    bg: "bg-cyan-500/15 border-cyan-500/25" },
  { type: "date",       icon: "📅", label: "Date",       iconColor: "text-teal-300",    bg: "bg-teal-500/15 border-teal-500/25" },
  { type: "file",       icon: "📎", label: "File",       iconColor: "text-indigo-300",  bg: "bg-indigo-500/15 border-indigo-500/25" },
  { type: "slider",     icon: "⟷",  label: "Slider",     iconColor: "text-lime-300",    bg: "bg-lime-500/15 border-lime-500/25" },
  { type: "rating",     icon: "★",  label: "Rating",     iconColor: "text-yellow-300",  bg: "bg-yellow-500/15 border-yellow-500/25" },
  { type: "fieldArray", icon: "⊕",  label: "Repeater",   iconColor: "text-rose-300",    bg: "bg-rose-500/15 border-rose-500/25" },
  { type: "group",      icon: "⊞",  label: "Group",      iconColor: "text-orange-300",  bg: "bg-orange-500/15 border-orange-500/25" },
];

function PaletteCard({
  type, icon, label, iconColor, bg,
}: (typeof PALETTE_ITEMS)[number]) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: "palette", fieldType: type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        "flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-grab active:cursor-grabbing",
        "transition-all duration-150 select-none group",
        bg,
        isDragging ? "opacity-40 scale-95" : "hover:scale-105 hover:brightness-125",
      ].join(" ")}
      title={`Drag to add ${label} field`}
    >
      <span className={`text-lg font-mono font-bold leading-none ${iconColor}`}>{icon}</span>
      <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
    </div>
  );
}

interface Props {
  dispatch: React.Dispatch<BuilderAction>;
}

export default function FieldPalette({ dispatch }: Props) {
  return (
    <aside className="w-52 flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950/50 overflow-y-auto">
      {/* Field types */}
      <div className="p-4 border-b border-zinc-800/60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
          Field Types
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PALETTE_ITEMS.map((item) => (
            <PaletteCard key={item.type} {...item} />
          ))}
        </div>
        <p className="text-[10px] text-zinc-700 mt-3 text-center leading-relaxed">
          Drag a type onto the canvas
        </p>
      </div>

      {/* Templates */}
      <div className="p-4 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
          Templates
        </p>
        <div className="space-y-1.5">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              onClick={() =>
                dispatch({ type: "LOAD_TEMPLATE", fields: tpl.fields })
              }
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left
                bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60
                transition-all group"
            >
              <span className="text-base">{tpl.emoji}</span>
              <div>
                <p className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  {tpl.label}
                </p>
                <p className="text-[10px] text-zinc-600">
                  {tpl.fields.length} fields
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
