import React, { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";

interface RatingFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const RatingFieldComponent: React.FC<RatingFieldProps> = ({ field, name, error }) => {
  const { setValue, getValues, trigger, control } = useFormContext();
  const starCount = field.starCount ?? (field.max as number | undefined) ?? 5;

  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? 0,
    rules: {
      validate: field.required
        ? (v: number) => v > 0 || "Please select a rating"
        : undefined
    }
  });

  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const theme = useFormTheme();
  const isDarkMode = field.theme === "dark";
  const isUnstyled = theme.unstyled;

  const currentValue: number = controllerField.value ?? 0;
  const displayValue = hoverIndex >= 0 ? hoverIndex + 1 : currentValue;

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

  const starsContainerStyle = isUnstyled
    ? undefined
    : { display: "flex", gap: "4px", alignItems: "center" };

  const getStarStyle = (isFilled: boolean): React.CSSProperties | undefined => {
    if (isUnstyled) return undefined;
    return {
      fontSize: "1.5rem",
      color: isFilled ? "#fbbf24" : isDarkMode ? "#52525b" : "#52525b",
      background: "none",
      border: "none",
      padding: "0 2px",
      cursor: field.disabled ? "not-allowed" : "pointer",
      opacity: field.disabled ? 0.6 : 1,
      lineHeight: 1,
      transition: "color 0.1s ease-in-out"
    };
  };

  const handleStarClick = (index: number) => {
    if (field.disabled) return;
    // Toggle off if clicking the already-selected star
    const newValue = currentValue === index + 1 ? 0 : index + 1;
    controllerField.onChange(newValue);
    field.onValueChange?.(newValue, { setValue, getValues, trigger });
  };

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label
        className={cx(theme.labelClass, field.labelClass)}
        style={labelStyle}
      >
        {field.icon && <span>{field.icon}</span>}
        <span title={field.tooltip}>{field.label}</span>
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
      </label>

      <div
        role="radiogroup"
        aria-label={field.label}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={field.helpText ? `${name}-description` : undefined}
        style={starsContainerStyle}
        className={cx(field.inputClass)}
        onMouseLeave={() => setHoverIndex(-1)}
      >
        {Array.from({ length: starCount }, (_, i) => {
          const isFilled = i < displayValue;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={currentValue === i + 1}
              aria-label={`${i + 1} star${i + 1 !== 1 ? "s" : ""}`}
              onClick={() => handleStarClick(i)}
              onMouseEnter={() => !field.disabled && setHoverIndex(i)}
              disabled={field.disabled}
              style={getStarStyle(isFilled)}
              className={
                isUnstyled
                  ? undefined
                  : isFilled
                  ? "text-amber-400"
                  : "text-zinc-600"
              }
            >
              {isFilled ? "★" : "☆"}
            </button>
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

      {error && (
        <p className={cx(theme.errorClass, field.errorClass)} style={errorStyle} role="alert">
          {resolveErrorMessage(error, field)}
        </p>
      )}
    </div>
  );
};

export default React.memo(RatingFieldComponent);
