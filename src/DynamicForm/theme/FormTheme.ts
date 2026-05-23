import { createContext, useContext } from "react";

/**
 * Semantic class name slots for every structural element the form engine renders.
 * Pass a FormTheme at <DynamicForm> or <FormWizard> level once and all fields inherit it.
 *
 * Per-field *Class props (e.g. field.inputClass) still override these — they are the
 * last-mile escape hatch for one-off overrides.
 *
 * When unstyled: true, all built-in inline styles are suppressed so your CSS framework
 * (Bootstrap, Tailwind, MUI, etc.) owns the appearance entirely.
 */
export interface FormTheme {
  /** Strip all built-in inline styles. Use when a CSS framework controls all styling. */
  unstyled?: boolean;

  // --- Field wrapper ---
  wrapperClass?: string;

  // --- Label ---
  labelClass?: string;

  // --- Input / select / textarea ---
  inputClass?: string;
  /** Applied in addition to inputClass when the field has a validation error */
  inputErrorClass?: string;

  // --- Error message ---
  errorClass?: string;

  // --- Help text ---
  helpTextClass?: string;

  // --- Radio / checkbox group container ---
  radioGroupClass?: string;
  checkboxGroupClass?: string;

  // --- Individual radio/checkbox option row ---
  optionWrapperClass?: string;

  // --- Group field layout container ---
  groupLayoutClass?: string;

  // --- Required field marker (*) ---
  /** Class applied to the required marker span. Default renders a red asterisk. */
  requiredMarkClass?: string;

  // --- DynamicForm / FormWizard buttons ---
  submitButtonClass?: string;
  resetButtonClass?: string;
  extraButtonClass?: string;

  // --- FormWizard specific ---
  wizardClass?: string;
  stepperClass?: string;
  navigationClass?: string;
}

export const FormThemeContext = createContext<FormTheme>({});

export function useFormTheme(): FormTheme {
  return useContext(FormThemeContext);
}

/** Merge order: theme default → per-field prop (field wins) */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
