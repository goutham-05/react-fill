export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "slider"
  | "rating"
  | "fieldArray"
  | "group";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FieldCondition {
  field: string;
  operator: "equals" | "notEquals" | "in" | "notIn" | "exists" | "notExists";
  value?: string | boolean;
}

export interface FieldValidation {
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  pattern?: string;
  patternMessage?: string;
}

export interface FieldConfig {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  colSpan?: number;
  // number / slider
  min?: number;
  max?: number;
  step?: number;
  // textarea
  rows?: number;
  showWordCount?: boolean;
  // select / radio / checkbox-group
  options?: FieldOption[];
  // async / dependent options
  apiEndpoint?: string;
  dependsOn?: string;
  // file
  accept?: string;
  multiple?: boolean;
  // rating
  starCount?: number;
  // fieldArray
  addButtonLabel?: string;
  removeButtonLabel?: string;
  children?: Omit<FieldConfig, "id">[];
  // validation
  validation?: FieldValidation;
  // visibleWhen (single condition for simplicity)
  condition?: FieldCondition | null;
}

export type BuilderAction =
  | { type: "ADD_FIELD"; fieldType: FieldType; atIndex?: number }
  | { type: "REMOVE_FIELD"; id: string }
  | { type: "UPDATE_FIELD"; id: string; changes: Partial<FieldConfig> }
  | { type: "REORDER"; oldIndex: number; newIndex: number }
  | { type: "DUPLICATE"; id: string }
  | { type: "SELECT"; id: string | null }
  | { type: "LOAD_TEMPLATE"; fields: Omit<FieldConfig, "id">[] }
  | { type: "SET_COLUMNS"; columns: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR" };

/** The slice of state that is tracked in undo/redo history. */
export interface HistorySlice {
  fields: FieldConfig[];
  columns: number;
}

export interface BuilderState {
  fields: FieldConfig[];
  selectedId: string | null;
  columns: number;
  past: HistorySlice[];
  future: HistorySlice[];
}
