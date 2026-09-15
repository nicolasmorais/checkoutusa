import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set — order confirmation emails will fail to send.");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_missing");

export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
