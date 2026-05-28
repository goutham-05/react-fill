import { useMemo, useRef, useState } from "react";
import { DynamicForm } from "@oqlet/react-fill";
import type { DynamicFormHandle, FormFieldSchema, FormTheme } from "@oqlet/react-fill";
import { useTheme } from "../ThemeContext";

type ExampleId =
  | "signup"
  | "login"
  | "profile"
  | "validation"
  | "review"
  | "modal"
  | "quiz"
  | "programmatic";

type Example = {
  id: ExampleId;
  label: string;
  title: string;
  description: string;
  schema: FormFieldSchema[];
  submitLabel: string;
  defaultValues?: Record<string, unknown>;
  columns?: number;
  showReset?: boolean;
};

type SchemaCode = {
  schema: string;
  usage: string;
  theme: string;
  custom?: string;
};

const TOGGLE_INPUT =
  "h-4 w-4 shrink-0 cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25";

const baseTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5",
  inputClass:
    "w-full bg-white dark:bg-zinc-900/70 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all",
  radioInputClass: TOGGLE_INPUT,
  checkboxInputClass: TOGGLE_INPUT,
  inputErrorClass: "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/30",
  errorClass: "mt-1.5 text-xs text-red-500 dark:text-red-400",
  helpTextClass: "mt-1 text-xs text-gray-500 dark:text-zinc-500",
  requiredMarkClass: "text-red-500 dark:text-red-400 ml-0.5",
  radioGroupClass: "flex flex-col gap-2 mt-1",
  optionWrapperClass: "flex items-center gap-2.5 text-sm text-gray-700 dark:text-zinc-300",
  checkboxGroupClass: "mt-1",
  submitButtonClass:
    "w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer",
};

function PasswordField({
  name,
  field,
  error,
  register,
}: {
  name: string;
  field: FormFieldSchema;
  error?: { message?: string };
  register: (name: string, rules?: Record<string, unknown>) => Record<string, unknown>;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5"
      >
        {field.label}
        {field.required ? <span className="text-red-500 dark:text-red-400 ml-0.5">*</span> : null}
      </label>
      <input
        id={name}
        type="password"
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        className={[
          baseTheme.inputClass,
          error ? baseTheme.inputErrorClass : "",
        ].join(" ")}
        {...register(name, {
          required: field.required,
          minLength: field.validation?.minLength,
          validate: field.validation?.validate,
        })}
      />
      {field.helpText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{field.helpText}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
          {error.message ?? "Please check this field"}
        </p>
      ) : null}
    </div>
  );
}

const passwordField = (field: Omit<FormFieldSchema, "type" | "overrideComponent">): FormFieldSchema => ({
  ...field,
  type: "text",
  overrideComponent: PasswordField,
});

const signupSchema: FormFieldSchema[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    placeholder: "Avery Johnson",
  },
  {
    name: "workEmail",
    label: "Work email",
    type: "email",
    required: true,
    placeholder: "avery@company.com",
    validation: {
      pattern: {
        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: "Enter a valid email address",
      },
    },
  },
  passwordField({
    name: "password",
    label: "Password",
    required: true,
    placeholder: "At least 8 characters",
    validation: {
      minLength: { value: 8, message: "Use at least 8 characters" },
    },
  }),
  passwordField({
    name: "confirmPassword",
    label: "Confirm password",
    required: true,
    placeholder: "Re-enter password",
    validation: {
      validate: (value: unknown, values?: Record<string, unknown>) =>
        value === values?.password || "Passwords must match",
    },
  }),
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Founder", value: "founder" },
      { label: "Engineer", value: "engineer" },
      { label: "Designer", value: "designer" },
      { label: "Product manager", value: "product" },
    ],
  },
  {
    name: "terms",
    label: "I agree to the terms",
    type: "checkbox",
    required: true,
    fullWidth: true,
  },
];

const loginSchema: FormFieldSchema[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  passwordField({
    name: "password",
    label: "Password",
    required: true,
    placeholder: "Your password",
  }),
  {
    name: "remember",
    label: "Keep me signed in",
    type: "checkbox",
    fullWidth: true,
  },
];

