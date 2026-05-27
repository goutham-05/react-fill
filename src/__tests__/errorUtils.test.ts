import { describe, it, expect } from "vitest";
import { getAutoErrorMessage, resolveErrorMessage } from "../DynamicForm/utils/errorUtils";
import type { FormFieldSchema } from "../DynamicForm/types/FormFieldSchema";
import { FIELD_TYPES } from "../DynamicForm/types/constant";

const baseField: FormFieldSchema = {
  name: "email",
  label: "Email",
  type: FIELD_TYPES.TEXT
};

describe("getAutoErrorMessage", () => {
  it("returns required message", () => {
    expect(getAutoErrorMessage({ type: "required" }, baseField)).toBe("Email is required");
  });

  it("returns minLength message with value", () => {
    const field = { ...baseField, validation: { minLength: { value: 5, message: "" } } };
    expect(getAutoErrorMessage({ type: "minLength" }, field)).toBe("Email must be at least 5 characters");
  });

  it("returns maxLength message with value", () => {
    const field = { ...baseField, validation: { maxLength: { value: 20, message: "" } } };
    expect(getAutoErrorMessage({ type: "maxLength" }, field)).toBe("Email must be at most 20 characters");
  });

  it("returns custom pattern message when provided", () => {
    const field = {
      ...baseField,
      validation: { pattern: { value: /\w+/, message: "Invalid format" } }
    };
    expect(getAutoErrorMessage({ type: "pattern" }, field)).toBe("Invalid format");
  });

  it("falls back to field label format for pattern with no custom message", () => {
    expect(getAutoErrorMessage({ type: "pattern" }, baseField)).toBe("Email format is invalid");
  });

  it("returns error.message for unknown type", () => {
    expect(getAutoErrorMessage({ type: "custom", message: "Custom error" }, baseField)).toBe("Custom error");
  });

  it("returns 'Invalid value' when no message and unknown type", () => {
    expect(getAutoErrorMessage({ type: "unknown" }, baseField)).toBe("Invalid value");
  });
});

describe("resolveErrorMessage", () => {
  it("returns empty string for falsy error", () => {
    expect(resolveErrorMessage(undefined, baseField)).toBe("");
    expect(resolveErrorMessage(null as any, baseField)).toBe("");
  });

  it("prefers field.errorText over everything", () => {
    const field = { ...baseField, errorText: "Static override" };
    expect(resolveErrorMessage({ type: "required", message: "original" }, field)).toBe("Static override");
  });

  it("prefers field.getErrorMessage over auto message", () => {
    const field = { ...baseField, getErrorMessage: () => "Dynamic message" };
    expect(resolveErrorMessage({ type: "required" }, field)).toBe("Dynamic message");
  });

  it("uses error.message when available", () => {
    expect(resolveErrorMessage({ type: "custom", message: "From RHF" }, baseField)).toBe("From RHF");
  });

  it("falls back to getAutoErrorMessage", () => {
    expect(resolveErrorMessage({ type: "required" }, baseField)).toBe("Email is required");
  });

  it("handles plain string error", () => {
    expect(resolveErrorMessage("plain string error", baseField)).toBe("plain string error");
  });
});
