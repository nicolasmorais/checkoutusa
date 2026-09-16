import { Resend } from "resend";

export const DEFAULT_RESEND_FROM_EMAIL = "onboarding@resend.dev";

export function getResendClient(apiKeyOverride?: string | null) {
  const apiKey = apiKeyOverride || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — order confirmation emails will fail to send.");
  }
  return new Resend(apiKey || "re_missing");
}

export function getResendFromEmail(fromOverride?: string | null) {
  return fromOverride || process.env.RESEND_FROM_EMAIL || DEFAULT_RESEND_FROM_EMAIL;
}
