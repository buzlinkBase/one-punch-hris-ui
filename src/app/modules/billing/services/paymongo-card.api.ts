import axios from "axios";
import type { CardDetails } from "../models/api/request/auto-renew-request.model";

const PAYMONGO_PAYMENT_METHODS = "https://api.paymongo.com/v1/payment_methods";

interface PayMongoError {
  errors?: { detail?: string; code?: string }[];
}

/**
 * Hands card details straight to PayMongo with the publishable key and returns its token (pm_...).
 * The card never reaches our servers -- only the token does. Errors carry PayMongo's own message
 * ("Your card number is invalid.").
 */
export async function tokenizeCard(
  publicKey: string,
  card: CardDetails,
): Promise<string> {
  try {
    const response = await axios.post<{ data: { id: string } }>(
      PAYMONGO_PAYMENT_METHODS,
      {
        data: {
          attributes: {
            type: "card",
            details: {
              card_number: card.cardNumber.replace(/\s+/g, ""),
              exp_month: card.expMonth,
              exp_year: card.expYear,
              cvc: card.cvc,
            },
            billing: { name: card.name, email: card.email },
          },
        },
      },
      {
        auth: { username: publicKey, password: "" },
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data.data.id;
  } catch (error) {
    const detail = axios.isAxiosError<PayMongoError>(error)
      ? error.response?.data?.errors?.[0]?.detail
      : undefined;
    throw new Error(detail ?? "Your card couldn't be checked. Try again.", {
      cause: error,
    });
  }
}
