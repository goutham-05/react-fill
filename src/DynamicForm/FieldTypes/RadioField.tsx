import React from "react";
import { useFormContext, useController } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { useDebounce } from "../utils/useDebounce";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";
import { useAsyncOptions } from "../utils/useAsyncOptions";

interface RadioFieldProps {
  field: FormFieldSchema;
  name: string;
  register: any;
  error?: any;
}

const RadioFieldComponent: React.FC<RadioFieldProps> = ({ field, name, error }) => {
  const { control, setValue, getValues, trigger } = useFormContext();
  const { trigger: triggerDebounce } = useDebounce();
  const theme = useFormTheme();
  const { options, loading, fetchError } = useAsyncOptions(field);
  const isDarkMode = field.theme === "dark";
  const isUnstyled = theme.unstyled;

  const {
    field: controllerField,
    fieldState: { error: fieldError }
  } = useController({
    name,
    control,
    rules: { required: field.required, validate: field.validation?.validate ?? field.validation?.custom }
  });

  const handleChange = (value: string, event: React.ChangeEvent<HTMLInputElement>) => {
    controllerField.onChange(value);
    field.onChange?.(event);
    field.onValueChange?.(value, { setValue, getValues, trigger });
    if ((error || fieldError) && field.showErrorOnBlur) trigger(name);
    if (field.onValueChangeDebounced) {
      triggerDebounce(
        () => field.onValueChangeDebounced!(value, { setValue, getValues, trigger }),
        field.debounceMs ?? 500
      );
    }
  };

  const wrapperStyle = field.wrapperStyle ?? theme.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? theme.labelStyle ?? (isUnstyled ? undefined : {
    display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "14px",
    color: isDarkMode ? "#e5e7eb" : "#333"
  });
  const radioGroupStyle = field.radioGroupStyle ?? (isUnstyled ? undefined : {
    display: "flex",
    flexDirection: field.inline ? "row" : ("column" as React.CSSProperties["flexDirection"]),
    gap: "0.75rem",
    alignItems: field.inline ? "center" : "flex-start",
    flexWrap: field.inline ? ("wrap" as React.CSSProperties["flexWrap"]) : ("nowrap" as React.CSSProperties["flexWrap"])
  });
  const radioInputStyle = {
    width: "16px", height: "16px", accentColor: "#004DB2",
    cursor: field.disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    ...theme.inputStyle,
    ...field.inputStyle
  };
  const helpTextStyle = field.helpTextStyle ?? theme.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", color: isDarkMode ? "#9ca3af" : "#4b5563", marginTop: "4px"
  });
  const errorStyle = field.errorStyle ?? theme.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });
  const hasError = !!(error || fieldError);

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label className={cx(theme.labelClass, field.labelClass)} style={labelStyle}>
        {field.label}
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        {loading && <span style={{ fontSize: "0.75rem" }}> ⏳</span>}
      </label>

      <div className={cx(theme.radioGroupClass, field.radioGroupClass)} style={radioGroupStyle}>
        {loading && (
          <span style={isUnstyled ? undefined : { fontSize: "13px", color: "#4b5563" }}>
            Loading options…
          </span>
        )}
        {!loading && fetchError && (
          <span style={isUnstyled ? undefined : { fontSize: "13px", color: "#d97706" }}>
            {fetchError}
          </span>
        )}
        {!loading && options.map((option) => {
          const helpTextAlignment = option.helpTextAlignment ?? "underLabel";
          const inputId = `${name}-${option.value}`;
          const isSelected = controllerField.value === option.value;

          return (
            <div key={option.value} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <label
                htmlFor={inputId}
                className={cx(theme.optionWrapperClass, field.optionWrapperClass)}
                style={{ display: "flex", alignItems: "center", gap: "8px", cursor: field.disabled ? "not-allowed" : "pointer" }}
                title={option.tooltip}
              >
                <input
                  id={inputId}
                  type="radio"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => handleChange(e.target.value, e)}
                  onBlur={() => { if (field.showErrorOnBlur) trigger(name); }}
                  className={cx(theme.radioInputClass ?? theme.inputClass, field.inputClass)}
                  style={isUnstyled ? { ...theme.inputStyle, ...field.inputStyle } : radioInputStyle}
                  disabled={field.disabled || option.disabled}
                  aria-describedby={option.helpText ? `${inputId}-desc` : undefined}
                />
                <span style={isUnstyled ? undefined : {
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontSize: "14px",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "#004DB2" : undefined
                }}>
                  {option.icon && <span style={{ flexShrink: 0 }}>{option.icon}</span>}
                  {option.label}
                </span>
              </label>

              {option.helpText && (
                <div
                  id={`${inputId}-desc`}
                  role="note"
                  style={{ ...helpTextStyle, marginLeft: helpTextAlignment === "underLabel" ? "24px" : "0" }}
                >
                  {option.helpText}
                </div>
              )}
            </div>
          );
        })}
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

      {hasError && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error || fieldError, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(RadioFieldComponent);
