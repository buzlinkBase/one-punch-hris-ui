import { z } from "zod";
import {
  FOLLOW_BRANCH_PUNCH_MODE,
  punchModeNeedsBoundary,
} from "@/shared/constants/mobile-punch-mode.const";

const geoJsonPolygon = z
  .object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  })
  .nullable();

export const operationAreaFormSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    address: z.string(),
    boundary: geoJsonPolygon,
    status: z.string().min(1, "Status is required"),
    branchId: z.string().min(1, "Branch is required"),
    headEmployeeId: z.string().nullable().optional(),
    // FOLLOW_BRANCH is sent to the API as null: the site uses its branch's mode.
    punchMode: z.enum([
      FOLLOW_BRANCH_PUNCH_MODE,
      "OPEN",
      "GEOFENCE",
      "QR",
      "NFC",
      "GEOFENCE_QR",
      "GEOFENCE_NFC",
    ]),
  })
  .refine((v) => !punchModeNeedsBoundary(v.punchMode) || v.boundary !== null, {
    message: "Draw the project site boundary on the map to use a geofence",
    path: ["boundary"],
  });

export type OperationAreaFormValues = z.infer<typeof operationAreaFormSchema>;
