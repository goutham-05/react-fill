import React, { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { FormFieldSchema, ConditionConfig } from "DynamicForm/types/FormFieldSchema";
import { useFormTheme } from "DynamicForm/theme/FormTheme";
import { useFieldRegistry } from "DynamicForm/registry/FieldRegistry";

const resolveNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

/**
 * Evaluate a ConditionConfig against a map of current field values.
 * Shared by visibleWhen, requiredWhen, and disabledWhen.
 */
function evaluateConditions(
  config: ConditionConfig,
  watchedMap: Record<string, any>
): boolean {
  const { conditions, logic = "AND" } = config;
  const results = conditions.map(({ field, value, operator = "equals" }) => {
    const currentVal = watchedMap[field];
    switch (operator) {
      case "equals":    return currentVal === value;
      case "notEquals": return currentVal !== value;
      case "in":        return Array.isArray(value) && value.includes(currentVal);
      case "notIn":     return Array.isArray(value) && !value.includes(currentVal);
      case "exists":    return currentVal !== undefined && currentVal !== null && currentVal !== "";
      case "notExists": return currentVal === undefined || currentVal === null || currentVal === "";
      default:          return currentVal === value;
    }
  });
  return logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

interface Props {
  field: FormFieldSchema;
  parentName?: string;
}

const BaseFieldRenderer: React.FC<Props> = ({ field, parentName }) => {
  const { register, formState, control, setValue, getValues } = useFormContext();
  const theme = useFormTheme();
  const registry = useFieldRegistry();

  const qualifiedFieldName = parentName
    ? `${parentName}.${field.name}`
    : field.name;

  const error = resolveNestedValue(formState.errors, qualifiedFieldName);

  // Collect every unique field path needed by ALL condition configs (visible/required/disabled).
  // Depends on the three condition configs so dynamic schemas (e.g. playground builder) are
  // handled correctly when conditions are added or changed after the field first mounts.
  const allConditionPaths = useMemo(() => {
    const paths = new Set<string>();
    field.visibleWhen?.conditions?.forEach(c => paths.add(c.field));
    field.requiredWhen?.conditions?.forEach(c => paths.add(c.field));
    field.disabledWhen?.conditions?.forEach(c => paths.add(c.field));
    return Array.from(paths);
  }, [field.visibleWhen, field.requiredWhen, field.disabledWhen]);

  // Single useWatch covers all three condition sets — zero duplicate subscriptions.
  const watchedValues = useWatch({ control, name: allConditionPaths }) as unknown[];

  // Build a path→value lookup map.
  const watchedMap = useMemo(
    () => Object.fromEntries(allConditionPaths.map((p, i) => [p, watchedValues[i]])),
    [allConditionPaths, watchedValues]
  );

  const shouldRenderField = field.visibleWhen?.conditions?.length
    ? evaluateConditions(field.visibleWhen, watchedMap)
    : true;

  const isRequiredByCondition = field.requiredWhen?.conditions?.length
    ? evaluateConditions(field.requiredWhen, watchedMap)
    : false;

  const isDisabledByCondition = field.disabledWhen?.conditions?.length
    ? evaluateConditions(field.disabledWhen, watchedMap)
    : false;

  // Clear value when field is hidden (unless preserveValue is set).
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

  // Merge computed required/disabled into the field prop so every built-in renderer
  // automatically receives the resolved values — no changes needed inside each field.
  const resolvedField: FormFieldSchema =
    isRequiredByCondition || isDisabledByCondition
      ? {
          ...field,
          required: field.required || isRequiredByCondition,
          disabled: field.disabled || isDisabledByCondition,
        }
      : field;

  if (resolvedField.overrideComponent) {
    const OverrideComponent = resolvedField.overrideComponent;
    return (
      <OverrideComponent
        {...(resolvedField.overrideComponentProps ?? {})}
        field={resolvedField}
        name={qualifiedFieldName}
        error={error}
        register={register}
      />
    );
  }

  // Lookup order: theme.components (design-system override) → built-in registry
  const dispatchProps = { field: resolvedField, name: qualifiedFieldName, error, register, parentName };

  const ThemeComponent = theme.components?.[resolvedField.type as string];
  if (ThemeComponent) return <ThemeComponent {...dispatchProps} />;

  const BuiltIn = registry[resolvedField.type as string];
  if (BuiltIn) return <BuiltIn {...dispatchProps} />;

  return null;
};

export default React.memo(BaseFieldRenderer);
