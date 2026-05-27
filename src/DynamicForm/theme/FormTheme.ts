import { createContext, useContext } from "react";
import type { CSSProperties, FC } from "react";
import type { FormFieldSchema } from "../types/FormFieldSchema";

/**
 * Props passed to every component registered in theme.components.
 * Mirrors the props that built-in field renderers receive.
 */
export interface FieldComponentProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

/**
 * Drop-in replacements for built-in field renderers, keyed by field type.
 * Registered once at the theme level — no per-field boilerplate required.
 *
 * @example
 * // Swap every `date` field for your custom picker and every `select`
 * // for react-select, without touching individual field schemas:
 * theme={{
 *   components: {
 *     date:   MyDatePickerField,
 *     select: MyReactSelectField,
 *   }
 * }}
 */
export interface FormThemeComponents {
  text?:        FC<FieldComponentProps>;
  email?:       FC<FieldComponentProps>;
  number?:      FC<FieldComponentProps>;
  textarea?:    FC<FieldComponentProps>;
  select?:      FC<FieldComponentProps>;
  radio?:       FC<FieldComponentProps>;
  checkbox?:    FC<FieldComponentProps>;
  date?:        FC<FieldComponentProps>;
  file?:        FC<FieldComponentProps>;
  slider?:      FC<FieldComponentProps>;
  rating?:      FC<FieldComponentProps>;
  fieldArray?:  FC<FieldComponentProps>;
  /** Catch-all for custom field types not listed above. */
  [type: string]: FC<FieldComponentProps> | undefined;
}

/**
 * Semantic class name slots and inline style defaults for every structural
 * element the form engine renders.
 * Pass a FormTheme at <DynamicForm> or <FormWizard> level once and all
 * fields inherit it.
 *
 * Priority order (lowest → highest):
 *   library defaults → theme styles/classes → per-field styles/classes
 *
 * When unstyled: true, all built-in inline styles are suppressed so your
 * CSS framework (Bootstrap, Tailwind, MUI, etc.) owns the appearance.
 * Theme-level styles still apply — they are considered consumer intent,
 * not library defaults.
 */
export interface FormTheme {
  /** Strip all built-in inline styles. Use when a CSS framework controls all styling. */
  unstyled?: boolean;

  // ─── Class name slots ────────────────────────────────────────────────────

  wrapperClass?: string;
  labelClass?: string;
  /**
   * Applied to text, email, number, textarea, select, date, file, and slider
   * inputs. NOT applied to radio or checkbox inputs — use radioInputClass /
   * checkboxInputClass for those so text-specific styles (w-full, border,
   * rounded, px-3 py-2.5, etc.) never bleed into toggle controls.
   */
  inputClass?: string;
  /** Applied in addition to inputClass when the field has a validation error. */
  inputErrorClass?: string;
  errorClass?: string;
  helpTextClass?: string;
  radioGroupClass?: string;
  /**
   * Class applied to each radio <input> element.
   * When set, REPLACES inputClass for radio inputs so you can style toggle
   * controls independently of text inputs.
   * @example radioInputClass: "h-4 w-4 cursor-pointer accent-blue-600"
   */
  radioInputClass?: string;
  checkboxGroupClass?: string;
  /**
   * Class applied to each checkbox <input> element.
   * When set, REPLACES inputClass for checkbox inputs.
   * @example checkboxInputClass: "h-4 w-4 cursor-pointer accent-blue-600"
   */
  checkboxInputClass?: string;
  optionWrapperClass?: string;
  groupLayoutClass?: string;
  /** Class applied to the required marker span. Default renders a red asterisk. */
  requiredMarkClass?: string;
  submitButtonClass?: string;
  resetButtonClass?: string;
  extraButtonClass?: string;
  wizardClass?: string;
  stepperClass?: string;
  navigationClass?: string;

  // ─── Theme-level inline styles ───────────────────────────────────────────
  // Apply once at the theme level instead of repeating on every field schema.
  // Per-field *Style props always win over these.

  /**
   * Base style for every input / select / textarea across all fields.
   * Merged on top of library defaults (when not unstyled), then per-field
   * inputStyle is merged on top of this.
   *
   * @example
   * // Design system applied once:
   * inputStyle: { borderWidth: "1.5px", borderColor: "#6B748E", borderRadius: "8px", height: "48px" }
   */
  inputStyle?: CSSProperties;

  /**
   * Base style for every field label.
   * Merged on top of library defaults, overridden by per-field labelStyle.
   */
  labelStyle?: CSSProperties;

  /**
   * Base style for every field's outer wrapper div.
   * Used as fallback when the field does not provide its own wrapperStyle.
   */
  wrapperStyle?: CSSProperties;

  /**
   * Base style for every field's error message element.
   * Used as fallback when the field does not provide its own errorStyle.
   */
  errorStyle?: CSSProperties;

  /**
   * Base style for every field's help text element.
   * Used as fallback when the field does not provide its own helpTextStyle.
   */
  helpTextStyle?: CSSProperties;

  // ─── Component registry ──────────────────────────────────────────────────

  /**
   * Swap out built-in field renderers with your own components at the
   * theme level. Applied after per-field `overrideComponent` (field always wins).
   *
   * Your component receives the same props as any built-in renderer:
   * `{ field, name, error, register }`.
   */
  components?: FormThemeComponents;
}

export const FormThemeContext = createContext<FormTheme>({});

export function useFormTheme(): FormTheme {
  return useContext(FormThemeContext);
}

/** Merge order: theme default → per-field prop (field wins) */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
