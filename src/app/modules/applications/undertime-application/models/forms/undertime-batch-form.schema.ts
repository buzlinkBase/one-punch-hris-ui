import { z } from "zod";

const batchUndertimeEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Required" }),
  utMinutes: z.number({ error: "Required" }).min(0),
  remarks: z.string().min(1, { message: "Reason is required" }),
});

export const batchUndertimeFormSchema = z.object({
  payrollDate: z.string().min(1, { message: "Date is required" }),
  entries: z
    .array(batchUndertimeEntrySchema)
    .min(1, { message: "Add at least one entry" }),
});

export type BatchUndertimeFormValues = z.infer<typeof batchUndertimeFormSchema>;
