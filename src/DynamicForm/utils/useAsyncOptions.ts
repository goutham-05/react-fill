import { useState, useEffect } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import type { FormFieldSchema } from "../types/FormFieldSchema";

export type AsyncOption = {
  label: string;
  value: string;
  helpText?: string;
  disabled?: boolean;
  tooltip?: string;
  helpTextAlignment?: "underLabel" | "underButton";
};

/**
 * Resolves options for select / radio / checkbox fields.
 * Handles three sources in priority order:
 *   1. getOptions(parentValue) — sync or async function
 *   2. apiEndpoint — fetched via GET; appends ?{dependsOn}={parentValue} when dependsOn is set
 *   3. options — static array (default fallback)
 *
 * Re-runs whenever the watched `dependsOn` field value changes.
 * Cancels in-flight requests on unmount or re-trigger.
 */
export function useAsyncOptions(field: FormFieldSchema) {
  const { control } = useFormContext();

  // useWatch requires a string name; use a sentinel that matches no real field
  const parentValue = useWatch({
    control,
    name: field.dependsOn ?? "__no_field__",
  });

  const hasAsync = !!(field.getOptions || field.apiEndpoint);

  const [options, setOptions] = useState<AsyncOption[]>(field.options ?? []);
  const [loading, setLoading] = useState(hasAsync);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
          const url =
            field.dependsOn && parentValue != null && parentValue !== ""
              ? `${field.apiEndpoint}?${encodeURIComponent(field.dependsOn)}=${encodeURIComponent(String(parentValue))}`
              : field.apiEndpoint;
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
  }, [field.getOptions, field.apiEndpoint, field.dependsOn, parentValue]);

  return { options, loading, fetchError };
}
