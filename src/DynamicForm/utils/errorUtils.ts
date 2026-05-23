import type {
  FieldError,
  FieldErrorsImpl,
  Merge
} from "react-hook-form";
import type { FormFieldSchema } from "../types/FormFieldSchema";

type AnyError =
  | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<any>>
  | undefined;

export function getAutoErrorMessage(
  error: any,
  field: FormFieldSchema
): string {
  switch (error?.type) {
    case "required":
      return `${field.label} is required`;
    case "minLength":
      return `${field.label} must be at least ${field.validation?.minLength?.value} characters`;
    case "maxLength":
      return `${field.label} must be at most ${field.validation?.maxLength?.value} characters`;
    case "pattern":
      return (
        field.validation?.pattern?.message ?? `${field.label} format is invalid`
      );
    default:
      return error?.message ?? "Invalid value";
  }
}

export function resolveErrorMessage(
  error: AnyError,
  field: FormFieldSchema
): string {
  if (!error) return "";
  if (field.errorText) return field.errorText;
  if (field.getErrorMessage) return field.getErrorMessage(error);
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && error.message) {
    return error.message as string;
  }
  return getAutoErrorMessage(error, field);
}
