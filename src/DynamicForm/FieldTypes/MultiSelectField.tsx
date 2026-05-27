import React, { useState, useRef, useEffect, useCallback } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../types/FormFieldSchema";
import { resolveErrorMessage } from "../utils/errorUtils";
import { useFormTheme, cx } from "../theme/FormTheme";
import { RequiredMark } from "../utils/RequiredMark";
import { useAsyncOptions } from "../utils/useAsyncOptions";

interface MultiSelectFieldProps {
  field: FormFieldSchema;
  name: string;
  error?: any;
  register: any;
}

const MultiSelectFieldComponent: React.FC<MultiSelectFieldProps> = ({ field, name, error }) => {
  const { control, setValue, getValues, trigger } = useFormContext();
  const {
    field: controllerField,
    fieldState: { error: fieldError }
  } = useController({
    name,
    control,
    defaultValue: field.defaultValue ?? [],
    rules: { required: field.required, validate: field.validation?.validate ?? field.validation?.custom }
  });

  const theme = useFormTheme();
  const { options: dynamicOptions, loading, fetchError } = useAsyncOptions(field);
  const isUnstyled = theme.unstyled;
  const hasError = !!(error || fieldError);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues: string[] = Array.isArray(controllerField.value) ? controllerField.value : [];

  const filteredOptions = search.trim()
    ? dynamicOptions.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : dynamicOptions;

  const toggle = useCallback((value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    controllerField.onChange(next);
    field.onValueChange?.(next, { setValue, getValues, trigger });
    if (hasError && field.showErrorOnBlur) trigger(name);
  }, [selectedValues, controllerField, field, setValue, getValues, trigger, hasError, name]);

  const removeChip = useCallback((value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(value);
  }, [toggle]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        if (field.showErrorOnBlur) trigger(name);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [field.showErrorOnBlur, trigger, name]);

  const wrapperStyle = field.wrapperStyle ?? theme.wrapperStyle ?? (isUnstyled ? undefined : { marginBottom: "1rem" });
  const labelStyle = field.labelStyle ?? theme.labelStyle ?? (isUnstyled ? undefined : {
    display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "14px", color: "#333"
  });
  const triggerStyle: React.CSSProperties = isUnstyled
    ? { ...theme.inputStyle, ...field.inputStyle }
    : {
        minHeight: "42px", padding: "6px 2rem 6px 10px", border: "1px solid",
        borderColor: hasError ? "#f87171" : open ? "#2563eb" : "#ccc",
        borderRadius: "6px", fontSize: "14px", width: "100%", backgroundColor: "#fff",
        color: selectedValues.length === 0 ? "#9ca3af" : "#111827",
        outline: "none", boxSizing: "border-box" as const,
        cursor: field.disabled ? "not-allowed" : "pointer",
        display: "flex", flexWrap: "wrap" as const, gap: "4px", alignItems: "center",
        transition: "border-color 0.15s ease",
        ...theme.inputStyle,
        ...field.inputStyle
      };
  const helpTextStyle = field.helpTextStyle ?? theme.helpTextStyle ?? (isUnstyled ? undefined : { fontSize: "12px", marginTop: "4px", color: "#4b5563" });
  const errorStyle = field.errorStyle ?? theme.errorStyle ?? (isUnstyled ? undefined : { color: "#d93025", marginTop: "6px", fontSize: "13px" });

  return (
    <div className={cx(theme.wrapperClass, field.wrapperClass)} style={wrapperStyle}>
      <label
        className={cx(theme.labelClass, field.labelClass)}
        style={labelStyle}
        onClick={() => !field.disabled && setOpen((o) => !o)}
      >
        {field.label}
        {field.required && <RequiredMark isUnstyled={isUnstyled} className={theme.requiredMarkClass} />}
        {loading && <span style={{ fontSize: "0.75rem" }}> ⏳</span>}
      </label>

      <div ref={containerRef} style={{ position: "relative" }}>
        {/* Trigger */}
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={field.label}
          aria-invalid={hasError}
          className={cx(theme.inputClass, hasError ? theme.inputErrorClass : undefined, field.inputClass)}
          style={triggerStyle}
          onClick={() => !field.disabled && setOpen((o) => !o)}
          tabIndex={field.disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!field.disabled) setOpen((o) => !o); }
            if (e.key === "Escape") { setOpen(false); setSearch(""); }
          }}
        >
          {selectedValues.length === 0 && (
            <span style={{ color: "#9ca3af", userSelect: "none" }}>{field.placeholder ?? "Select..."}</span>
          )}
          {selectedValues.map((val) => {
            const opt = dynamicOptions.find((o) => o.value === val);
            return (
              <span
                key={val}
                style={isUnstyled ? undefined : {
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  background: "#dbeafe", color: "#1d4ed8",
                  borderRadius: "4px", padding: "2px 6px", fontSize: "12px", fontWeight: 500
                }}
              >
                {opt?.label ?? val}
                {!field.disabled && (
                  <span
                    role="button"
                    aria-label={`Remove ${opt?.label ?? val}`}
                    onClick={(e) => removeChip(val, e)}
                    style={{ cursor: "pointer", marginLeft: "2px", lineHeight: 1 }}
                  >
                    ×
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Chevron */}
        {!isUnstyled && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute", right: "0.75rem", top: "50%",
              transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
              pointerEvents: "none", fontSize: "0.75rem", color: "#6b7280",
              transition: "transform 0.15s ease"
            }}
          >
            ▼
          </span>
        )}

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            style={isUnstyled ? undefined : {
              position: "absolute", zIndex: 50, top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", overflow: "hidden"
            }}
          >
            {/* Search input */}
            <div style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>
              <input
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%", padding: "6px 8px", border: "1px solid #d1d5db",
                  borderRadius: "4px", fontSize: "13px", outline: "none",
                  boxSizing: "border-box" as const, color: "#111827"
                }}
              />
            </div>

            {/* Options list */}
            <div style={{ maxHeight: "220px", overflowY: "auto" }}>
              {filteredOptions.length === 0 && (
                <div style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
                  No options
                </div>
              )}
              {filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    role="option"
                    aria-selected={isChecked}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "8px 12px", cursor: opt.disabled ? "not-allowed" : "pointer",
                      background: isChecked ? "#eff6ff" : "transparent",
                      opacity: opt.disabled ? 0.5 : 1,
                      fontSize: "14px", color: "#111827",
                      transition: "background 0.1s ease"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={opt.disabled || field.disabled}
                      onChange={() => toggle(opt.value)}
                      style={{ width: "14px", height: "14px", accentColor: "#2563eb", flexShrink: 0 }}
                    />
                    {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
                    <span style={{ fontWeight: isChecked ? 500 : 400 }}>{opt.label}</span>
                    {opt.helpText && (
                      <span style={{ marginLeft: "auto", fontSize: "11px", color: "#9ca3af" }}>{opt.helpText}</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Footer: count + clear */}
            {selectedValues.length > 0 && (
              <div style={{
                padding: "6px 12px", borderTop: "1px solid #f3f4f6",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: "12px", color: "#6b7280"
              }}>
                <span>{selectedValues.length} selected</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    controllerField.onChange([]);
                    field.onValueChange?.([], { setValue, getValues, trigger });
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "12px", padding: 0 }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
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

export default React.memo(MultiSelectFieldComponent);
