import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface DateFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const DateFieldComponent: React.FC<DateFieldProps> = ({ field, name, error }) => {
  const { setValue, getValues, trigger, control } = useFormContext();
  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? "",
    rules: {
      required: field.required,
      validate: field.validation?.custom
    }
  });

  const theme = useFormTheme();
  const isDarkMode = field.theme === "dark";
  const isUnstyled = theme.unstyled;

  const wrapperStyle = field.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? (isUnstyled ? undefined : {
    display: "flex", alignItems: "center", gap: "6px",
    marginBottom: "6px", fontWeight: 500, fontSize: "14px",
    color: isDarkMode ? "#e5e7eb" : "#333"
  });
  const inputStyle = isUnstyled
    ? field.inputStyle
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
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px",
    color: isDarkMode ? "#9ca3af" : "#6b7280"
  });
  const errorStyle = field.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

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
      </label>

      <input
        id={name}
        type="date"
        min={field.min}
        max={field.max}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={field.helpText ? `${name}-description` : undefined}
        value={controllerField.value ?? ""}
        onChange={(e) => {
          controllerField.onChange(e);
          field.onValueChange?.(e.target.value, { setValue, getValues, trigger });
          if (error && field.showErrorOnBlur) trigger(name);
        }}
        onBlur={(e) => {
          controllerField.onBlur();
          field.onBlur?.(e);
          if (field.showErrorOnBlur) trigger(name);
        }}
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

export default React.memo(DateFieldComponent);
