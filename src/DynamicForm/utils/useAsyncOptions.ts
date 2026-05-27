import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import type { FormFieldSchema } from "../types/FormFieldSchema";

export type AsyncOption = {
  label: string;
  value: string;
  helpText?: string;
  disabled?: boolean;
  tooltip?: string;
  helpTextAlignment?: "underLabel" | "underButton";
  icon?: ReactNode;
};

/**
 * Resolves options for select / radio / checkbox fields.
 * Handles three sources in priority order:
 *   1. getOptions(parentValue) — sync or async function
 *   2. apiEndpoint — fetched via GET; appends ?{key}={value} for each dependsOn field
 *   3. options — static array (default fallback)
 *
 * dependsOn can be a single field name or an array of field names.
 * When an array, getOptions receives { [fieldName]: value } and apiEndpoint
 * gets all values as separate query params.
 *
 * Re-runs whenever any watched dependsOn field value changes.
 * Cancels in-flight requests on unmount or re-trigger.
 */
export function useAsyncOptions(field: FormFieldSchema) {
  const { control } = useFormContext();

  // Normalize dependsOn to always be an array for a single useWatch call.
  const depFields: readonly string[] = Array.isArray(field.dependsOn)
    ? field.dependsOn
    : field.dependsOn
      ? [field.dependsOn]
      : ["__no_field__"];

  const watchedValues = useWatch({ control, name: depFields }) as unknown[];

  const isMultiDepend = Array.isArray(field.dependsOn);

  // Single raw value or object map depending on dependsOn shape.
  const parentValue = field.dependsOn
    ? isMultiDepend
      ? Object.fromEntries((field.dependsOn as string[]).map((k, i) => [k, watchedValues[i]]))
      : watchedValues[0]
    : undefined;

  const hasAsync = !!(field.getOptions || field.apiEndpoint);

  const [options, setOptions] = useState<AsyncOption[]>(field.options ?? []);
  const [loading, setLoading] = useState(hasAsync);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Stable dep key — stringified so object identity doesn't thrash.
  const parentValueKey = JSON.stringify(parentValue ?? null);

  useEffect(() => {
    if (!hasAsync) {
      setOptions(field.options ?? []);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        let result: AsyncOption[] = [];

        if (field.getOptions) {
          const res = field.getOptions(parentValue);
          result = res instanceof Promise ? await res : res;
        } else if (field.apiEndpoint) {
          let url = field.apiEndpoint;
          if (field.dependsOn && parentValue != null) {
            if (isMultiDepend) {
              const params = new URLSearchParams();
              for (const [k, v] of Object.entries(parentValue as Record<string, unknown>)) {
                if (v != null && v !== "") params.append(k, String(v));
              }
              const qs = params.toString();
              if (qs) url = `${url}?${qs}`;
            } else if (parentValue !== "") {
              const key = encodeURIComponent(field.dependsOn as string);
              const val = encodeURIComponent(String(parentValue));
              url = `${url}?${key}=${val}`;
            }
          }
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          result = await res.json();
        }

        if (!cancelled) setOptions(result ?? []);
      } catch {
        if (!cancelled) {
          setFetchError("Failed to load options.");
          setOptions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.getOptions, field.apiEndpoint, field.dependsOn, parentValueKey]);

  return { options, loading, fetchError };
}
