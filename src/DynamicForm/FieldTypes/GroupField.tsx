import React from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import MemoizedFieldRenderer from "FormEngine";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface GroupFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const GroupFieldComponent: React.FC<GroupFieldProps> = ({ field, name, error }) => {
  const { control } = useFormContext();
  const theme = useFormTheme();
  const isDarkMode = field.theme === "dark";
  const isUnstyled = theme.unstyled;

  const {
    formState: { errors }
  } = useController({
    name,
    control,
    rules: { required: field.required, validate: field.validation?.custom },
    defaultValue: field.defaultValue ?? {}
  });

  const groupError = errors?.[name];

  // Watch child values so custom group-level validation re-runs when any child changes
  useWatch({ name, control });

  // fieldset resets browser default border/margin/padding
  const fieldsetStyle: React.CSSProperties = field.wrapperStyle ?? (isUnstyled ? {} : {
    border: "none", margin: 0, padding: 0, marginBottom: "1rem"
  });
  const legendStyle = field.labelStyle ?? (isUnstyled ? undefined : {
    display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "14px", padding: 0,
    color: isDarkMode ? "#e5e7eb" : "#333"
  });
  const errorStyle = field.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });
  const helpTextStyle = field.helpTextStyle ?? (isUnstyled ? undefined : {
    fontSize: "12px", marginTop: "4px", color: isDarkMode ? "#9ca3af" : "#6b7280"
  });

  return (
    // <fieldset> is the correct semantic wrapper for a group of related inputs.
    // It exposes an implicit ARIA group role; <legend> labels it for screen readers.
    <fieldset
      className={cx(theme.wrapperClass, field.wrapperClass)}
      style={fieldsetStyle}
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

      <div
        className={cx(theme.groupLayoutClass, field.layoutClass)}
        style={field.layoutStyle}
      >
        {field.children?.map((child) => (
          <MemoizedFieldRenderer key={child.name} field={child} parentName={name} />
        ))}
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

      {(error || groupError) && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error || groupError, field)}
        </p>
      )}
    </fieldset>
  );
};

export default React.memo(GroupFieldComponent);
