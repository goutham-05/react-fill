import React from "react";
import { useFormContext } from "react-hook-form";
import { FieldType } from "./constant";

/**
 * Shared condition configuration used by visibleWhen, requiredWhen, and disabledWhen.
 * All three props accept identical shape — only the effect differs.
 */
export interface ConditionConfig {
  /** How to combine multiple conditions. Default: "AND" (all must pass). */
  logic?: "AND" | "OR";
  conditions: {
    /** Dot-path to the controlling field, e.g. "address.country". */
    field: string;
    /** Expected value. For "in"/"notIn" operators, pass an array. */
    value?: any | any[];
    operator?: "equals" | "notEquals" | "in" | "notIn" | "exists" | "notExists";
  }[];
}

/**
 * Schema definition for a single form field used in DynamicForm / FormWizard.
 *
 * Drop a FormFieldSchema object into a schema array and the form engine handles
 * rendering, validation, conditional visibility, and state — no boilerplate needed.
 */
export interface FormFieldSchema {
  // ─── Identity ────────────────────────────────────────────────────────────

  /** Unique field name. Used as the key in the submitted form data. */
  name: string;

  /** Label displayed above the field. */
  label: string;

  /** Field type — determines which renderer is used. */
  type: FieldType;

  // ─── Value & State ───────────────────────────────────────────────────────

  /** Pre-set value on mount. */
  defaultValue?: unknown;

  /** Mark the field as required (triggers built-in required validation). */
  required?: boolean;

  /**
   * Make the field required only when the specified conditions are met.
   * Combined with `required: true` via OR — either alone is enough to require the field.
   *
   * @example
   * requiredWhen: {
   *   conditions: [{ field: "role", value: "admin", operator: "equals" }]
   * }
   */
  requiredWhen?: ConditionConfig;

  /** Disable user interaction. */
  disabled?: boolean;

  /**
   * Disable the field when the specified conditions are met.
   * Combined with `disabled: true` via OR — either alone disables the field.
   *
   * @example
   * disabledWhen: {
   *   conditions: [{ field: "plan", value: "free", operator: "equals" }]
   * }
   */
  disabledWhen?: ConditionConfig;

  /** Make the field read-only (value visible but not editable). */
  readOnly?: boolean;

  /** HTML input placeholder. */
  placeholder?: string;

  // ─── Validation ──────────────────────────────────────────────────────────

  /** Run validation only when the field is blurred, not on every keystroke. */
  showErrorOnBlur?: boolean;

  /** Static error message that overrides all validation messages. */
  errorText?: string;

  /** Derive the error message dynamically from the RHF error object. */
  getErrorMessage?: (error: any) => string;

