import React, { useCallback } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FormFieldSchema } from "../types/FormFieldSchema";
import { FIELD_TYPES } from "../types/constant";
import { useDebounce } from "../utils/useDebounce";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface TextFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const TextFieldComponent: React.FC<TextFieldProps> = ({ field, name, error }) => {
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
  const helpTextPosition = field.helpTextAlignment ?? "underLabel";
  const isUnstyled = theme.unstyled;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const value = field.inputFormatter ? field.inputFormatter(raw) : raw;

      // Pass the formatted value directly to RHF — avoids constructing a fake
      // synthetic event and works correctly with all RHF internals.
      if (field.inputFormatter) {
        controllerField.onChange(value);
      } else {
        controllerField.onChange(e);
      }

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
    [field, setValue, getValues, trigger, controllerField, triggerDebounce, error, name]
  );

  const wrapperStyle = field.wrapperStyle ?? theme.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? theme.labelStyle ?? (isUnstyled ? undefined : {
    display: "flex", alignItems: "center", gap: "0.4rem",
    marginBottom: "6px", fontWeight: 500, fontSize: "14px", color: "#333"
  });
  const inputStyle = isUnstyled
    ? { ...theme.inputStyle, ...field.inputStyle }
    : {
        padding: "10px", border: "1px solid",
        borderColor: error ? "#f87171" : "#ccc",
        borderRadius: "6px", fontSize: "14px", width: "100%",
        backgroundColor: "#fff", color: "#111827", outline: "none",
        boxSizing: "border-box" as const, transition: "border-color 0.2s ease-in-out",
        opacity: field.disabled ? 0.6 : 1,
        cursor: field.disabled ? "not-allowed" : "text",
        ...theme.inputStyle,
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? theme.helpTextStyle ?? (isUnstyled ? undefined : { fontSize: "12px", marginTop: "4px", color: "#4b5563" });
  const errorStyle = field.errorStyle ?? theme.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label
        htmlFor={name}
        className={cx(theme.labelClass, field.labelClass)}
        style={labelStyle}
      >
        {field.label}
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        {field.icon}
        {field.tooltip && (
          <span title={field.tooltip} style={{ cursor: "help", fontSize: "13px" }}>❓</span>
        )}
        {loading && <span style={{ fontSize: "0.75rem" }}>⏳</span>}
      </label>

      {helpTextPosition === "underLabel" && field.helpText && (
        <p id={`${name}-description`} className={cx(theme.helpTextClass, field.helpTextClass)} style={helpTextStyle}>
          {field.helpText}
        </p>
      )}

      <input
        id={name}
        type={field.type === FIELD_TYPES.ADDITIONAL_EMAIL ? "email" : field.type}
        placeholder={field.placeholder}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={field.helpText ? `${name}-description` : undefined}
        inputMode={field.inputMode}
        value={controllerField.value ?? ""}
        minLength={field.minLength}
        maxLength={field.maxLength}
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
        className={cx(theme.inputClass, error ? theme.inputErrorClass : undefined, field.inputClass)}
        style={inputStyle}
        disabled={field.disabled}
        readOnly={field.readOnly}
      />

      {helpTextPosition !== "underLabel" && field.helpText && (
        <p id={`${name}-description`} className={cx(theme.helpTextClass, field.helpTextClass)} style={helpTextStyle}>
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

export default React.memo(TextFieldComponent);