const profileSchema: FormFieldSchema[] = [
  {
    name: "displayName",
    label: "Display name",
    type: "text",
    required: true,
    placeholder: "Avery Johnson",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "avery@company.com",
  },
  {
    name: "teamSize",
    label: "Team size",
    type: "select",
    required: true,
    options: [
      { label: "1-5", value: "1-5" },
      { label: "6-20", value: "6-20" },
      { label: "21-100", value: "21-100" },
      { label: "100+", value: "100+" },
    ],
  },
  {
    name: "timezone",
    label: "Timezone",
    type: "select",
    options: [
      { label: "Pacific Time", value: "America/Los_Angeles" },
      { label: "Eastern Time", value: "America/New_York" },
      { label: "London", value: "Europe/London" },
      { label: "India", value: "Asia/Kolkata" },
    ],
  },
  {
    name: "bio",
    label: "Bio",
    type: "textarea",
    rows: 3,
    maxLength: 180,
    showWordCount: true,
    placeholder: "Short public profile summary.",
    fullWidth: true,
  },
  {
    name: "newsletter",
    label: "Send me product updates",
    type: "checkbox",
    fullWidth: true,
  },
];

const validationSchema: FormFieldSchema[] = [
  {
    name: "email",
    label: "Billing email",
    type: "email",
    required: true,
    placeholder: "billing@company.com",
    validation: {
      pattern: {
        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: "Use a valid billing email",
      },
    },
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    inputMode: "tel",
    required: true,
    placeholder: "+1 555 0134",
    validation: {
      pattern: {
        value: /^\+?[0-9\s().-]{7,20}$/,
        message: "Use a valid phone number",
      },
    },
  },
  {
    name: "seats",
    label: "Seats",
    type: "number",
    required: true,
    min: 1,
    max: 250,
    helpText: "Between 1 and 250 seats.",
  },
  {
    name: "budget",
    label: "Monthly budget",
    type: "number",
    required: true,
    min: 50,
    max: 10000,
  },
  {
    name: "cardLast4",
    label: "Card last 4",
    type: "text",
    required: true,
    placeholder: "4242",
    validation: {
      pattern: {
        value: /^\d{4}$/,
        message: "Enter exactly 4 digits",
      },
    },
  },
  {
    name: "notes",
    label: "Internal notes",
    type: "textarea",
    rows: 3,
    maxLength: 220,
    showWordCount: true,
    fullWidth: true,
  },
];

const reviewSchema: FormFieldSchema[] = [
  {
    name: "rating",
    label: "Rating",
    type: "rating",
    required: true,
    helpText: "Click a score from 1 to 5.",
  },
  {
    name: "usage",
    label: "What did you use it for?",
    type: "select",
    required: true,
    options: [
      { label: "Signup flow", value: "signup" },
      { label: "Internal admin tool", value: "admin" },
      { label: "Survey or feedback", value: "survey" },
      { label: "Prototype", value: "prototype" },
    ],
  },
  {
    name: "comment",
    label: "Review",
    type: "textarea",
    required: true,
    rows: 4,
    maxLength: 280,
    showWordCount: true,
    placeholder: "What worked well? What should improve?",
    fullWidth: true,
  },
  {
    name: "canContact",
    label: "You can contact me about this review",
    type: "checkbox",
    fullWidth: true,
  },
  {
    name: "contactEmail",
    label: "Contact email",
    type: "email",
    placeholder: "reviewer@example.com",
    visibleWhen: {
      conditions: [{ field: "canContact", operator: "equals", value: true }],
    },
    requiredWhen: {
      conditions: [{ field: "canContact", operator: "equals", value: true }],
    },
  },
];

const modalSchema: FormFieldSchema[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Morgan Lee",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "morgan@company.com",
  },
  {
    name: "topic",
    label: "Topic",
    type: "select",
    required: true,
    options: [
      { label: "Implementation help", value: "implementation" },
      { label: "Bug report", value: "bug" },
      { label: "Feature request", value: "feature" },
    ],
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    rows: 4,
    placeholder: "Tell us what you are building.",
    fullWidth: true,
  },
];

