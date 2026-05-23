import React, { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import CheckboxField from "DynamicForm/FieldTypes/CheckboxField";
import DateField from "DynamicForm/FieldTypes/DateField";
import FileField from "DynamicForm/FieldTypes/FileField";
import FieldArrayComponent from "DynamicForm/FieldTypes/FieldArrayField";
import GroupFieldComponent from "DynamicForm/FieldTypes/GroupField";
import MultiFieldComponent from "DynamicForm/FieldTypes/MultiField";
import NumberField from "DynamicForm/FieldTypes/NumberField";
import RadioField from "DynamicForm/FieldTypes/RadioField";
import RatingField from "DynamicForm/FieldTypes/RatingField";
import SelectField from "DynamicForm/FieldTypes/SelectField";
import SliderField from "DynamicForm/FieldTypes/SliderField";
import TextAreaField from "DynamicForm/FieldTypes/TextAreaField";
import TextField from "DynamicForm/FieldTypes/TextField";
import type { FormFieldSchema } from "DynamicForm/types/FormFieldSchema";

const resolveNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

interface Props {
  field: FormFieldSchema;
  parentName?: string;
}

const BaseFieldRenderer: React.FC<Props> = ({ field, parentName }) => {
  const { register, formState, control, setValue, getValues } = useFormContext();

  const qualifiedFieldName = parentName
    ? `${parentName}.${field.name}`
    : field.name;

  const error = resolveNestedValue(formState.errors, qualifiedFieldName);

  // Collect only the field paths actually needed for condition evaluation.
  // useMemo with [] deps: visibleWhen is static schema data defined once at module level.
  const conditionPaths = useMemo(
    () => field.visibleWhen?.conditions?.map((c) => c.field) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Subscribe only to the fields relevant to this field's conditions.
  // When conditionPaths is empty, useWatch returns [] and creates zero subscriptions —
  // eliminating the previous O(n²) re-render problem for large forms.
  const watchedValues = useWatch({ control, name: conditionPaths }) as unknown[];

  let shouldRenderField = true;

  if (field.visibleWhen?.conditions?.length) {
    const { conditions, logic = "AND" } = field.visibleWhen;

    const results = conditions.map(({ value, operator }, i) => {
      // watchedValues[i] directly corresponds to conditionPaths[i] — no nested traversal needed
      const currentVal = watchedValues[i];

      switch (operator) {
        case "equals":    return currentVal === value;
        case "notEquals": return currentVal !== value;
        case "in":        return Array.isArray(value) && value.includes(currentVal);
        case "notIn":     return Array.isArray(value) && !value.includes(currentVal);
        case "exists":    return currentVal !== undefined && currentVal !== null && currentVal !== "";
        case "notExists": return currentVal === undefined || currentVal === null || currentVal === "";
        default:          return false;
      }
    });

    shouldRenderField = logic === "AND" ? results.every(Boolean) : results.some(Boolean);
  }

  useEffect(() => {
    if (!shouldRenderField && !field.preserveValue) {
      const existing = resolveNestedValue(getValues(), qualifiedFieldName);
      if (existing !== undefined) {
        setValue(qualifiedFieldName, field.defaultValue ?? "");
      }
    }
  }, [shouldRenderField, qualifiedFieldName, field.defaultValue, field.preserveValue, getValues, setValue]);

  if (!shouldRenderField) return null;

  if (typeof field.render === "function") {
    return field.render({
      name: qualifiedFieldName,
      error,
      register,
      defaultValue: field.defaultValue
    });
  }

  if (field.overrideComponent) {
    const OverrideComponent = field.overrideComponent;
    return (
      <OverrideComponent
        {...(field.overrideComponentProps ?? {})}
        field={field}
        name={qualifiedFieldName}
        error={error}
        register={register}
      />
    );
  }

  const sharedFieldProps = { field, name: qualifiedFieldName, error, register };

  switch (field.type) {
    case "text":
    case "email":
      return <TextField {...sharedFieldProps} />;
    case "number":
      return <NumberField {...sharedFieldProps} />;
    case "textarea":
      return <TextAreaField {...sharedFieldProps} />;
    case "select":
      return <SelectField {...sharedFieldProps} />;
    case "radio":
      return <RadioField {...sharedFieldProps} />;
    case "checkbox":
      return <CheckboxField field={field} name={qualifiedFieldName} register={register} />;
    case "date":
      return <DateField {...sharedFieldProps} />;
    case "file":
      return <FileField {...sharedFieldProps} />;
    case "slider":
      return <SliderField {...sharedFieldProps} />;
    case "rating":
      return <RatingField {...sharedFieldProps} />;
    case "fieldArray":
      return <FieldArrayComponent {...sharedFieldProps} />;
    case "group":
      return <GroupFieldComponent {...sharedFieldProps} />;
    case "additionalEmail":
      return <TextField {...sharedFieldProps} field={{ ...field, type: "email" }} />;
    case "multiField":
      return <MultiFieldComponent field={field} name={qualifiedFieldName} parentName={parentName} />;
    default:
      return null;
  }
};

export default React.memo(BaseFieldRenderer);
