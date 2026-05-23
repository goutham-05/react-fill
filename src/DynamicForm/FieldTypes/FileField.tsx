import React, { useRef } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface FileFieldProps {
  field: FormFieldSchema & { accept?: string; multiple?: boolean };
  name: string;
  error?: any;
  register: any;
}

const FileFieldComponent: React.FC<FileFieldProps> = ({ field, name, error }) => {
  const { control } = useFormContext();
  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: null,
    rules: {
      required: field.required
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useFormTheme();
  const isDarkMode = field.theme === "dark";
  const isUnstyled = theme.unstyled;

  const files: FileList | null = controllerField.value;
  const fileLabel = files && files.length > 0
    ? files.length === 1
      ? files[0].name
      : `${files.length} files selected`
    : "No file chosen";

  const wrapperStyle = field.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? (isUnstyled ? undefined : {
    display: "flex", alignItems: "center", gap: "6px",
    marginBottom: "6px", fontWeight: 500, fontSize: "14px",
    color: isDarkMode ? "#e5e7eb" : "#333"
  });
  const helpTextStyle = field.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px",
    color: isDarkMode ? "#9ca3af" : "#6b7280"
  });
  const errorStyle = field.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  const buttonStyle = isUnstyled
    ? undefined
    : {
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "8px 16px",
        border: "1px solid",
        borderColor: error ? "#f87171" : isDarkMode ? "#4b5563" : "#ccc",
        borderRadius: "6px", fontSize: "14px",
        backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
        color: isDarkMode ? "#f9fafb" : "#374151",
        cursor: field.disabled ? "not-allowed" : "pointer",
        opacity: field.disabled ? 0.6 : 1,
        transition: "background-color 0.2s ease-in-out",
        userSelect: "none" as const
      };

  const fileNameStyle = isUnstyled
    ? undefined
    : {
        fontSize: "13px",
        color: files && files.length > 0
          ? isDarkMode ? "#f9fafb" : "#111827"
          : isDarkMode ? "#9ca3af" : "#6b7280",
        marginLeft: "8px"
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
      </label>

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        id={name}
        type="file"
        accept={field.accept}
        multiple={field.multiple}
        disabled={field.disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={field.helpText ? `${name}-description` : undefined}
        style={{ display: "none" }}
        onChange={(e) => {
          controllerField.onChange(e.target.files);
        }}
      />

      {/* Styled trigger + filename display */}
      <div style={isUnstyled ? undefined : { display: "flex", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => !field.disabled && inputRef.current?.click()}
          className={cx(field.inputClass)}
          style={buttonStyle}
          disabled={field.disabled}
          aria-controls={name}
        >
          Choose file
        </button>
        <span style={fileNameStyle}>{fileLabel}</span>
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

export default React.memo(FileFieldComponent);
