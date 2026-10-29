/** How a branch / project site lets employees punch from the mobile app. Mirrors the API's MobilePunchMode. */
export type MobilePunchMode =
  "OPEN" | "GEOFENCE" | "QR" | "NFC" | "GEOFENCE_QR" | "GEOFENCE_NFC";

/** The select value a project site uses for "follow the branch" (sent to the API as null). */
export const FOLLOW_BRANCH_PUNCH_MODE = "FOLLOW_BRANCH";

export const MOBILE_PUNCH_MODE_OPTIONS: {
  value: MobilePunchMode;
  label: string;
}[] = [
  { value: "OPEN", label: "Open (tap Punch anytime)" },
  { value: "GEOFENCE", label: "Geofence (must be inside the boundary)" },
  { value: "QR", label: "QR code (scan the location's QR)" },
  { value: "NFC", label: "NFC (tap the location's tag)" },
  { value: "GEOFENCE_QR", label: "Geofence + QR code" },
  { value: "GEOFENCE_NFC", label: "Geofence + NFC" },
];

export const MOBILE_PUNCH_MODE_HELP =
  "Open lets employees tap Punch anytime, like My Portal. Geofence needs them to be inside the boundary drawn on the map. QR and NFC need them to scan the location's code or tag. The combined modes need both.";

/** True when the mode checks the employee's position, so the location needs a boundary drawn. */
export function punchModeNeedsBoundary(
  mode: string | null | undefined,
): boolean {
  return (
    mode === "GEOFENCE" || mode === "GEOFENCE_QR" || mode === "GEOFENCE_NFC"
  );
}
