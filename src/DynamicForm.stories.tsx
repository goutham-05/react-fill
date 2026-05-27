import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DynamicForm, FIELD_TYPES } from "./index";
import type { FormFieldSchema, SubmitButtonRenderProps } from "./index";

const meta: Meta<typeof DynamicForm> = {
  title: "DynamicForm",
  component: DynamicForm,
  args: {
    onSubmit: (data: Record<string, unknown>) => alert(JSON.stringify(data, null, 2)),
    submitLabel: "Submit",
  },
  argTypes: {
    columns: { control: { type: "select" }, options: [1, 2, 3] },
  },
};

export default meta;
type Story = StoryObj<typeof DynamicForm>;

// ─── Text & Email ─────────────────────────────────────────────────────────────

export const TextFields: Story = {
  name: "Text / Email",
  args: {
    schema: [
      { name: "full_name", label: "Full Name", type: FIELD_TYPES.TEXT, required: true, placeholder: "Jane Smith", helpText: "Enter your first and last name." },
      { name: "email", label: "Email Address", type: FIELD_TYPES.EMAIL, required: true, placeholder: "jane@example.com" },
      { name: "website", label: "Website", type: FIELD_TYPES.TEXT, placeholder: "https://", helpText: "Optional" },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Number ───────────────────────────────────────────────────────────────────

export const NumberField: Story = {
  name: "Number",
  args: {
    schema: [
      { name: "age", label: "Age", type: FIELD_TYPES.NUMBER, min: 0, max: 120, step: 1, required: true },
      { name: "score", label: "Score (0–100)", type: FIELD_TYPES.NUMBER, min: 0, max: 100, placeholder: "50" },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Textarea ─────────────────────────────────────────────────────────────────

export const TextareaField: Story = {
  name: "Textarea",
  args: {
    schema: [
      {
        name: "bio",
        label: "Bio",
        type: FIELD_TYPES.TEXTAREA,
        rows: 5,
        placeholder: "Tell us about yourself…",
        showWordCount: true,
        validation: { maxLength: { value: 300, message: "Max 300 characters" } },
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Select ───────────────────────────────────────────────────────────────────

export const SelectField: Story = {
  name: "Select",
  args: {
    schema: [
      {
        name: "country",
        label: "Country",
        type: FIELD_TYPES.SELECT,
        required: true,
        options: [
          { label: "United States", value: "us" },
          { label: "United Kingdom", value: "uk" },
          { label: "Canada", value: "ca" },
          { label: "Australia", value: "au" },
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Radio ────────────────────────────────────────────────────────────────────

export const RadioField: Story = {
  name: "Radio",
  args: {
    schema: [
      {
        name: "plan",
        label: "Choose a plan",
        type: FIELD_TYPES.RADIO,
        required: true,
        options: [
          { label: "Free — basic features", value: "free", helpText: "Great for personal projects" },
          { label: "Pro — $9/mo", value: "pro", helpText: "Unlimited everything" },
          { label: "Enterprise — custom", value: "enterprise", helpText: "Talk to sales" },
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export const CheckboxField: Story = {
  name: "Checkbox",
  args: {
    schema: [
      { name: "terms", label: "I accept the terms and conditions", type: FIELD_TYPES.CHECKBOX, required: true },
      {
        name: "interests",
        label: "Interests",
        type: FIELD_TYPES.CHECKBOX,
        options: [
          { label: "Frontend", value: "frontend" },
          { label: "Backend", value: "backend" },
          { label: "DevOps", value: "devops" },
          { label: "Design", value: "design" },
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Date ─────────────────────────────────────────────────────────────────────

export const DateField: Story = {
  name: "Date",
  args: {
    schema: [
      { name: "dob", label: "Date of Birth", type: FIELD_TYPES.DATE, required: true, max: new Date().toISOString().split("T")[0] },
      { name: "event_date", label: "Event Date", type: FIELD_TYPES.DATE, min: new Date().toISOString().split("T")[0] },
    ] satisfies FormFieldSchema[],
  },
};

// ─── File ─────────────────────────────────────────────────────────────────────

export const FileField: Story = {
  name: "File Upload",
  args: {
    schema: [
      { name: "avatar", label: "Profile Picture", type: FIELD_TYPES.FILE, accept: "image/*", helpText: "JPG, PNG, GIF up to 5MB" },
      { name: "documents", label: "Attachments", type: FIELD_TYPES.FILE, accept: ".pdf,.doc,.docx", multiple: true },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Slider ───────────────────────────────────────────────────────────────────

export const SliderField: Story = {
  name: "Slider",
  args: {
    schema: [
      { name: "volume", label: "Volume", type: FIELD_TYPES.SLIDER, min: 0, max: 100, step: 1, defaultValue: 50 },
      { name: "rating_scale", label: "Satisfaction (1–10)", type: FIELD_TYPES.SLIDER, min: 1, max: 10, step: 1, defaultValue: 5 },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Rating ───────────────────────────────────────────────────────────────────

export const RatingField: Story = {
  name: "Rating",
  args: {
    schema: [
      { name: "overall", label: "Overall Rating", type: FIELD_TYPES.RATING, starCount: 5, required: true },
      { name: "value", label: "Value for Money", type: FIELD_TYPES.RATING, starCount: 10 },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Conditional visibility ───────────────────────────────────────────────────

export const ConditionalFields: Story = {
  name: "Conditional (visibleWhen)",
  args: {
    schema: [
      {
        name: "contact_method",
        label: "Preferred contact",
        type: FIELD_TYPES.RADIO,
        required: true,
        options: [
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
        ],
      },
      {
        name: "email_address",
        label: "Email",
        type: FIELD_TYPES.EMAIL,
        required: true,
        placeholder: "you@example.com",
        visibleWhen: { conditions: [{ field: "contact_method", operator: "equals", value: "email" }] },
      },
      {
        name: "phone_number",
        label: "Phone",
        type: FIELD_TYPES.TEXT,
        required: true,
        placeholder: "+1 555 000 0000",
        visibleWhen: { conditions: [{ field: "contact_method", operator: "equals", value: "phone" }] },
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const ValidationRules: Story = {
  name: "Validation rules",
  args: {
    schema: [
      {
        name: "username",
        label: "Username",
        type: FIELD_TYPES.TEXT,
        required: true,
        validation: {
          minLength: { value: 3, message: "At least 3 characters" },
          maxLength: { value: 20, message: "At most 20 characters" },
          pattern: { value: /^[a-z0-9_]+$/, message: "Only lowercase letters, numbers, underscores" },
        },
      },
      {
        name: "password",
        label: "Password",
        type: FIELD_TYPES.TEXT,
        required: true,
        validation: {
          minLength: { value: 8, message: "At least 8 characters" },
        },
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Multi-column layout ──────────────────────────────────────────────────────

export const MultiColumnLayout: Story = {
  name: "Multi-column (3 cols)",
  args: {
    columns: 3,
    schema: [
      { name: "first_name", label: "First Name", type: FIELD_TYPES.TEXT, required: true, placeholder: "Jane" },
      { name: "last_name",  label: "Last Name",  type: FIELD_TYPES.TEXT, required: true, placeholder: "Smith" },
      { name: "email",      label: "Email",      type: FIELD_TYPES.EMAIL, required: true, placeholder: "jane@example.com" },
      { name: "address",    label: "Address",    type: FIELD_TYPES.TEXT, fullWidth: true, placeholder: "123 Main St" },
      { name: "city",       label: "City",       type: FIELD_TYPES.TEXT, placeholder: "New York" },
      { name: "zip",        label: "ZIP Code",   type: FIELD_TYPES.TEXT, placeholder: "10001" },
      { name: "notes",      label: "Notes",      type: FIELD_TYPES.TEXTAREA, rows: 3, fullWidth: true },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Field array ─────────────────────────────────────────────────────────────

export const FieldArrayStory: Story = {
  name: "Field array (repeater)",
  args: {
    schema: [
      {
        name: "contacts",
        label: "Emergency Contacts",
        type: FIELD_TYPES.FIELD_ARRAY,
        addButtonLabel: "+ Add contact",
        removeButtonLabel: "Remove",
        children: [
          { name: "name",  label: "Name",  type: FIELD_TYPES.TEXT,  required: true, placeholder: "Full name" },
          { name: "phone", label: "Phone", type: FIELD_TYPES.TEXT,  placeholder: "+1 555 000 0000" },
          { name: "rel",   label: "Relationship", type: FIELD_TYPES.SELECT, options: [
            { label: "Spouse", value: "spouse" },
            { label: "Parent", value: "parent" },
            { label: "Sibling", value: "sibling" },
            { label: "Friend", value: "friend" },
          ]},
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Custom submit button ─────────────────────────────────────────────────────

export const CustomSubmitButton: Story = {
  name: "Custom submit button (renderSubmitButton)",
  args: {
    schema: [
      { name: "email", label: "Email", type: FIELD_TYPES.EMAIL, required: true, placeholder: "you@example.com" },
      { name: "message", label: "Message", type: FIELD_TYPES.TEXTAREA, rows: 3, required: true },
    ] satisfies FormFieldSchema[],
    onSubmit: (data: Record<string, unknown>) =>
      new Promise<void>((res) => setTimeout(() => { alert(JSON.stringify(data, null, 2)); res(); }, 1500)),
    renderSubmitButton: ({ isSubmitting, isValid, isDirty, label }: SubmitButtonRenderProps) => (
      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 24px", borderRadius: 8,
          background: isSubmitting ? "#6b7280" : isValid ? "#059669" : "#2563eb",
          color: "#fff", border: "none", fontWeight: 600, fontSize: 14,
          cursor: isSubmitting || !isDirty ? "not-allowed" : "pointer",
          opacity: !isDirty ? 0.6 : 1,
          transition: "background 0.2s",
        }}
      >
        {isSubmitting && (
          <span style={{
            width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff", borderRadius: "50%",
            animation: "spin 0.7s linear infinite", display: "inline-block",
          }} />
        )}
        {isSubmitting ? "Sending…" : label}
      </button>
    ),
  } as any,
};

export const IconButtons: Story = {
  name: "Built-in buttons with icons",
  args: {
    schema: [
      { name: "name", label: "Full Name", type: FIELD_TYPES.TEXT, required: true, placeholder: "Jane Smith" },
    ] satisfies FormFieldSchema[],
    showReset: true,
    submitLabel: "Save",
    resetLabel: "Clear",
    submitButtonIcon: "💾",
    resetButtonIcon: "↺",
  },
};

// ─── Async options ────────────────────────────────────────────────────────────

const delay = <T,>(ms: number, value: T): Promise<T> =>
  new Promise((res) => setTimeout(() => res(value), ms));

export const AsyncSelect: Story = {
  name: "Async options — Select",
  args: {
    schema: [
      {
        name: "framework",
        label: "Favourite framework",
        type: FIELD_TYPES.SELECT,
        required: true,
        helpText: "Options load after a 1 s simulated delay.",
        getOptions: () =>
          delay(1000, [
            { label: "React", value: "react" },
            { label: "Vue", value: "vue" },
            { label: "Svelte", value: "svelte" },
            { label: "Angular", value: "angular" },
          ]),
      },
    ] satisfies FormFieldSchema[],
  },
};

export const DependentSelect: Story = {
  name: "Async options — Dependent select (country → state)",
  args: {
    schema: [
      {
        name: "country",
        label: "Country",
        type: FIELD_TYPES.SELECT,
        required: true,
        options: [
          { label: "United States", value: "us" },
          { label: "Canada", value: "ca" },
          { label: "Australia", value: "au" },
        ],
      },
      {
        name: "state",
        label: "State / Province",
        type: FIELD_TYPES.SELECT,
        required: true,
        dependsOn: "country",
        helpText: "Updates when you pick a country (800 ms simulated latency).",
        getOptions: (country: string) => {
          const map: Record<string, { label: string; value: string }[]> = {
            us: [
              { label: "California", value: "ca" },
              { label: "New York", value: "ny" },
              { label: "Texas", value: "tx" },
            ],
            ca: [
              { label: "Ontario", value: "on" },
              { label: "British Columbia", value: "bc" },
              { label: "Quebec", value: "qc" },
            ],
            au: [
              { label: "New South Wales", value: "nsw" },
              { label: "Victoria", value: "vic" },
              { label: "Queensland", value: "qld" },
            ],
          };
          return delay(800, map[country] ?? []);
        },
      },
    ] satisfies FormFieldSchema[],
  },
};

export const AsyncRadio: Story = {
  name: "Async options — Radio",
  args: {
    schema: [
      {
        name: "plan",
        label: "Choose a plan",
        type: FIELD_TYPES.RADIO,
        required: true,
        helpText: "Options load after a 900 ms simulated delay.",
        getOptions: () =>
          delay(900, [
            { label: "Free — basic features", value: "free", helpText: "Great for personal projects" },
            { label: "Pro — $9/mo", value: "pro", helpText: "Unlimited everything" },
            { label: "Enterprise — custom", value: "enterprise", helpText: "Talk to sales" },
          ]),
      },
    ] satisfies FormFieldSchema[],
  },
};

export const AsyncCheckbox: Story = {
  name: "Async options — Checkbox group",
  args: {
    schema: [
      {
        name: "interests",
        label: "Interests",
        type: FIELD_TYPES.CHECKBOX,
        helpText: "Options load after a 700 ms simulated delay.",
        getOptions: () =>
          delay(700, [
            { label: "Frontend", value: "frontend" },
            { label: "Backend", value: "backend" },
            { label: "DevOps", value: "devops" },
            { label: "Design", value: "design" },
            { label: "Mobile", value: "mobile" },
          ]),
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Multi-field row ──────────────────────────────────────────────────────────

export const MultiFieldRow: Story = {
  name: "Multi-field row (multiField + flex)",
  args: {
    columns: 1,
    schema: [
      {
        name: "nameRow",
        label: "Full Name",
        type: FIELD_TYPES.MULTI_FIELD,
        multipleField: [
          { name: "firstName",    label: "First Name",    type: FIELD_TYPES.TEXT, required: true, placeholder: "Jane" },
          { name: "middleInitial",label: "M.I.",          type: FIELD_TYPES.TEXT, placeholder: "A", flex: 0.4 },
          { name: "lastName",     label: "Last Name",     type: FIELD_TYPES.TEXT, required: true, placeholder: "Smith" },
        ],
      },
      {
        name: "cityStateZip",
        label: "City / State / ZIP",
        type: FIELD_TYPES.MULTI_FIELD,
        multipleField: [
          { name: "city",  label: "City",     type: FIELD_TYPES.TEXT,   required: true, placeholder: "New York", flex: 3 },
          { name: "state", label: "State",    type: FIELD_TYPES.SELECT, required: true, flex: 1, options: [
            { label: "CA", value: "ca" }, { label: "NY", value: "ny" }, { label: "TX", value: "tx" },
          ]},
          { name: "zip",   label: "ZIP Code", type: FIELD_TYPES.TEXT,   required: true, placeholder: "10001", flex: 1 },
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Cross-field validation ───────────────────────────────────────────────────

export const CrossFieldValidation: Story = {
  name: "Cross-field validation (validate)",
  args: {
    columns: 1,
    mode: "onBlur",
    schema: [
      {
        name: "email",
        label: "Email",
        type: FIELD_TYPES.EMAIL,
        required: true,
        placeholder: "you@example.com",
      },
      {
        name: "confirmEmail",
        label: "Confirm Email",
        type: FIELD_TYPES.EMAIL,
        required: true,
        placeholder: "you@example.com",
        validation: {
          validate: (value: any, formValues?: Record<string, any>) =>
            value === formValues?.["email"] || "Emails do not match",
        },
      },
      {
        name: "password",
        label: "Password",
        type: FIELD_TYPES.TEXT,
        required: true,
        validation: { minLength: { value: 8, message: "At least 8 characters" } },
      },
      {
        name: "confirmPassword",
        label: "Confirm Password",
        type: FIELD_TYPES.TEXT,
        required: true,
        validation: {
          validate: (value: any, formValues?: Record<string, any>) =>
            value === formValues?.["password"] || "Passwords do not match",
        },
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Theme — inline styles ────────────────────────────────────────────────────

export const ThemeInlineStyles: Story = {
  name: "Theme — inline styles (inputStyle / labelStyle)",
  args: {
    columns: 1,
    theme: {
      inputStyle: {
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: "#6B748E",
        borderRadius: "8px",
        height: "48px",
        padding: "12px 16px",
        fontSize: "14px",
      },
      labelStyle: {
        fontWeight: 600,
        fontSize: "14px",
        color: "#111827",
        marginBottom: "6px",
      },
      wrapperStyle: { marginBottom: "1.25rem" },
    },
    schema: [
      { name: "firstName",   label: "First Name",    type: FIELD_TYPES.TEXT,   required: true, placeholder: "Jane" },
      { name: "lastName",    label: "Last Name",     type: FIELD_TYPES.TEXT,   required: true, placeholder: "Smith" },
      { name: "email",       label: "Email",         type: FIELD_TYPES.EMAIL,  required: true, placeholder: "jane@example.com" },
      { name: "country",     label: "Country",       type: FIELD_TYPES.SELECT, required: true, options: [
        { label: "United States", value: "us" },
        { label: "United Kingdom", value: "uk" },
        { label: "Canada", value: "ca" },
      ]},
    ] satisfies FormFieldSchema[],
  } as any,
};

// ─── Theme — component registry ──────────────────────────────────────────────

const CustomSelectField: React.FC<{ field: any; name: string; error?: any; register: any }> = ({ field, name, error }) => {
  const { control } = (window as any).__RHF_CONTEXT__ ?? {};
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={name} style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 13, color: "#374151" }}>
        {field.label}{field.required && <span style={{ color: "red", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{
        padding: "8px 12px", border: `1.5px solid ${error ? "#ef4444" : "#6366f1"}`,
        borderRadius: 8, background: "#f5f3ff", color: "#4f46e5", fontSize: 14, fontWeight: 500
      }}>
        <select
          id={name}
          style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: "inherit", fontSize: "inherit", fontWeight: "inherit", cursor: "pointer" }}
        >
          <option value="">Select…</option>
          {field.options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error.message ?? "Required"}</p>}
    </div>
  );
};

export const ThemeComponentRegistry: Story = {
  name: "Theme — components registry (custom select)",
  args: {
    columns: 1,
    theme: {
      components: {
        select: CustomSelectField,
      },
    },
    schema: [
      { name: "name",      label: "Full Name", type: FIELD_TYPES.TEXT,   required: true, placeholder: "Jane Smith" },
      { name: "framework", label: "Framework", type: FIELD_TYPES.SELECT, required: true, options: [
        { label: "React",   value: "react" },
        { label: "Vue",     value: "vue" },
        { label: "Svelte",  value: "svelte" },
        { label: "Angular", value: "angular" },
      ]},
      { name: "language",  label: "Language",  type: FIELD_TYPES.SELECT, required: true, options: [
        { label: "TypeScript", value: "ts" },
        { label: "JavaScript", value: "js" },
      ]},
    ] satisfies FormFieldSchema[],
  } as any,
};

// ─── New field types: multiselect / time / datetime ──────────────────────────

export const MultiSelectField: Story = {
  name: "Multi-select (searchable dropdown)",
  args: {
    columns: 1,
    schema: [
      {
        name: "frameworks",
        label: "Frameworks",
        type: FIELD_TYPES.MULTISELECT,
        required: true,
        helpText: "Select all that apply. Use the search box to filter.",
        options: [
          { label: "React",      value: "react" },
          { label: "Vue",        value: "vue" },
          { label: "Angular",    value: "angular" },
          { label: "Svelte",     value: "svelte" },
          { label: "SolidJS",    value: "solid" },
          { label: "Next.js",    value: "next" },
          { label: "Remix",      value: "remix" },
          { label: "Astro",      value: "astro" },
        ],
      },
      {
        name: "skills",
        label: "Skills (async)",
        type: FIELD_TYPES.MULTISELECT,
        helpText: "Options loaded asynchronously after 600 ms.",
        getOptions: () =>
          new Promise((res) =>
            setTimeout(() => res([
              { label: "TypeScript", value: "ts" },
              { label: "GraphQL",    value: "gql" },
              { label: "Docker",     value: "docker" },
              { label: "Kubernetes", value: "k8s" },
              { label: "Terraform",  value: "tf" },
            ]), 600)
          ),
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Time & Datetime ──────────────────────────────────────────────────────────

export const TimeAndDatetime: Story = {
  name: "Time & Datetime fields",
  args: {
    columns: 2,
    schema: [
      {
        name: "startTime",
        label: "Start Time",
        type: FIELD_TYPES.TIME,
        required: true,
        min: "08:00",
        max: "18:00",
        helpText: "Between 08:00 and 18:00",
      },
      {
        name: "endTime",
        label: "End Time",
        type: FIELD_TYPES.TIME,
        min: "08:00",
        max: "22:00",
        step: 900,
        helpText: "15-minute increments",
      },
      {
        name: "scheduledAt",
        label: "Scheduled Date & Time",
        type: FIELD_TYPES.DATETIME,
        required: true,
        fullWidth: true,
        helpText: "Exact date and time for the event.",
      },
      {
        name: "deadline",
        label: "Deadline",
        type: FIELD_TYPES.DATETIME,
        fullWidth: true,
        min: new Date().toISOString().slice(0, 16),
        helpText: "Cannot be in the past.",
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── requiredWhen + disabledWhen ──────────────────────────────────────────────

export const ConditionalRequiredDisabled: Story = {
  name: "Conditional required & disabled",
  args: {
    columns: 1,
    schema: [
      {
        name: "accountType",
        label: "Account Type",
        type: FIELD_TYPES.SELECT,
        required: true,
        options: [
          { label: "Personal",  value: "personal"  },
          { label: "Business",  value: "business"  },
          { label: "Non-Profit",value: "nonprofit" },
        ],
        helpText: "Drives the required/disabled state of fields below.",
      },
      {
        name: "companyName",
        label: "Company Name",
        type: FIELD_TYPES.TEXT,
        placeholder: "Acme Inc.",
        // Required only for business or non-profit accounts
        requiredWhen: {
          logic: "OR",
          conditions: [
            { field: "accountType", operator: "equals",  value: "business"  },
            { field: "accountType", operator: "equals",  value: "nonprofit" },
          ],
        },
        helpText: "Required for business / non-profit accounts.",
      },
      {
        name: "taxId",
        label: "Tax ID",
        type: FIELD_TYPES.TEXT,
        placeholder: "XX-XXXXXXX",
        // Required for business, disabled for personal
        requiredWhen: {
          conditions: [{ field: "accountType", operator: "equals", value: "business" }],
        },
        disabledWhen: {
          conditions: [{ field: "accountType", operator: "equals", value: "personal" }],
        },
        helpText: "Required for business. Disabled for personal accounts.",
      },
      {
        name: "discountCode",
        label: "Discount Code",
        type: FIELD_TYPES.TEXT,
        placeholder: "SAVE20",
        // Disabled unless account is non-profit
        disabledWhen: {
          conditions: [{ field: "accountType", operator: "notEquals", value: "nonprofit" }],
        },
        helpText: "Only available for non-profit accounts.",
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── dependsOn: string[] ──────────────────────────────────────────────────────

export const MultiDependsOn: Story = {
  name: "Async options — multi-field dependsOn",
  args: {
    columns: 1,
    schema: [
      {
        name: "region",
        label: "Region",
        type: FIELD_TYPES.SELECT,
        required: true,
        options: [
          { label: "North America", value: "na" },
          { label: "Europe",        value: "eu" },
          { label: "Asia-Pacific",  value: "apac" },
        ],
      },
      {
        name: "tier",
        label: "Tier",
        type: FIELD_TYPES.SELECT,
        required: true,
        options: [
          { label: "Starter", value: "starter" },
          { label: "Pro",     value: "pro"     },
          { label: "Enterprise", value: "enterprise" },
        ],
      },
      {
        name: "dataCenter",
        label: "Data Center",
        type: FIELD_TYPES.SELECT,
        required: true,
        dependsOn: ["region", "tier"],
        helpText: "Options are filtered by both Region and Tier. Select both fields above first.",
        getOptions: ({ region, tier }: { region: string; tier: string }) => {
          const map: Record<string, Record<string, { label: string; value: string }[]>> = {
            na: {
              starter:    [{ label: "US-East (shared)",   value: "us-e-shared" }],
              pro:        [{ label: "US-East",             value: "us-e" }, { label: "US-West", value: "us-w" }],
              enterprise: [{ label: "US-East (dedicated)", value: "us-e-ded"  }, { label: "US-West (dedicated)", value: "us-w-ded" }],
            },
            eu: {
              starter:    [{ label: "EU-West (shared)",    value: "eu-w-shared" }],
              pro:        [{ label: "EU-West",              value: "eu-w"  }, { label: "EU-Central", value: "eu-c" }],
              enterprise: [{ label: "EU-West (dedicated)",  value: "eu-w-ded"   }],
            },
            apac: {
              starter:    [{ label: "APAC (shared)",        value: "apac-shared" }],
              pro:        [{ label: "APAC-Singapore",        value: "apac-sg" }],
              enterprise: [{ label: "APAC-Singapore (dedicated)", value: "apac-sg-ded" }],
            },
          };
          return new Promise((res) =>
            setTimeout(() => res(map[region]?.[tier] ?? []), 400)
          );
        },
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Error summary + TypeScript generic ──────────────────────────────────────

export const ErrorSummaryAndGeneric: Story = {
  name: "Error summary + TypeScript generic",
  args: {
    columns: 1,
    showErrorSummary: true,
    errorSummaryTitle: "Please fix the following before submitting:",
    mode: "onSubmit",
    schema: [
      {
        name: "fullName",
        label: "Full Name",
        type: FIELD_TYPES.TEXT,
        required: true,
        validation: {
          minLength: { value: 3, message: "Full name must be at least 3 characters" },
        },
      },
      {
        name: "email",
        label: "Email",
        type: FIELD_TYPES.EMAIL,
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: FIELD_TYPES.TEXT,
        required: true,
        validation: {
          minLength: { value: 8, message: "Password must be at least 8 characters" },
        },
      },
      {
        name: "role",
        label: "Role",
        type: FIELD_TYPES.SELECT,
        required: true,
        options: [
          { label: "Developer",   value: "dev" },
          { label: "Designer",    value: "design" },
          { label: "Manager",     value: "mgr" },
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Option icons (radio + checkbox) ─────────────────────────────────────────

export const OptionIcons: Story = {
  name: "Option icons (radio + checkbox)",
  args: {
    columns: 1,
    schema: [
      {
        name: "plan",
        label: "Choose a plan",
        type: FIELD_TYPES.RADIO,
        required: true,
        options: [
          { label: "Free",       value: "free",       icon: "💸", helpText: "Up to 3 projects" },
          { label: "Pro — $9/mo",value: "pro",        icon: "⚡", helpText: "Unlimited projects" },
          { label: "Enterprise", value: "enterprise", icon: "🏢", helpText: "Custom SLA & support" },
        ],
      },
      {
        name: "features",
        label: "Extra features",
        type: FIELD_TYPES.CHECKBOX,
        options: [
          { label: "Analytics",    value: "analytics",    icon: "📊" },
          { label: "CI/CD",        value: "cicd",         icon: "🔄" },
          { label: "Custom domain",value: "domain",       icon: "🌐" },
          { label: "Priority support", value: "support",  icon: "🎯" },
        ],
      },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Full kitchen-sink form ───────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: "Kitchen sink",
  args: {
    columns: 2,
    schema: [
      { name: "first_name", label: "First Name", type: FIELD_TYPES.TEXT, required: true, placeholder: "Jane" },
      { name: "last_name",  label: "Last Name",  type: FIELD_TYPES.TEXT, required: true, placeholder: "Smith" },
      { name: "email",      label: "Email",       type: FIELD_TYPES.EMAIL, required: true, placeholder: "jane@example.com", fullWidth: true },
      { name: "dob",        label: "Date of Birth", type: FIELD_TYPES.DATE },
      { name: "age",        label: "Age",          type: FIELD_TYPES.NUMBER, min: 0, max: 120 },
      { name: "bio",        label: "Bio",          type: FIELD_TYPES.TEXTAREA, rows: 3, fullWidth: true, showWordCount: true },
      { name: "plan",       label: "Plan",         type: FIELD_TYPES.SELECT, required: true, fullWidth: true, options: [
        { label: "Free", value: "free" },
        { label: "Pro", value: "pro" },
      ]},
      { name: "satisfaction", label: "Satisfaction", type: FIELD_TYPES.RATING, starCount: 5, fullWidth: true },
      { name: "avatar",     label: "Profile picture", type: FIELD_TYPES.FILE, accept: "image/*", fullWidth: true },
      { name: "terms",      label: "I accept the terms", type: FIELD_TYPES.CHECKBOX, required: true, fullWidth: true },
    ] satisfies FormFieldSchema[],
  },
};
