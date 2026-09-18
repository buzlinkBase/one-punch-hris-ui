import { z } from "zod";

export const portalProfileEditFormSchema = z.object({
  contact: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  civilStatus: z.string().optional(),
  dob: z.string().optional(),
  bloodType: z.string().optional(),
  remarks: z.string().optional(),
});

export type PortalProfileEditFormValues = z.infer<
  typeof portalProfileEditFormSchema
>;
