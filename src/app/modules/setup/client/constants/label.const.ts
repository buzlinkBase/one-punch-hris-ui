export const CLIENT_LABEL = {
  TITLE: "Client",
  CODE: "Code",
  NAME: "Name",
  STATUS: "Status",
  EMAIL: "Email",
  PHONE: "Phone",
  ADDRESS: "Address",
  LOGO: "Company Logo",
  CONTACT_PERSON: "Contact Person",
  AREAS: "Project Sites",
  AREAS_PLACEHOLDER: "Optional - tag the sites this client is served at",
  AREAS_HELP:
    "A site can belong to one client. Leave empty if you don't split clients by site.",
  CREATE_TITLE: "Create Client",
  EDIT_TITLE: "Edit Client",
  TAB_GENERAL: "General Information",
  TAB_BILLING: "Billing Information",
};

export const CLIENT_BILLING_LABEL = {
  TIN: "TIN",
  BILLING_ADDRESS: "Billing Address",
  BILLING_CONTACT_NAME: "Billing Contact Name",
  BILLING_EMAIL: "Billing Email",
  BILLING_PHONE: "Billing Phone",
  PAYMENT_TERMS_DAYS: "Payment Terms (days)",
  BILLING_CYCLE: "Billing Cycle",
  CURRENCY: "Currency",
  NOTES: "Notes",
};

export const BILLING_CYCLE_OPTIONS = [
  { value: "Monthly", label: "Monthly" },
  { value: "SemiMonthly", label: "Semi-Monthly" },
  { value: "PerCutoff", label: "Per Cutoff" },
];
