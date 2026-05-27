import React, { useEffect, useImperativeHandle, useState } from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import FormEngine from "FormEngine";
import type { FormFieldSchema } from "./types/FormFieldSchema";
import { FormThemeContext, type FormTheme, cx } from "./theme/FormTheme";
import { FieldRegistryContext, type FieldRegistry } from "./registry/FieldRegistry";
import { defaultFieldRegistry } from "./registry/defaultRegistry";

export interface DynamicFormHandle<TValues extends Record<string, any> = Record<string, any>> {
  /** Direct access to the underlying react-hook-form methods */
  form: UseFormReturn<TValues>;
}

/** Flattens nested RHF error objects into a flat list of error messages. */
function flattenErrors(errors: Record<string, any>, prefix = ""): string[] {
  const messages: string[] = [];
  for (const [key, val] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object") {
      if (typeof val.message === "string") {
        messages.push(val.message || `${path} is invalid`);
      } else {
        messages.push(...flattenErrors(val as Record<string, any>, path));
      }
    }
  }
  return messages;
}

/** Props passed to the renderSubmitButton render prop */
export interface SubmitButtonRenderProps {
  /** True while an async onSubmit handler is in progress */
  isSubmitting: boolean;
  /** True when all fields pass validation */
  isValid: boolean;
  /** True when at least one field differs from its default value */
  isDirty: boolean;
  /** The resolved submit label (from the submitLabel prop) */
  label: string;
}

/** Props passed to the renderResetButton render prop */
export interface ResetButtonRenderProps {
  /** The resolved reset label (from the resetLabel prop) */
  label: string;
  /** Call this to reset the form programmatically */
  onReset: () => void;
}

interface DynamicFormProps<TValues extends Record<string, any> = Record<string, any>> {
  schema: FormFieldSchema[];
  onSubmit: (values: TValues) => void | Promise<void>;

  /** Pre-fill form fields on mount */
  defaultValues?: Partial<TValues>;

  /** react-hook-form validation trigger mode (default: "onSubmit") */
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";

  /** Ref that exposes the underlying react-hook-form instance */
  formRef?: React.Ref<DynamicFormHandle>;

  /** Form-wide CSS class name / style theme — applied to all fields as defaults */
  theme?: FormTheme;

  /** Field type → component map. Pass a subset for smaller bundles; defaults to all built-in types. */
  fieldRegistry?: FieldRegistry;

  formStyle?: React.CSSProperties;
  formClassName?: string;
  submitButtonStyle?: React.CSSProperties;
  submitButtonClassName?: string;
  resetButtonStyle?: React.CSSProperties;
  resetButtonClassName?: string;
  submitLabel?: string;
  resetLabel?: string;
  hideSubmitButton?: boolean;
  children?: React.ReactNode;

  /** Accessible name for the form landmark (aria-label). Recommended when multiple forms are on a page. */
  formLabel?: string;
  showReset?: boolean;
  onReset?: () => void;
  columns?: number;
  gap?: string;
  maxWidth?: number | string;

  extraActions?: {
    label: string;
    onClick: () => void;
    type?: "button" | "submit" | "reset";
    style?: React.CSSProperties;
    className?: string;
    icon?: React.ReactNode;
  }[];

  /** Replace the submit button entirely with a custom component.
   *  Receives isSubmitting, isValid, isDirty, and label. */
  renderSubmitButton?: (props: SubmitButtonRenderProps) => React.ReactNode;

  /** Replace the reset button entirely with a custom component. */
  renderResetButton?: (props: ResetButtonRenderProps) => React.ReactNode;

  /** Icon rendered to the left of the built-in submit button label. */
  submitButtonIcon?: React.ReactNode;

  /** Icon rendered to the left of the built-in reset button label. */
  resetButtonIcon?: React.ReactNode;

  /** Show a validation error summary banner above the submit button after a failed submit attempt. */
  showErrorSummary?: boolean;

  /** Heading text inside the error summary banner. Default: "Please fix the following errors:" */
  errorSummaryTitle?: string;

  /** Extra CSS class applied to the error summary container. */
  errorSummaryClass?: string;
}

const defaultButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "0.5rem",
  fontWeight: 600,
  boxShadow: "0 1px 2px 0 rgba(30,41,59,.06)",
  transition: "background 0.18s",
  cursor: "pointer"
};

// Structural grid only — no visual chrome.
// Background, shadow, padding, and border-radius are the consuming app's job.
const defaultFormStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.25rem 1.5rem",
};

const DynamicFormInner: React.ForwardRefRenderFunction<
  DynamicFormHandle,
  DynamicFormProps
