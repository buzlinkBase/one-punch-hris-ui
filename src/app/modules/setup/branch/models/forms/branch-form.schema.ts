import { z } from "zod";
import { punchModeNeedsBoundary } from "@/shared/constants/mobile-punch-mode.const";

const geoJsonPolygon = z
  .object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  })
  .nullable();

export const branchFormSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    address: z.string().nullable(),
    boundary: geoJsonPolygon,
    status: z.string().min(1, "Status is required"),
    regionCode: z.string().nullable().optional(),
    wageOrderClass: z.string().nullable().optional(),
    headEmployeeId: z.string().nullable().optional(),
    punchMode: z.enum([
      "OPEN",
      "GEOFENCE",
      "QR",
      "NFC",
      "GEOFENCE_QR",
      "GEOFENCE_NFC",
    ]),
  })
  .refine((v) => !punchModeNeedsBoundary(v.punchMode) || v.boundary !== null, {
    message: "Draw the branch boundary on the map to use a geofence",
    path: ["boundary"],
  });

export type BranchFormValues = z.infer<typeof branchFormSchema>;
