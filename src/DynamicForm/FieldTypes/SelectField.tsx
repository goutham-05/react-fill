import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";
import { useAsyncOptions } from "../utils/useAsyncOptions";

interface SelectFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const SelectFieldComponent: React.FC<SelectFieldProps> = ({ field, name, error }) => {
  const { control, setValue, getValues, trigger } = useFormContext();
  const {
    field: controllerField,
    fieldState: { error: fieldError }
  } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? "",
    rules: { required: field.required, validate: field.validation?.validate ?? field.validation?.custom }
  });

  const theme = useFormTheme();
  const { options: dynamicOptions, loading, fetchError } = useAsyncOptions(field);
  const isUnstyled = theme.unstyled;
  const hasError = !!(error || fieldError);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    controllerField.onChange(value);
    field.onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
    field.onValueChange?.(value, { setValue, getValues, trigger });
    field.onValueChangeDebounced?.(value, { setValue, getValues, trigger });
    if (hasError && field.showErrorOnBlur) trigger(name);
  };

  const wrapperStyle = field.wrapperStyle ?? theme.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? theme.labelStyle ?? (isUnstyled ? undefined : {
    display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "14px", color: "#333"
  });
  const selectStyle = isUnstyled
    ? { ...theme.inputStyle, ...field.inputStyle }
    : {
        padding: "10px", border: "1px solid",
        borderColor: hasError ? "#f87171" : "#ccc",
        borderRadius: "6px", fontSize: "14px", width: "100%",
        backgroundColor: "#fff", color: "#111827", outline: "none",
        boxSizing: "border-box" as const,
        appearance: "none" as any, WebkitAppearance: "none" as any, MozAppearance: "none" as any,
        paddingRight: "2rem", cursor: field.disabled ? "not-allowed" : "pointer",
        ...theme.inputStyle,
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? theme.helpTextStyle ?? (isUnstyled ? undefined : { fontSize: "12px", marginTop: "4px", color: "#4b5563" });
  const errorStyle = field.errorStyle ?? theme.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  const selectedOption = dynamicOptions.find((opt) => opt.value === controllerField.value);

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label
        htmlFor={name}
        className={cx(theme.labelClass, field.labelClass)}
        style={labelStyle}
      >
        {field.label}
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        {loading && <span style={{ fontSize: "0.75rem" }}> ⏳</span>}
      </label>

      <div style={isUnstyled ? undefined : { position: "relative", width: "100%" }}>
        <select
          id={name}
          {...controllerField}
          onChange={handleChange}
          onBlur={() => { if (field.showErrorOnBlur) trigger(name); }}
          className={cx(theme.inputClass, hasError ? theme.inputErrorClass : undefined, field.inputClass)}
          style={selectStyle}
          disabled={field.disabled || loading}
          aria-describedby={field.helpText ? `${name}-description` : undefined}
          aria-invalid={hasError}
        >
          <option value="">{loading ? "Loading..." : "Select..."}</option>
          {dynamicOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} title={opt.tooltip}>
              {opt.label}
            </option>
          ))}
        </select>

        {!isUnstyled && (
          <span
            style={{
              position: "absolute", right: "0.75rem", top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none",
              fontSize: "1rem", color: "#4b5563"
            }}
            aria-hidden="true"
          >
            ▼
          </span>
        )}
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

      {selectedOption?.helpText && (
        <div style={{ ...helpTextStyle, marginTop: "2px" }}>{selectedOption.helpText}</div>
      )}

      {fetchError && (
        <p style={{ color: "orange", fontSize: "0.875rem", marginTop: "4px" }}>{fetchError}</p>
      )}

      {hasError && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error || fieldError, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(SelectFieldComponent);
