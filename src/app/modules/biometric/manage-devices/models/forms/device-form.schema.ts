import { z } from "zod";

export const deviceFormSchema = z.object({
  sn: z.string().min(1, "Serial number is required"),
  description: z.string().default(""),
  branchId: z.string().nullish(),
  clientId: z.string().nullish(),
  areaId: z.string().nullish(),
  status: z.string().min(1, "Status is required"),
});

export type DeviceFormValues = z.infer<typeof deviceFormSchema>;
