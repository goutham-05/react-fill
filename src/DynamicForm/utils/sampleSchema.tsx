import { FormFieldSchema } from "../types/FormFieldSchema";

export const checkboxValidationSchema: FormFieldSchema[] = [
  // 1. At least one must be selected
  {
    name: "atLeastOne",
    label: "Select at least one",
    type: "group",
    validation: {
      custom: (value) => {
        const selected = ["A", "B", "C"].filter((key) => value?.[key]);
        return selected.length > 0 || "Please select at least one option";
      }
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 2. Specific checkbox required
  {
    name: "requireA",
    label: "A is required",
    type: "group",
    validation: {
      custom: (value) => value?.A || "Option A is required"
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 3. At least one from a subset
  {
    name: "atLeastOneFromSubset",
    label: "Select at least one from B or C",
    type: "group",
    validation: {
      custom: (value) => value?.B || value?.C || "Select at least one from B or C"
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 4. Multiple required checkboxes
  {
    name: "requireAandB",
    label: "A and B are required",
    type: "group",
    validation: {
      custom: (value) => {
        const missing = ["A", "B"].filter((key) => !value?.[key]);
        return missing.length === 0 || `Please select ${missing.join(" and ")}`;
      }
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 5. Conditional logic
  {
    name: "ifAthenB",
    label: "If A is selected, B must be too",
    type: "group",
    validation: {
      custom: (value) => {
        if (value?.A && !value?.B) return "If A is selected, B must also be selected";
        return true;
      }
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 6. Max selections
  {
    name: "maxTwo",
    label: "Select up to 2 options",
    type: "group",
    validation: {
      custom: (value) => {
        const selected = ["A", "B", "C"].filter((key) => value?.[key]);
        return selected.length <= 2 || "You can select up to 2 options only";
      }
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 7. Exactly N selections
  {
    name: "exactlyTwo",
    label: "Select exactly 2 options",
    type: "group",
    validation: {
      custom: (value) => {
        const selected = ["A", "B", "C"].filter((key) => value?.[key]);
        return selected.length === 2 || "Please select exactly 2 options";
      }
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  },

  // 8. Friendly error messages
  {
    name: "friendlyErrors",
    label: "A and B are required (friendly labels)",
    type: "group",
    validation: {
      custom: (value) => {
        const required = ["A", "B"];
        const labels = { A: "Option A", B: "Option B" };
        const missing = required.filter((key): key is keyof typeof labels => !value?.[key]);
        if (missing.length === 0) return true;
        const names = missing.map((key) => labels[key] || key);
        return `Please select ${names.join(" and ")}`;
      }
    },
    children: ["A", "B", "C"].map((key) => ({
      name: key,
      label: key,
      type: "checkbox"
    }))
  }
];