const quizSchema: FormFieldSchema[] = [
  {
    name: "goal",
    label: "What are you building?",
    type: "radio",
    required: true,
    fullWidth: true,
    options: [
      { label: "A production signup flow", value: "signup" },
      { label: "A customer feedback form", value: "feedback" },
      { label: "A guided onboarding wizard", value: "wizard" },
    ],
  },
  {
    name: "authFields",
    label: "Which auth fields do you need?",
    type: "checkbox",
    fullWidth: true,
    checkboxGroupClass: "grid gap-2 sm:grid-cols-2",
    optionWrapperClass:
      "flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
    options: [
      { label: "Email", value: "email" },
      { label: "Password", value: "password" },
      { label: "Company name", value: "company" },
      { label: "Terms checkbox", value: "terms" },
    ],
    visibleWhen: {
      conditions: [{ field: "goal", operator: "equals", value: "signup" }],
    },
  },
  {
    name: "reviewDepth",
    label: "How detailed should feedback be?",
    type: "select",
    options: [
      { label: "Quick rating", value: "quick" },
      { label: "Rating plus written review", value: "written" },
      { label: "Full research survey", value: "research" },
    ],
    visibleWhen: {
      conditions: [{ field: "goal", operator: "equals", value: "feedback" }],
    },
  },
  {
    name: "steps",
    label: "How many wizard steps?",
    type: "number",
    min: 2,
    max: 8,
    defaultValue: 3,
    visibleWhen: {
      conditions: [{ field: "goal", operator: "equals", value: "wizard" }],
    },
  },
  {
    name: "needsConditionalLogic",
    label: "This flow needs conditional fields",
    type: "checkbox",
    fullWidth: true,
    visibleWhen: {
      conditions: [{ field: "goal", operator: "exists" }],
    },
  },
  {
    name: "conditionNote",
    label: "Condition note",
    type: "textarea",
    rows: 3,
    placeholder: "Example: Ask for tax ID only for business accounts.",
    fullWidth: true,
    visibleWhen: {
      conditions: [{ field: "needsConditionalLogic", operator: "equals", value: true }],
    },
    requiredWhen: {
      conditions: [{ field: "needsConditionalLogic", operator: "equals", value: true }],
    },
  },
];

