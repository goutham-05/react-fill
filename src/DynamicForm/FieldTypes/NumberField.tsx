import React, { useCallback } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { useDebounce } from "../utils/useDebounce";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface NumberFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const NumberFieldComponent: React.FC<NumberFieldProps> = ({ field, name, error }) => {
  const { setValue, getValues, trigger, control } = useFormContext();
  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? "",
    rules: {
      required: field.required,
      pattern: field.validation?.pattern,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      validate: field.validation?.validate ?? field.validation?.custom
    }
  });

  const theme = useFormTheme();
  const { loading, trigger: triggerDebounce } = useDebounce();
  const isDarkMode = field.theme === "dark";
  const isNumberField = field.type === "number";
  const isUnstyled = theme.unstyled;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = isNumberField ? +e.target.value : e.target.value;
      controllerField.onChange(e);
      field.onChange?.(e);
      field.onValueChange?.(value, { setValue, getValues, trigger });
      if (error && field.showErrorOnBlur) trigger(name);
      if (field.onValueChangeDebounced) {
        triggerDebounce(
          () => field.onValueChangeDebounced!(value, { setValue, getValues, trigger }),
          field.debounceMs ?? 500
        );
      }
    },
    [controllerField, field, isNumberField, setValue, getValues, trigger, error, name, triggerDebounce]
  );

  const wrapperStyle = field.wrapperStyle ?? theme.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? theme.labelStyle ?? (isUnstyled ? undefined : {
    display: "flex", alignItems: "center", gap: "6px",
    marginBottom: "6px", fontWeight: 500, fontSize: "14px",
    color: isDarkMode ? "#e5e7eb" : "#333"
  });
  const inputStyle = isUnstyled
    ? { ...theme.inputStyle, ...field.inputStyle }
    : {
        padding: "10px", border: "1px solid",
        borderColor: error ? "#f87171" : isDarkMode ? "#4b5563" : "#ccc",
        borderRadius: "6px", fontSize: "14px", width: "100%",
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        color: isDarkMode ? "#f9fafb" : "#111827",
        outline: "none", boxSizing: "border-box" as const,
        transition: "border-color 0.2s ease-in-out",
        opacity: field.disabled ? 0.6 : 1,
        cursor: field.disabled ? "not-allowed" : "text",
        ...theme.inputStyle,
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? theme.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px",
    color: isDarkMode ? "#9ca3af" : "#4b5563"
  });
  const errorStyle = field.errorStyle ?? theme.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label
        htmlFor={name}
        className={cx(theme.labelClass, field.labelClass)}
        style={labelStyle}
      >
        {field.icon && <span>{field.icon}</span>}
        <span title={field.tooltip}>{field.label}</span>
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        {loading && <span style={{ fontSize: "0.75rem" }}>⏳</span>}
      </label>

      <input
        id={name}
        type={isNumberField ? "number" : "text"}
        inputMode={field.inputMode ?? (isNumberField ? "numeric" : "text")}
        placeholder={field.placeholder}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={field.helpText ? `${name}-description` : undefined}
        value={controllerField.value ?? ""}
        onChange={handleChange}
        onBlur={(e) => {
          field.onBlur?.(e);
          if (field.showErrorOnBlur) trigger(name);
        }}
        onKeyDown={(e) => {
          if (field.allowedPattern) {
            const char = e.key;
            const isControl = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(char);
            if (!isControl && !field.allowedPattern.test(char)) e.preventDefault();
          }
          field.onKeyDown?.(e);
        }}
        min={field.min as number | undefined}
        max={field.max as number | undefined}
        step={field.step}
        readOnly={field.readOnly}
        className={cx(theme.inputClass, error ? theme.inputErrorClass : undefined, field.inputClass)}
        style={inputStyle}
        disabled={field.disabled}
      />

      {field.helpText && (
        <p
          id={`${name}-description`}
          className={cx(theme.helpTextClass, field.helpTextClass)}
          style={helpTextStyle}
        >
          {field.helpText}
        </p>
      )}

      {error && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(NumberFieldComponent);
