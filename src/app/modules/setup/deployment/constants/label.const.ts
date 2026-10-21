export const DEPLOYMENT_PERMISSION = {
  EDIT: "Workforce Setup:Edit",
} as const;

export const DEPLOYMENT_LABEL = {
  TITLE: "Deployment",
  SUBTITLE:
    "Where each client is served (sites and posts), how many people each post needs per shift, and who is deployed where. A person's current regular deployment also sets their client and project site.",
  CHOOSE_CLIENT: "Choose a client",
  TAB_SITES: "Sites & posts",
  TAB_PERSONNEL: "Deployed personnel",
  TAB_MANNING: "Manning",
  SEND_TO_PORTAL: "Send manning to client portal",
  SEND_TO_PORTAL_HINT:
    "The coming week's shifts and deployments are sent every night. Send now after changing them, so the client's live dashboard shows the change today.",
  SENT_TO_PORTAL: "Manning sent to the client portal.",
};

export const ROLE_OPTIONS = [
  { value: "Regular", label: "Regular" },
  { value: "Reliever", label: "Reliever" },
  { value: "Augmentation", label: "Augmentation" },
];

export const ROLE_TAG: Record<string, string> = {
  Regular: "blue",
  Reliever: "gold",
  Augmentation: "purple",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEKDAY_OPTIONS = WEEKDAYS.map((d) => ({ value: d, label: d }));

export const DATE_FORMAT = "YYYY-MM-DD";
