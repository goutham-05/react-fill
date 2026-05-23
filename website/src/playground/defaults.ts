import type { FieldConfig, FieldType } from "./types";

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

const LABELS: Record<FieldType, string> = {
  text: "Text Field",
  email: "Email Address",
  number: "Number",
  textarea: "Message",
  select: "Select Option",
  radio: "Choose One",
  checkbox: "I agree",
  date: "Date",
  file: "Upload File",
  slider: "Slider",
  rating: "Rating",
  fieldArray: "Repeating Section",
  group: "Group",
};

export function createDefaultField(type: FieldType, count: number): FieldConfig {
  const base: FieldConfig = {
    id: uid(),
    type,
    name: `${type}_${count + 1}`,
    label: LABELS[type],
  };

  if (type === "select" || type === "radio") {
    return {
      ...base,
      options: [
        { id: uid(), label: "Option A", value: "option_a" },
        { id: uid(), label: "Option B", value: "option_b" },
        { id: uid(), label: "Option C", value: "option_c" },
      ],
    };
  }

  if (type === "textarea") return { ...base, rows: 4 };
  if (type === "number") return { ...base, placeholder: "0" };
  if (type === "email") return { ...base, placeholder: "you@example.com" };
  if (type === "text") return { ...base, placeholder: "Enter text..." };
  if (type === "slider") return { ...base, min: 0, max: 100, step: 1 };
  if (type === "rating") return { ...base, starCount: 5 };
  if (type === "file") return { ...base, accept: "image/*,.pdf" };
  if (type === "fieldArray") return {
    ...base,
    addButtonLabel: "+ Add row",
    removeButtonLabel: "Remove",
    children: [
      { type: "text" as FieldType, name: "item_name", label: "Name", placeholder: "Enter name..." },
    ],
  };

  return base;
}

// ─── Pre-built templates ──────────────────────────────────────────────────────

export type Template = { label: string; emoji: string; fields: Omit<FieldConfig, "id">[] };

export const TEMPLATES: Template[] = [
  {
    label: "Contact Form",
    emoji: "✉️",
    fields: [
      { type: "text", name: "full_name", label: "Full Name", required: true, placeholder: "Jane Smith", fullWidth: true },
      { type: "email", name: "email", label: "Email Address", required: true, placeholder: "jane@example.com" },
      { type: "text", name: "subject", label: "Subject", placeholder: "How can we help?" },
      { type: "textarea", name: "message", label: "Message", required: true, rows: 5, fullWidth: true },
    ],
  },
  {
    label: "Sign Up",
    emoji: "👤",
    fields: [
      { type: "text", name: "first_name", label: "First Name", required: true, placeholder: "Jane" },
      { type: "text", name: "last_name", label: "Last Name", required: true, placeholder: "Smith" },
      { type: "email", name: "email", label: "Email", required: true, placeholder: "jane@example.com", fullWidth: true },
      { type: "select", name: "role", label: "Role", options: [
        { id: uid(), label: "Developer", value: "developer" },
        { id: uid(), label: "Designer", value: "designer" },
        { id: uid(), label: "Manager", value: "manager" },
      ]},
      { type: "checkbox", name: "terms", label: "I agree to the Terms of Service", required: true, fullWidth: true },
    ],
  },
  {
    label: "Survey",
    emoji: "📋",
    fields: [
      { type: "text", name: "name", label: "Your Name", placeholder: "Optional", fullWidth: true },
      { type: "radio", name: "satisfaction", label: "Overall Satisfaction", fullWidth: true, options: [
        { id: uid(), label: "Very satisfied", value: "5" },
        { id: uid(), label: "Satisfied", value: "4" },
        { id: uid(), label: "Neutral", value: "3" },
        { id: uid(), label: "Dissatisfied", value: "2" },
      ]},
      { type: "select", name: "heard_from", label: "How did you hear about us?", options: [
        { id: uid(), label: "Search engine", value: "search" },
        { id: uid(), label: "Social media", value: "social" },
        { id: uid(), label: "Word of mouth", value: "word" },
        { id: uid(), label: "Other", value: "other" },
      ]},
      { type: "textarea", name: "feedback", label: "Additional Feedback", rows: 4, fullWidth: true },
    ],
  },
];
