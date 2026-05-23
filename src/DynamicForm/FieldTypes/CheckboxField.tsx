import React from "react";
import { useFormContext, useController } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { useDebounce } from "../utils/useDebounce";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";
import { useAsyncOptions } from "../utils/useAsyncOptions";

interface CheckboxFieldProps {
  field: FormFieldSchema;
  name: string;
  register: any;
  error?: any;
}

const CheckboxFieldComponent: React.FC<CheckboxFieldProps> = ({ field, name, error }) => {
  const { control, setValue, getValues, trigger } = useFormContext();
  const { trigger: triggerDebounce } = useDebounce();
  const theme = useFormTheme();
  const isDarkMode = field.theme === "dark";
  const isUnstyled = theme.unstyled;
  const { options, loading, fetchError } = useAsyncOptions(field);

  const isGroup = !!(field.options || field.getOptions || field.apiEndpoint);

  const {
    field: controllerField,
    fieldState: { error: controllerError }
  } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? (isGroup ? [] : false),
    rules: { required: field.required, validate: field.validation?.custom }
  });

  const handleDebounced = (value: any) => {
    if (field.onValueChangeDebounced) {
      triggerDebounce(
        () => field.onValueChangeDebounced!(value, { setValue, getValues, trigger }),
        field.debounceMs ?? 500
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, value?: string) => {
    const isGroup = !!field.options?.length;
    const newValue = isGroup
      ? e.target.checked
        ? [...(controllerField.value || []), value]
        : controllerField.value.filter((v: string) => v !== value)
      : e.target.checked;

    controllerField.onChange(newValue);
    field.onChange?.(e);
    field.onValueChange?.(newValue, { setValue, getValues, trigger });
    handleDebounced(newValue);
    if ((error || controllerError) && field.showErrorOnBlur) trigger(name);
  };

  const hasError = !!(error || controllerError);

  const inputStyle = isUnstyled ? field.inputStyle : {
    width: "16px", height: "16px", accentColor: "#004DB2",
    cursor: field.disabled ? "not-allowed" : "pointer",
    ...field.inputStyle
  };
  const labelStyle = field.labelStyle ?? (isUnstyled ? undefined : {
    fontSize: "14px", color: isDarkMode ? "#e5e7eb" : "#333"
  });
  const helpTextStyle = field.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px", color: isDarkMode ? "#9ca3af" : "#6b7280"
  });
  const errorStyle = field.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });
  const wrapperStyle = field.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const checkBoxGroupStyle = field.checkBoxGroupStyle ?? (isUnstyled ? undefined : {
    display: "flex", flexDirection: "column" as const, gap: "0.75rem"
  });
  const optionWrapperStyle = field.optionWrapperStyle ?? (isUnstyled ? undefined : {
    display: "flex", alignItems: "center", gap: "8px"
  });

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      {(field.checkboxLabel ?? field.label) && (
        <label
          htmlFor={name}
          className={cx(theme.labelClass, field.labelClass)}
          style={labelStyle}
        >
          {field.checkboxLabel ?? field.label}
          {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        </label>
      )}

      <div
        className={cx(theme.checkboxGroupClass, field.checkboxGroupClass)}
        style={isGroup ? checkBoxGroupStyle : optionWrapperStyle}
      >
        {isGroup ? (
          loading ? (
            <span style={isUnstyled ? undefined : { fontSize: "13px", color: "#6b7280" }}>
              Loading options…
            </span>
          ) : fetchError ? (
            <span style={isUnstyled ? undefined : { fontSize: "13px", color: "#d97706" }}>
              {fetchError}
            </span>
          ) : (
            options.map((opt) => {
              const isChecked = controllerField.value?.includes(opt.value);
              const inputId = `${name}-${opt.value}`;
              const helpTextAlignment = opt.helpTextAlignment ?? "underLabel";

              return (
                <div key={opt.value} style={{ display: "flex", flexDirection: "column" }}>
                  <label
                    htmlFor={inputId}
                    className={cx(theme.optionWrapperClass, field.optionWrapperClass)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", cursor: field.disabled ? "not-allowed" : "pointer" }}
                    title={opt.tooltip}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      value={opt.value}
                      checked={isChecked}
                      onChange={(e) => handleChange(e, opt.value)}
                      onBlur={() => { if (field.showErrorOnBlur) trigger(name); }}
                      className={cx(theme.inputClass, field.inputClass)}
                      style={inputStyle}
                      disabled={field.disabled || opt.disabled}
                      aria-describedby={opt.helpText ? `${inputId}-desc` : undefined}
                    />
                    <span>{opt.label}</span>
                  </label>
                  {opt.helpText && (
                    <div
                      id={`${inputId}-desc`}
                      role="note"
                      style={{ ...helpTextStyle, marginLeft: helpTextAlignment === "underLabel" ? "24px" : "0" }}
                    >
                      {opt.helpText}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <label
            className={cx(theme.optionWrapperClass, field.optionWrapperClass)}
            style={optionWrapperStyle}
          >
            <input
              id={name}
              type="checkbox"
              className={cx(theme.inputClass, field.inputClass)}
              style={inputStyle}
              checked={!!controllerField.value}
              onChange={(e) => handleChange(e)}
              onBlur={() => { if (field.showErrorOnBlur) trigger(name); }}
              disabled={field.disabled}
              aria-describedby={field.helpText ? `${name}-description` : undefined}
            />
            <span>{field.label}</span>
          </label>
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

      {hasError && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error || controllerError, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(CheckboxFieldComponent);
