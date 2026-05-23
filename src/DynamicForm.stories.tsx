import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DynamicForm } from "./index";
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
      { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Jane Smith", helpText: "Enter your first and last name." },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "jane@example.com" },
      { name: "website", label: "Website", type: "text", placeholder: "https://", helpText: "Optional" },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Number ───────────────────────────────────────────────────────────────────

export const NumberField: Story = {
  name: "Number",
  args: {
    schema: [
      { name: "age", label: "Age", type: "number", min: 0, max: 120, step: 1, required: true },
      { name: "score", label: "Score (0–100)", type: "number", min: 0, max: 100, placeholder: "50" },
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
        type: "textarea",
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
        type: "select",
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
        type: "radio",
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
      { name: "terms", label: "I accept the terms and conditions", type: "checkbox", required: true },
      {
        name: "interests",
        label: "Interests",
        type: "checkbox",
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
      { name: "dob", label: "Date of Birth", type: "date", required: true, max: new Date().toISOString().split("T")[0] },
      { name: "event_date", label: "Event Date", type: "date", min: new Date().toISOString().split("T")[0] },
    ] satisfies FormFieldSchema[],
  },
};

// ─── File ─────────────────────────────────────────────────────────────────────

export const FileField: Story = {
  name: "File Upload",
  args: {
    schema: [
      { name: "avatar", label: "Profile Picture", type: "file", accept: "image/*", helpText: "JPG, PNG, GIF up to 5MB" },
      { name: "documents", label: "Attachments", type: "file", accept: ".pdf,.doc,.docx", multiple: true },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Slider ───────────────────────────────────────────────────────────────────

export const SliderField: Story = {
  name: "Slider",
  args: {
    schema: [
      { name: "volume", label: "Volume", type: "slider", min: 0, max: 100, step: 1, defaultValue: 50 },
      { name: "rating_scale", label: "Satisfaction (1–10)", type: "slider", min: 1, max: 10, step: 1, defaultValue: 5 },
    ] satisfies FormFieldSchema[],
  },
};

// ─── Rating ───────────────────────────────────────────────────────────────────

export const RatingField: Story = {
  name: "Rating",
  args: {
    schema: [
      { name: "overall", label: "Overall Rating", type: "rating", starCount: 5, required: true },
      { name: "value", label: "Value for Money", type: "rating", starCount: 10 },
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
        type: "radio",
        required: true,
        options: [
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
        ],
      },
      {
        name: "email_address",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "you@example.com",
        visibleWhen: { conditions: [{ field: "contact_method", operator: "equals", value: "email" }] },
      },
      {
        name: "phone_number",
        label: "Phone",
        type: "text",
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
        type: "text",
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
        type: "text",
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
      { name: "first_name", label: "First Name", type: "text", required: true, placeholder: "Jane" },
      { name: "last_name",  label: "Last Name",  type: "text", required: true, placeholder: "Smith" },
      { name: "email",      label: "Email",      type: "email", required: true, placeholder: "jane@example.com" },
      { name: "address",    label: "Address",    type: "text", fullWidth: true, placeholder: "123 Main St" },
      { name: "city",       label: "City",       type: "text", placeholder: "New York" },
      { name: "zip",        label: "ZIP Code",   type: "text", placeholder: "10001" },
      { name: "notes",      label: "Notes",      type: "textarea", rows: 3, fullWidth: true },
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
        type: "fieldArray",
        addButtonLabel: "+ Add contact",
        removeButtonLabel: "Remove",
        children: [
          { name: "name",  label: "Name",  type: "text",  required: true, placeholder: "Full name" },
          { name: "phone", label: "Phone", type: "text",  placeholder: "+1 555 000 0000" },
          { name: "rel",   label: "Relationship", type: "select", options: [
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
      { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
      { name: "message", label: "Message", type: "textarea", rows: 3, required: true },
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
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Jane Smith" },
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
        type: "select",
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
        type: "select",
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
        type: "select",
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
        type: "radio",
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
        type: "checkbox",
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

// ─── Full kitchen-sink form ───────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: "Kitchen sink",
  args: {
    columns: 2,
    schema: [
      { name: "first_name", label: "First Name", type: "text", required: true, placeholder: "Jane" },
      { name: "last_name",  label: "Last Name",  type: "text", required: true, placeholder: "Smith" },
      { name: "email",      label: "Email",       type: "email", required: true, placeholder: "jane@example.com", fullWidth: true },
      { name: "dob",        label: "Date of Birth", type: "date" },
      { name: "age",        label: "Age",          type: "number", min: 0, max: 120 },
      { name: "bio",        label: "Bio",          type: "textarea", rows: 3, fullWidth: true, showWordCount: true },
      { name: "plan",       label: "Plan",         type: "select", required: true, fullWidth: true, options: [
        { label: "Free", value: "free" },
        { label: "Pro", value: "pro" },
      ]},
      { name: "satisfaction", label: "Satisfaction", type: "rating", starCount: 5, fullWidth: true },
      { name: "avatar",     label: "Profile picture", type: "file", accept: "image/*", fullWidth: true },
      { name: "terms",      label: "I accept the terms", type: "checkbox", required: true, fullWidth: true },
    ] satisfies FormFieldSchema[],
  },
};
