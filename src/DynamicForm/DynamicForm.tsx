import React, { useEffect, useImperativeHandle, useState } from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import FormEngine from "FormEngine";
import type { FormFieldSchema } from "./types/FormFieldSchema";
import { FormThemeContext, type FormTheme, cx } from "./theme/FormTheme";

export interface DynamicFormHandle {
  /** Direct access to the underlying react-hook-form methods */
  form: UseFormReturn;
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

interface DynamicFormProps {
  schema: FormFieldSchema[];
  onSubmit: (values: any) => void;

  /** Pre-fill form fields on mount */
  defaultValues?: Record<string, any>;

  /** react-hook-form validation trigger mode (default: "onSubmit") */
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";

  /** Ref that exposes the underlying react-hook-form instance */
  formRef?: React.Ref<DynamicFormHandle>;

  /** Form-wide CSS class name / style theme — applied to all fields as defaults */
  theme?: FormTheme;

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

const defaultFormStyle: React.CSSProperties = {
  background: "#fff",
  boxShadow: "0 4px 24px 0 rgba(30, 41, 59, 0.10)",
  borderRadius: "1rem",
  padding: "1.5rem",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.25rem 1.5rem",
  maxWidth: 800
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
    showReset = false,
    onReset,
    columns,
    gap,
    maxWidth,
    renderSubmitButton,
    renderResetButton,
    submitButtonIcon,
    resetButtonIcon,
  },
  ref
) => {
  const methods = useForm({ defaultValues, mode });
  const { isSubmitting, isValid, isDirty } = methods.formState;

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

  const mergedFormStyle: React.CSSProperties = isUnstyled
    ? { display: "grid", gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, ...formStyle }
    : {
        ...defaultFormStyle,
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: gap ?? defaultFormStyle.gap,
        maxWidth: maxWidth ?? defaultFormStyle.maxWidth,
        ...formStyle
      };

  const resolvedSubmitBtnStyle = isUnstyled
    ? submitButtonStyle
    : { ...defaultButtonStyle, ...submitButtonStyle };

  const resolvedResetBtnStyle = isUnstyled
    ? resetButtonStyle
    : { ...defaultButtonStyle, ...resetButtonStyle };

  return (
    <FormThemeContext.Provider value={theme}>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
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
  );
};

const DynamicForm = React.forwardRef(DynamicFormInner);
DynamicForm.displayName = "DynamicForm";

export default DynamicForm;
