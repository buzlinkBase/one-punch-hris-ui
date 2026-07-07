import { z } from "zod";

const geoJsonPolygon = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
}).nullable();

export const branchFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  address: z.string().nullable(),
  boundary: geoJsonPolygon,
  status: z.string().min(1, "Status is required"),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
