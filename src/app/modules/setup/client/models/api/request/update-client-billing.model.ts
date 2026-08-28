export interface UpdateClientBilling {
  tin: string;
  billingAddress: string;
  billingContactName: string;
  billingEmail: string;
  billingPhone: string;
  paymentTermsDays: number;
  billingCycle: string;
  currency: string;
  notes: string | null;
}
