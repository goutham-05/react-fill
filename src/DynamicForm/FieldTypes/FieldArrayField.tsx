import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import MemoizedFieldRenderer from "FormEngine";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface FieldArrayFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const FieldArrayFieldComponent: React.FC<FieldArrayFieldProps> = ({ field, name }) => {
  const { control } = useFormContext();
  const theme = useFormTheme();
  const isUnstyled = theme.unstyled;
  const isDarkMode = field.theme === "dark";

  const { fields: rows, append, remove } = useFieldArray({ control, name });

  const addLabel = field.addButtonLabel ?? "+ Add";
  const removeLabel = field.removeButtonLabel ?? "Remove";

  const wrapperStyle = field.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const legendStyle = field.labelStyle ?? (isUnstyled ? undefined : {
    display: "block", marginBottom: "6px", fontWeight: 500,
    fontSize: "14px", padding: 0, color: isDarkMode ? "#e5e7eb" : "#333",
  });
  const helpTextStyle = field.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px", color: isDarkMode ? "#9ca3af" : "#4b5563",
  });
  const rowStyle: React.CSSProperties = isUnstyled ? {} : {
    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    borderRadius: "8px", padding: "12px", marginBottom: "8px",
    backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
    position: "relative",
  };
  const addBtnStyle: React.CSSProperties = isUnstyled ? {} : {
    marginTop: "8px", padding: "6px 14px", borderRadius: "6px",
    border: `1px dashed ${isDarkMode ? "#4b5563" : "#d1d5db"}`,
    background: "transparent", cursor: "pointer", fontSize: "13px",
    color: isDarkMode ? "#9ca3af" : "#4b5563",
  };
  const removeBtnStyle: React.CSSProperties = isUnstyled ? {} : {
    position: "absolute", top: "8px", right: "8px", padding: "2px 8px",
    borderRadius: "4px", border: "1px solid transparent", background: "transparent",
    cursor: "pointer", fontSize: "11px", color: "#ef4444",
  };

  const buildChildName = (rowName: string, child: FormFieldSchema) =>
    `${rowName}.${child.name}`;

  return (
    <fieldset
      className={cx(theme.wrapperClass, field.wrapperClass)}
      style={wrapperStyle}
      aria-describedby={field.helpText ? `${name}-description` : undefined}
    >
      {field.label && (
        <legend
          className={cx(theme.labelClass, field.labelClass)}
          style={legendStyle}
        >
          {field.label}
          {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        </legend>
      )}

      {rows.map((row, index) => {
        const rowName = `${name}.${index}`;
        return (
          <div key={row.id} style={rowStyle} className={field.layoutClass}>
            {rows.length > 0 && (
              <button
                type="button"
                style={removeBtnStyle}
                onClick={() => remove(index)}
                aria-label={`${removeLabel} row ${index + 1}`}
              >
                {removeLabel}
              </button>
            )}
            <div style={field.layoutStyle}>
              {field.children?.map((child) => (
                <MemoizedFieldRenderer
                  key={child.name}
                  field={child}
                  parentName={rowName}
                />
              ))}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        style={addBtnStyle}
        onClick={() => {
          const empty: Record<string, unknown> = {};
          field.children?.forEach((c) => { empty[c.name] = c.defaultValue ?? ""; });
          append(empty);
        }}
      >
        {addLabel}
      </button>

      {field.helpText && (
        <p
          id={`${name}-description`}
          className={cx(theme.helpTextClass, field.helpTextClass)}
          style={helpTextStyle}
        >
          {field.helpText}
        </p>
      )}
    </fieldset>
  );
};

export default React.memo(FieldArrayFieldComponent);