> = (
  {
    schema,
    onSubmit,
    defaultValues,
    mode = "onSubmit",
    formRef,
    theme = {},
    fieldRegistry,
    formStyle,
    formClassName,
    submitButtonStyle,
    submitButtonClassName,
    resetButtonStyle,
    resetButtonClassName,
    submitLabel = "Submit",
    resetLabel = "Reset",
    extraActions,
    hideSubmitButton = false,
    children,
    formLabel,
    showReset = false,
    onReset,
    columns,
    gap,
    maxWidth,
    renderSubmitButton,
    renderResetButton,
    submitButtonIcon,
    resetButtonIcon,
    showErrorSummary = false,
    errorSummaryTitle = "Please fix the following errors:",
    errorSummaryClass,
  },
  ref
) => {
  const methods = useForm({ defaultValues, mode });
  const { isSubmitting, isValid, isDirty, errors: formErrors, submitCount } = methods.formState;

  const errorMessages = showErrorSummary && submitCount > 0
    ? flattenErrors(formErrors as Record<string, any>)
    : [];

  useImperativeHandle(ref, () => ({ form: methods }), [methods]);
  useImperativeHandle(formRef, () => ({ form: methods }), [methods]);

  const [isMd, setIsMd] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMd(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const gridColumns = columns ?? (isMd ? 2 : 1);
  const isUnstyled = theme.unstyled;

  const mergedFormStyle: React.CSSProperties = {
    ...defaultFormStyle,
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
    ...(gap ? { gap } : {}),
    ...(maxWidth ? { maxWidth } : {}),
    ...formStyle,
  };

  const resolvedSubmitBtnStyle = isUnstyled
    ? submitButtonStyle
    : { ...defaultButtonStyle, ...submitButtonStyle };

  const resolvedResetBtnStyle = isUnstyled
    ? resetButtonStyle
    : { ...defaultButtonStyle, ...resetButtonStyle };

  return (
    <FieldRegistryContext.Provider value={fieldRegistry ?? defaultFieldRegistry}>
    <FormThemeContext.Provider value={theme}>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          aria-label={formLabel}
          className={formClassName}
          style={mergedFormStyle}
        >
          {children}
          {schema.map((field) => {
            const spanStyle: React.CSSProperties | undefined =
              field.fullWidth
                ? { gridColumn: "1 / -1" }
                : field.colSpan
                  ? { gridColumn: `span ${field.colSpan}` }
                  : undefined;
            return spanStyle ? (
              <div key={field.name} style={spanStyle}>
                <FormEngine field={field} />
              </div>
            ) : (
              <FormEngine key={field.name} field={field} />
            );
          })}

          {showErrorSummary && errorMessages.length > 0 && (
            <div
              role="alert"
              className={errorSummaryClass}
              style={{
                gridColumn: "1 / -1",
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "6px",
                color: "#b91c1c",
                fontSize: "14px"
              }}
            >
              <strong style={{ display: "block", marginBottom: "6px" }}>{errorSummaryTitle}</strong>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {errorMessages.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {(showReset || !hideSubmitButton || extraActions?.length) && (
            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "1rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap"
              }}
            >
              {extraActions?.map((action, index) => (
                <button
                  key={`extra-btn-${index}`}
                  type={action.type ?? "button"}
                  onClick={action.onClick}
                  style={
                    isUnstyled
                      ? action.style
                      : { ...defaultButtonStyle, ...action.style }
                  }
                  className={cx(theme.extraButtonClass, action.className)}
                >
                  {action.icon && (
                    <span style={{ marginRight: 8 }}>{action.icon}</span>
                  )}
                  {action.label}
                </button>
              ))}
              {showReset && (
                renderResetButton
                  ? renderResetButton({
                      label: resetLabel,
                      onReset: () => { methods.reset(); onReset?.(); },
                    })
                  : (
                    <button
                      type="button"
                      style={resolvedResetBtnStyle}
                      className={cx(theme.resetButtonClass, resetButtonClassName)}
                      onClick={() => { methods.reset(); onReset?.(); }}
                    >
                      {resetButtonIcon && (
                        <span style={{ marginRight: 6, verticalAlign: "middle" }}>{resetButtonIcon}</span>
                      )}
                      {resetLabel}
                    </button>
                  )
              )}
              {!hideSubmitButton && (
                renderSubmitButton
                  ? renderSubmitButton({ isSubmitting, isValid, isDirty, label: submitLabel })
                  : (
                    <button
                      type="submit"
                      style={resolvedSubmitBtnStyle}
                      className={cx(theme.submitButtonClass, submitButtonClassName)}
                    >
                      {submitButtonIcon && (
                        <span style={{ marginRight: 6, verticalAlign: "middle" }}>{submitButtonIcon}</span>
                      )}
                      {submitLabel}
                    </button>
                  )
              )}
            </div>
          )}
        </form>
      </FormProvider>
    </FormThemeContext.Provider>
    </FieldRegistryContext.Provider>
  );
};

const DynamicForm = React.forwardRef(DynamicFormInner);
DynamicForm.displayName = "DynamicForm";

export default DynamicForm;