const programmaticSchema: FormFieldSchema[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "ops@company.com",
  },
  {
    name: "plan",
    label: "Plan",
    type: "select",
    required: true,
    options: [
      { label: "Starter", value: "starter" },
      { label: "Growth", value: "growth" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    name: "seats",
    label: "Seats",
    type: "number",
    min: 1,
    max: 500,
    defaultValue: 5,
  },
  {
    name: "sendInvite",
    label: "Send invite email",
    type: "checkbox",
    fullWidth: true,
  },
];

const examples: Example[] = [
  {
    id: "signup",
    label: "Signup",
    title: "Signup form",
    description: "Account creation with email validation, password confirmation, role selection, and terms.",
    schema: signupSchema,
    submitLabel: "Create account",
    columns: 2,
  },
  {
    id: "login",
    label: "Login",
    title: "Login form",
    description: "A compact authentication form with password input and a remember-me option.",
    schema: loginSchema,
    submitLabel: "Sign in",
  },
  {
    id: "profile",
    label: "Edit profile",
    title: "Edit profile form",
    description: "A prefilled update flow using defaultValues, word count, selects, and reset behavior.",
    schema: profileSchema,
    submitLabel: "Save profile",
    columns: 2,
    defaultValues: {
      displayName: "Avery Johnson",
      email: "avery@company.com",
      teamSize: "6-20",
      timezone: "Europe/London",
      bio: "Building internal workflow tools with schema-driven forms.",
      newsletter: true,
    },
    showReset: true,
  },
  {
    id: "validation",
    label: "Validation",
    title: "Validation form",
    description: "Pattern checks, min/max numbers, custom messages, required fields, and textarea limits.",
    schema: validationSchema,
    submitLabel: "Validate request",
    columns: 2,
  },
  {
    id: "review",
    label: "Review",
    title: "Review form",
    description: "Rating, structured context, written feedback, and conditional contact details.",
    schema: reviewSchema,
    submitLabel: "Submit review",
    columns: 2,
  },
  {
    id: "modal",
    label: "Modal",
    title: "Form in a modal",
    description: "The same DynamicForm API works inside an overlay or dialog-style shell.",
    schema: modalSchema,
    submitLabel: "Send request",
  },
  {
    id: "quiz",
    label: "Quiz",
    title: "Conditional quiz",
    description: "A branching flow that reveals different questions based on prior answers.",
    schema: quizSchema,
    submitLabel: "Generate plan",
  },
  {
    id: "programmatic",
    label: "formRef",
    title: "Programmatic control",
    description: "Set values, validate, read values, and reset the form from controls outside DynamicForm.",
    schema: programmaticSchema,
    submitLabel: "Submit invite",
  },
];

const THEME_CODE = `const TOGGLE_INPUT =
  "h-4 w-4 shrink-0 cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25";

const theme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5",
  inputClass:
    "w-full bg-white dark:bg-zinc-900/70 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all",
  radioInputClass: TOGGLE_INPUT,
  checkboxInputClass: TOGGLE_INPUT,
  inputErrorClass: "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/30",
  errorClass: "mt-1.5 text-xs text-red-500 dark:text-red-400",
  helpTextClass: "mt-1 text-xs text-gray-500 dark:text-zinc-500",
  requiredMarkClass: "text-red-500 dark:text-red-400 ml-0.5",
  radioGroupClass: "flex flex-col gap-2 mt-1",
  optionWrapperClass: "flex items-center gap-2.5 text-sm text-gray-700 dark:text-zinc-300",
  checkboxGroupClass: "mt-1",
  submitButtonClass:
    "w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer",
};`;

const CUSTOM_RENDERER_CODE = `function PasswordField({ name, field, error, register }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className={theme.labelClass}>
        {field.label}
        {field.required ? <span className={theme.requiredMarkClass}>*</span> : null}
      </label>
      <input
        id={name}
        type="password"
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        className={[theme.inputClass, error ? theme.inputErrorClass : ""].join(" ")}
        {...register(name, {
          required: field.required,
          minLength: field.validation?.minLength,
          validate: field.validation?.validate,
        })}
      />
      {error ? <p className={theme.errorClass}>{error.message}</p> : null}
    </div>
  );
}

const passwordField = (field) => ({
  ...field,
  type: "text",
  overrideComponent: PasswordField,
});`;

const schemaCodeByExample: Record<ExampleId, SchemaCode> = {
  signup: {
    schema: `const signupSchema: FormFieldSchema[] = [
  { name: "fullName", label: "Full name", type: "text", required: true },
  { name: "workEmail", label: "Work email", type: "email", required: true },
  { name: "password", label: "Password", type: "text", overrideComponent: PasswordField },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "text",
    overrideComponent: PasswordField,
    validation: {
      validate: (value, values) => value === values.password || "Passwords must match",
    },
  },
  { name: "role", label: "Role", type: "select", options: roleOptions },
  { name: "terms", label: "I agree to the terms", type: "checkbox", required: true },
];`,
    usage: `<DynamicForm
  schema={signupSchema}
  columns={2}
  theme={theme}
  submitLabel="Create account"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
    custom: CUSTOM_RENDERER_CODE,
  },
  login: {
    schema: `const loginSchema: FormFieldSchema[] = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Password", type: "text", overrideComponent: PasswordField },
  { name: "remember", label: "Keep me signed in", type: "checkbox" },
];`,
    usage: `<DynamicForm
  schema={loginSchema}
  theme={theme}
  submitLabel="Sign in"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
    custom: CUSTOM_RENDERER_CODE,
  },
  profile: {
    schema: `const profileSchema: FormFieldSchema[] = [
  { name: "displayName", label: "Display name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "teamSize", label: "Team size", type: "select", options: teamSizeOptions },
  { name: "timezone", label: "Timezone", type: "select", options: timezoneOptions },
  { name: "bio", label: "Bio", type: "textarea", rows: 3, maxLength: 180, showWordCount: true },
  { name: "newsletter", label: "Send me product updates", type: "checkbox" },
];`,
    usage: `<DynamicForm
  schema={profileSchema}
  columns={2}
  theme={theme}
  defaultValues={{
    displayName: "Avery Johnson",
    email: "avery@company.com",
    teamSize: "6-20",
    newsletter: true,
  }}
  showReset
  submitLabel="Save profile"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
  },
  validation: {
    schema: `const validationSchema: FormFieldSchema[] = [
  {
    name: "email",
    label: "Billing email",
    type: "email",
    required: true,
    validation: {
      pattern: { value: /^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$/, message: "Use a valid billing email" },
    },
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    inputMode: "tel",
    required: true,
    validation: {
      pattern: { value: /^\\+?[0-9\\s().-]{7,20}$/, message: "Use a valid phone number" },
    },
  },
  { name: "seats", label: "Seats", type: "number", required: true, min: 1, max: 250 },
  { name: "cardLast4", label: "Card last 4", type: "text", validation: { pattern: /^\\d{4}$/ } },
];`,
    usage: `<DynamicForm
  schema={validationSchema}
  columns={2}
  theme={theme}
  submitLabel="Validate request"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
  },
  review: {
    schema: `const reviewSchema: FormFieldSchema[] = [
  { name: "rating", label: "Rating", type: "rating", required: true },
  { name: "usage", label: "What did you use it for?", type: "select", options },
  { name: "comment", label: "Review", type: "textarea", rows: 4, required: true },
  { name: "canContact", label: "You can contact me", type: "checkbox" },
  {
    name: "contactEmail",
    label: "Contact email",
    type: "email",
    visibleWhen: { conditions: [{ field: "canContact", operator: "equals", value: true }] },
    requiredWhen: { conditions: [{ field: "canContact", operator: "equals", value: true }] },
  },
];`,
    usage: `<DynamicForm
  schema={reviewSchema}
  columns={2}
  theme={theme}
  submitLabel="Submit review"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
  },
  modal: {
    schema: `const modalSchema: FormFieldSchema[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "topic", label: "Topic", type: "select", required: true, options },
  { name: "message", label: "Message", type: "textarea", rows: 4, required: true },
];`,
    usage: `{isOpen && (
  <Modal>
    <DynamicForm
      schema={modalSchema}
      theme={theme}
      submitLabel="Send request"
      onSubmit={handleSubmit}
    />
  </Modal>
)}`,
    theme: THEME_CODE,
  },
  quiz: {
    schema: `const quizSchema: FormFieldSchema[] = [
  { name: "goal", label: "What are you building?", type: "radio", required: true, options },
  {
    name: "authFields",
    label: "Which auth fields do you need?",
    type: "checkbox",
    options: authFieldOptions,
    visibleWhen: { conditions: [{ field: "goal", operator: "equals", value: "signup" }] },
  },
  {
    name: "conditionNote",
    label: "Condition note",
    type: "textarea",
    visibleWhen: {
      conditions: [{ field: "needsConditionalLogic", operator: "equals", value: true }],
    },
  },
];`,
    usage: `<DynamicForm
  schema={quizSchema}
  theme={theme}
  submitLabel="Generate plan"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
  },
  programmatic: {
    schema: `const programmaticSchema: FormFieldSchema[] = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "plan", label: "Plan", type: "select", required: true, options: planOptions },
  { name: "seats", label: "Seats", type: "number", min: 1, max: 500, defaultValue: 5 },
  { name: "sendInvite", label: "Send invite email", type: "checkbox" },
];`,
    usage: `const formRef = useRef<DynamicFormHandle>(null);

formRef.current?.form.setValue("plan", "enterprise");
const valid = await formRef.current?.form.trigger();
const values = formRef.current?.form.getValues();
formRef.current?.form.reset();

<DynamicForm
  schema={programmaticSchema}
  formRef={formRef}
  theme={theme}
  submitLabel="Submit invite"
  onSubmit={handleSubmit}
/>`,
    theme: THEME_CODE,
  },
};

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodePanel({ code }: { code: SchemaCode }) {
  const [tab, setTab] = useState<keyof SchemaCode>("schema");
  const tabs = (["schema", "usage", "theme", "custom"] as const).filter((item) => code[item]);
  const activeTab = code[tab] ? tab : "schema";
  const activeCode = code[activeTab] ?? code.schema;

  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex gap-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={[
                "rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                activeTab === item
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                  : "text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-200",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
        <CopyCodeButton text={activeCode} />
      </div>
      <pre className="h-80 max-w-full overflow-auto whitespace-pre p-4 font-mono text-xs leading-relaxed">
        <CodeHighlight code={activeCode} />
      </pre>
    </div>
  );
}

function CodeHighlight({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, lineIndex) => (
        <span key={`${lineIndex}-${line}`} className="block">
          <span className="mr-4 inline-block w-6 select-none text-right text-gray-400 dark:text-zinc-700">
            {lineIndex + 1}
          </span>
          <HighlightedLine line={line} />
        </span>
      ))}
    </>
  );
}

function HighlightedLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("//")) {
    return <span className="text-gray-500 italic dark:text-zinc-600">{line}</span>;
  }

  return (
    <>
      {tokenizeCodeLine(line).map((token, index) => (
        <span key={`${index}-${token.text}`} className={token.className}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function tokenizeCodeLine(line: string): { text: string; className: string }[] {
  const tokens: { text: string; className: string }[] = [];
  const keywords = new Set([
    "await",
    "const",
    "false",
    "function",
    "import",
    "return",
    "true",
    "type",
  ]);
  const types = new Set(["DynamicForm", "DynamicFormHandle", "FormFieldSchema", "FormTheme", "PasswordField"]);
  let index = 0;

  while (index < line.length) {
    const char = line[index];

    if (char === '"' || char === "'" || char === "`") {
      const quote = char;
      let end = index + 1;
      while (end < line.length && line[end] !== quote) end += 1;
      tokens.push({
        text: line.slice(index, Math.min(end + 1, line.length)),
        className: "text-amber-600 dark:text-amber-300",
      });
      index = end + 1;
      continue;
    }

    if (/[a-zA-Z_$]/.test(char)) {
      let end = index + 1;
      while (end < line.length && /[\w$]/.test(line[end])) end += 1;
      const word = line.slice(index, end);
      tokens.push({
        text: word,
        className: keywords.has(word)
          ? "text-violet-600 dark:text-violet-400"
          : types.has(word)
          ? "text-blue-600 dark:text-blue-300"
          : "text-gray-900 dark:text-zinc-200",
      });
      index = end;
      continue;
    }

    if (/\d/.test(char)) {
      let end = index + 1;
      while (end < line.length && /\d/.test(line[end])) end += 1;
      tokens.push({
        text: line.slice(index, end),
        className: "text-cyan-600 dark:text-cyan-300",
      });
      index = end;
      continue;
    }

    tokens.push({
      text: char,
      className: "text-gray-600 dark:text-zinc-400",
    });
    index += 1;
  }

  return tokens;
}

function OutputPanel({ data }: { data: object | null }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-500">
          Submit output
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
      <pre className="max-h-64 overflow-auto text-xs leading-relaxed text-gray-700 dark:text-zinc-300">
        {data ? JSON.stringify(data, null, 2) : "// Submit any example to inspect the payload"}
      </pre>
    </div>
  );
}

function ModalExample({
  example,
  onSubmit,
}: {
  example: Example;
  onSubmit: (data: object) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: object) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/40 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Contact request</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Opens a live form inside a centered modal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Open modal form
        </button>
      </div>

      {open ? (
        <dialog
          open
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-8"
          aria-modal="true"
          aria-labelledby="modal-example-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 id="modal-example-title" className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                  Support request
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                  This modal contains a regular DynamicForm instance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
            <DynamicForm
              schema={example.schema}
              onSubmit={handleSubmit}
              theme={baseTheme}
              submitLabel={example.submitLabel}
            />
          </div>
        </dialog>
      ) : null}
    </div>
  );
}

function ProgrammaticExample({
  example,
  onSubmit,
}: {
  example: Example;
  onSubmit: (data: object) => void;
}) {
  const formRef = useRef<DynamicFormHandle>(null);
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const fillEnterprise = () => {
    formRef.current?.form.setValue("email", "ops@enterprise.io", { shouldDirty: true });
    formRef.current?.form.setValue("plan", "enterprise", { shouldDirty: true });
    formRef.current?.form.setValue("seats", 75, { shouldDirty: true });
    formRef.current?.form.setValue("sendInvite", true, { shouldDirty: true });
    setSnapshot(formRef.current?.form.getValues() ?? null);
  };

  const validateForm = async () => {
    const valid = Boolean(await formRef.current?.form.trigger());
    setIsValid(valid);
    setSnapshot(formRef.current?.form.getValues() ?? null);
  };

  const resetForm = () => {
    formRef.current?.form.reset();
    setIsValid(null);
    setSnapshot(null);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={fillEnterprise}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
        >
          Fill enterprise
        </button>
        <button
          type="button"
          onClick={validateForm}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
        >
          Validate
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
        >
          Reset via ref
        </button>
        {isValid !== null ? (
          <span className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
            {isValid ? "Valid" : "Needs changes"}
          </span>
        ) : null}
      </div>

      <DynamicForm
        schema={example.schema}
        onSubmit={onSubmit}
        theme={baseTheme}
        formRef={formRef}
        submitLabel={example.submitLabel}
      />

      {snapshot ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

export default function Examples() {
  const [activeId, setActiveId] = useState<ExampleId>("signup");
  const [resultByExample, setResultByExample] = useState<Partial<Record<ExampleId, object>>>({});
  const { theme } = useTheme();

  const activeExample = useMemo(
    () => examples.find((example) => example.id === activeId) ?? examples[0],
    [activeId]
  );
  const activeResult = resultByExample[activeId] ?? null;
  const activeCode = schemaCodeByExample[activeId];

  const handleSubmit = (id: ExampleId) => (data: object) => {
    setResultByExample((current) => ({ ...current, [id]: data }));
  };

  return (
    <section id="examples" className="min-h-screen bg-white px-4 py-24 dark:bg-[#09090b]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Real examples
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 sm:text-4xl">
              Production-shaped forms
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-zinc-400">
              Try common flows that use validation, custom renderers, conditional fields, ratings, and modal placement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setActiveId(example.id)}
                className={[
                  "rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                  activeId === example.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/15 dark:text-blue-300"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100",
                ].join(" ")}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="mb-6 border-b border-gray-200 pb-5 dark:border-zinc-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                    {activeExample.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-zinc-400">
                    {activeExample.description}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-md border border-gray-200 px-3 py-1 text-xs font-mono text-gray-500 dark:border-zinc-800 dark:text-zinc-500">
                  {activeExample.schema.length} fields
                </span>
              </div>
            </div>

            {activeExample.id === "modal" ? (
              <ModalExample example={activeExample} onSubmit={handleSubmit(activeExample.id)} />
            ) : activeExample.id === "programmatic" ? (
              <ProgrammaticExample example={activeExample} onSubmit={handleSubmit(activeExample.id)} />
            ) : (
              <DynamicForm
                schema={activeExample.schema}
                onSubmit={handleSubmit(activeExample.id)}
                theme={baseTheme}
                defaultValues={activeExample.defaultValues}
                columns={activeExample.columns}
                submitLabel={activeExample.submitLabel}
                showReset={activeExample.showReset}
              />
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <CodePanel code={activeCode} />
            <OutputPanel data={activeResult} />
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                Active theme
              </span>
              <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                {theme === "dark" ? "Dark" : "Light"} mode, using the same schema and the same package import.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                Tested behavior
              </span>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-zinc-300">
                <li>Required validation and pattern validation</li>
                <li>Custom password renderer through overrideComponent</li>
                <li>Conditional reveal through visibleWhen and requiredWhen</li>
                <li>Reusable form rendering inside a modal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
