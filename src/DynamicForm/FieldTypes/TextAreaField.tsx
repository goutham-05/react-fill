import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { useDebounce } from "../utils/useDebounce";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface TextAreaFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const TextAreaFieldComponent: React.FC<TextAreaFieldProps> = ({ field, name, error }) => {
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
  const isUnstyled = theme.unstyled;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    controllerField.onChange(e);
    field.onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
    field.onValueChange?.(value, { setValue, getValues, trigger });
    if (error && field.showErrorOnBlur) trigger(name);
    if (field.onValueChangeDebounced) {
      triggerDebounce(
        () => field.onValueChangeDebounced!(value, { setValue, getValues, trigger }),
        field.debounceMs ?? 500
      );
    }
  };

  const wrapperStyle = field.wrapperStyle ?? theme.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? theme.labelStyle ?? (isUnstyled ? undefined : {
    display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "14px", color: "#333"
  });
  const inputStyle: React.CSSProperties = isUnstyled
    ? { ...theme.inputStyle, ...field.inputStyle }
    : {
        padding: "10px", border: "1px solid",
        borderColor: error ? "#f87171" : "#ccc",
        borderRadius: "6px", fontSize: "14px", width: "100%", minHeight: "100px",
        backgroundColor: "#fff", color: "#111827", outline: "none",
        boxSizing: "border-box", transition: "border-color 0.2s ease-in-out",
        opacity: field.disabled ? 0.6 : 1,
        cursor: field.disabled ? "not-allowed" : "text",
        ...theme.inputStyle,
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? theme.helpTextStyle ?? (isUnstyled ? undefined : { fontSize: "12px", marginTop: "4px", color: "#4b5563" });
  const errorStyle = field.errorStyle ?? theme.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  const value = controllerField.value ?? "";
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label
        htmlFor={name}
        className={cx(theme.labelClass, field.labelClass)}
        style={labelStyle}
      >
        {field.label}
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        {field.tooltip && (
          <span title={field.tooltip} style={{ marginLeft: "6px", cursor: "help" }}>ℹ️</span>
        )}
        {loading && <span style={{ fontSize: "0.75rem", marginLeft: "6px" }}>⏳</span>}
      </label>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {field.prefixIcon && <span style={{ marginRight: "6px" }}>{field.prefixIcon}</span>}

        <textarea
          id={name}
          aria-invalid={!!error}
          aria-required={field.required}
          aria-disabled={field.disabled}
          aria-describedby={field.helpText ? `${name}-description` : undefined}
          value={value}
          rows={field.rows}
          minLength={field.minLength}
          maxLength={field.maxLength}
          readOnly={field.readOnly}
          onChange={handleChange}
          onBlur={(e) => {
            controllerField.onBlur();
            field.onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
            if (field.showErrorOnBlur) trigger(name);
          }}
          className={cx(theme.inputClass, error ? theme.inputErrorClass : undefined, field.inputClass)}
          style={inputStyle}
          disabled={field.disabled}
        />

        {field.suffixIcon && <span style={{ marginLeft: "6px" }}>{field.suffixIcon}</span>}
      </div>

      {field.helpText && (
        <p
          id={`${name}-description`}
          className={cx(theme.helpTextClass, field.helpTextClass)}
          style={helpTextStyle}
        >
          {field.helpText}
        </p>
      )}

      {(field.maxLength || field.showWordCount) && (
        <div style={{ fontSize: "12px", marginTop: "4px", textAlign: "right", color: "#4b5563" }}>
          {field.showWordCount && <span>{wordCount} words</span>}
          {field.maxLength && <span> {value.length}/{field.maxLength}</span>}
        </div>
      )}

      {error && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(TextAreaFieldComponent);
