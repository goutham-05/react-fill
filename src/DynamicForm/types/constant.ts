export const FIELD_TYPES = {
  TEXT: "text",
  NUMBER: "number",
  EMAIL: "email",
  SELECT: "select",
  MULTISELECT: "multiselect",
  CHECKBOX: "checkbox",
  GROUP: "group",
  RADIO: "radio",
  TEXTAREA: "textarea",
  DATE: "date",
  TIME: "time",
  DATETIME: "datetime",
  FILE: "file",
  SLIDER: "slider",
  RATING: "rating",
  FIELD_ARRAY: "fieldArray",
  ADDITIONAL_EMAIL: "additionalEmail",
  MULTI_FIELD: "multiField"
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];
