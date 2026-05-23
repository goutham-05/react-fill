import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface SliderFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const SliderFieldComponent: React.FC<SliderFieldProps> = ({ field, name, error }) => {
  const { setValue, getValues, trigger, control } = useFormContext();
  const min = (field.min as number) ?? 0;
  const max = (field.max as number) ?? 100;
  const step = field.step ?? 1;

  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? min,
    rules: {
      required: field.required
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
        width: "100%",
        accentColor: isDarkMode ? "#6366f1" : "#4f46e5",
        opacity: field.disabled ? 0.6 : 1,
        cursor: field.disabled ? "not-allowed" : "pointer",
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px",
    color: isDarkMode ? "#9ca3af" : "#6b7280"
  });
  const errorStyle = field.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  const minMaxStyle = isUnstyled
    ? undefined
    : {
        display: "flex", justifyContent: "space-between",
        fontSize: "12px", marginTop: "4px",
        color: isDarkMode ? "#9ca3af" : "#6b7280"
      };

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
        <span style={isUnstyled ? undefined : {
          marginLeft: "auto", fontWeight: 600,
          color: isDarkMode ? "#a5b4fc" : "#4f46e5"
        }}>
          {controllerField.value}
        </span>
      </label>

      <input
        id={name}
        type="range"
        min={min}
        max={max}
        step={step}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={controllerField.value}
        aria-describedby={field.helpText ? `${name}-description` : undefined}
        value={controllerField.value ?? min}
        onChange={(e) => {
          const value = Number(e.target.value);
          controllerField.onChange(value);
          field.onValueChange?.(value, { setValue, getValues, trigger });
        }}
        className={cx(theme.inputClass, field.inputClass)}
        style={inputStyle}
        disabled={field.disabled}
      />

      <div style={minMaxStyle}>
        <span>{min}</span>
        <span>{max}</span>
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

      {error && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(SliderFieldComponent);