  /** Validation rules (pattern, length, and custom function). */
  validation?: {
    pattern?: { value: RegExp; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    /**
     * Field-level validation. Receives the field's current value and,
     * optionally, the entire form values object — useful for cross-field
     * checks (e.g. confirm-password must match password).
     * Return true when valid, or an error message string when invalid.
     *
     * Alias of `custom` — prefer `validate` for clarity.
     */
    validate?: (value: any, formValues?: Record<string, any>) => boolean | string | Promise<boolean | string>;
    /**
     * @deprecated Use `validate` instead.
     * Kept for backward compatibility — both are supported simultaneously.
     */
    custom?: (value: any, formValues?: Record<string, any>) => boolean | string | Promise<boolean | string>;
  };

  // ─── Conditional Visibility ───────────────────────────────────────────────

  /**
   * Show this field only when the specified conditions are met.
   * When the field is hidden its value is reset (unless preserveValue is true).
   *
   * @example
   * visibleWhen: {
   *   logic: "AND",
   *   conditions: [{ field: "role", value: "admin", operator: "equals" }]
   * }
   */
  visibleWhen?: ConditionConfig;

  /** Keep the stored value when the field is hidden. Default: false (value is cleared). */
  preserveValue?: boolean;

  // ─── Layout ───────────────────────────────────────────────────────────────

  /**
   * Number of grid columns this field should span inside DynamicForm's grid.
   * Requires the parent DynamicForm to use a multi-column layout (columns prop > 1).
   */
  colSpan?: number;

  /**
   * Make this field span the full form width regardless of the column count.
   * Shorthand for colSpan that spans all columns.
   */
  fullWidth?: boolean;

  // ─── Input Formatting ────────────────────────────────────────────────────

  /**
   * Transform the raw input value on every keystroke before storing it.
   * Useful for masks: phone numbers, SSNs, credit cards, etc.
   * Return the formatted string — that value is what gets stored in the form.
   *
   * @example
   * inputFormatter: (value) => {
   *   const d = value.replace(/\D/g, "");
   *   if (d.length <= 3) return d;
   *   if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`;
   *   return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6,10)}`;
   * }
   */
  inputFormatter?: (value: string) => string;

  /** Block characters that don't match this regex on keydown. */
  allowedPattern?: RegExp;

  /** HTML inputMode hint for mobile keyboards. */
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url" | "search";

  // ─── Appearance & UX ─────────────────────────────────────────────────────

  /** Per-field dark/light theme override. */
  theme?: "dark" | "light";

  /** Tooltip text shown on hover (rendered via title attribute on a ? icon). */
  tooltip?: string;

  /** Icon node displayed inside the label. */
  icon?: React.ReactNode;

  /** Help text shown near the field. Position controlled by helpTextAlignment. */
  helpText?: string;
  helpTextClass?: string;
  helpTextStyle?: React.CSSProperties;

  /**
   * Where to position per-option help text for radio/checkbox fields.
   * - "underLabel" (default): indented under the option label text.
   * - "underButton": directly under the radio/checkbox circle.
   */
  helpTextAlignment?: "underLabel" | "underButton";

  maxLength?: number;
  minLength?: number;

  /** Show word count below a textarea. */
  showWordCount?: boolean;

  /** Number of visible text rows (textarea only). */
  rows?: number;

  // ─── Number / Date / Slider ───────────────────────────────────────────────

  /** Minimum allowed value. Used by number, date, and slider fields. */
  min?: number | string;

  /** Maximum allowed value. Used by number, date, and slider fields. */
  max?: number | string;

  /** Increment step. Used by number and slider fields. */
  step?: number;

  // ─── File field ──────────────────────────────────────────────────────────
  /** Accepted MIME types / extensions, e.g. "image/*,.pdf". Forwarded to the input's accept attr. */
  accept?: string;
  /** Allow selecting multiple files. */
  multiple?: boolean;

  // ─── Slider field ────────────────────────────────────────────────────────
  /** Show the current slider value inline next to the label. Default: true. */
  showSliderValue?: boolean;

  // ─── Rating field ────────────────────────────────────────────────────────
  /** Number of stars to render. Default: 5. */
  starCount?: number;

  // ─── Field array ─────────────────────────────────────────────────────────
  /** Label for the "Add row" button. Default: "+ Add". */
  addButtonLabel?: string;
  /** Label for the "Remove row" button. Default: "Remove". */
  removeButtonLabel?: string;

  /** Icon before the input (textarea). */
  prefixIcon?: React.ReactNode;

  /** Icon after the input (textarea). */
  suffixIcon?: React.ReactNode;

  // ─── Options (select / radio / checkbox) ─────────────────────────────────

  options?: {
    label: string;
    value: string;
    helpText?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    tooltip?: string;
    helpTextAlignment?: "underLabel" | "underButton";
  }[];

  /** Fetch options asynchronously. Receives the value of the dependsOn field. */
  getOptions?: (
    parentValue: any
  ) =>
    | { label: string; value: string }[]
    | Promise<{ label: string; value: string }[]>;

  /** API endpoint URL to fetch options from. */
  apiEndpoint?: string;

  /**
   * Name of another field (or multiple fields) whose value(s) are passed to
   * getOptions / apiEndpoint when they change.
   *
   * - Single string: `dependsOn: "country"` — passed as `?country=CA`
   * - Array: `dependsOn: ["country", "tier"]` — passed as `?country=CA&tier=pro`
   *   and `getOptions` receives `{ country: "CA", tier: "pro" }` instead of a single value.
   */
  dependsOn?: string | string[];

  // ─── Event Handlers ──────────────────────────────────────────────────────

  /** Raw DOM change event (prefer onValueChange for most use cases). */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLInputElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLInputElement>) => void;
  onMouseOver?: (event: React.MouseEvent<HTMLInputElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLInputElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void;

  /** Called immediately when the value changes. */
  onValueChange?: (
    value: any,
    utils: {
      setValue: ReturnType<typeof useFormContext>["setValue"];
      getValues: ReturnType<typeof useFormContext>["getValues"];
      trigger: ReturnType<typeof useFormContext>["trigger"];
    }
  ) => void;

  /** Like onValueChange but debounced. Great for async lookups / API calls. */
  onValueChangeDebounced?: (
    value: any,
    utils: {
      setValue: ReturnType<typeof useFormContext>["setValue"];
      getValues: ReturnType<typeof useFormContext>["getValues"];
      trigger: ReturnType<typeof useFormContext>["trigger"];
    }
  ) => Promise<void> | void;

  /** Debounce delay in milliseconds for onValueChangeDebounced. Default: 500. */
  debounceMs?: number;

  // ─── Styling ─────────────────────────────────────────────────────────────

  wrapperClass?: string;
  wrapperStyle?: React.CSSProperties;
  labelClass?: string;
  labelStyle?: React.CSSProperties;
  inputClass?: string;
  inputStyle?: React.CSSProperties;
  errorClass?: string;
  errorStyle?: React.CSSProperties;

  /** Label used instead of `label` on a single-checkbox field. */
  checkboxLabel?: string;
  checkboxGroupClass?: string;
  checkBoxGroupStyle?: React.CSSProperties;

  radioGroupClass?: string;
  radioGroupStyle?: React.CSSProperties;
  /** Render radio buttons in a horizontal row. */
  inline?: boolean;

  optionWrapperClass?: string;
  optionWrapperStyle?: React.CSSProperties;

  // ─── Group / MultiField ──────────────────────────────────────────────────

  /** Child fields rendered inside a group (type: "group"). */
  children?: FormFieldSchema[];

  /**
   * Sub-fields rendered side-by-side in a horizontal row (type: "multiField").
   * Each entry is a complete FormFieldSchema. Use layoutStyle/layoutClass for
   * flex/grid control over the row container.
   */
  multipleField?: FormFieldSchema[];

  /** CSS class applied to the group/multiField layout container. */
  layoutClass?: string;
  /** Inline style applied to the group/multiField layout container. */
  layoutStyle?: React.CSSProperties;

  /**
   * Controls how much of the multiField row this sub-field occupies.
   * Maps directly to the CSS `flex` shorthand on the sub-field's container.
   *
   * @example
   * // First Name takes 3× as much space as Middle Initial:
   * { name: "firstName", flex: 3 }
   * { name: "mi",        flex: 1 }
   *
   * // Fixed width (exact pixel or rem value):
   * { name: "zip", flex: "0 0 120px" }
   *
   * Omit to use the default equal distribution (flex: 1).
   * Only meaningful when this field is a sub-field inside `multipleField`.
   */
  flex?: number | string;

  // ─── Custom Rendering ─────────────────────────────────────────────────────

  /**
   * Render a completely custom UI for this field while still integrating with
   * react-hook-form state. The engine still handles visibleWhen, value clearing,
   * and error resolution — you only control the DOM.
   */
  render?: (fieldProps: {
    name: string;
    error?: any;
    register: any;
    defaultValue?: any;
  }) => React.ReactNode;

  /**
   * Drop-in replacement component. Receives the full field config plus RHF
   * integration props. Use for reusable custom field types across forms.
   */
  overrideComponent?: React.FC<{
    field: FormFieldSchema;
    name: string;
    error?: any;
    register: any;
  }>;

  /** Extra props forwarded to overrideComponent. */
  overrideComponentProps?: Record<string, any>;
}
