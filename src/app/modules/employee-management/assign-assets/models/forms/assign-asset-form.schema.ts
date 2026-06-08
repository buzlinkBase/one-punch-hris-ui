import { z } from "zod";

export const assignAssetFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  assetType: z.string().min(1, "Asset type is required"),
  assetDescription: z.string().min(1, "Asset description is required"),
  model: z.string().min(1, "Model is required"),
  brand: z.string().min(1, "Brand is required"),
  serialNo: z.string().min(1, "Serial number is required"),
  qty: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  issuanceDate: z.string().min(1, "Issuance date is required"),
  returnedDate: z.string().nullable().optional(),
  remarks: z.string().optional().default(""),
  file: z.string().optional().default(""),
});

export type AssignAssetFormValues = z.infer<typeof assignAssetFormSchema>;
