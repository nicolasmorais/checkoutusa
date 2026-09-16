import { prisma } from "@/lib/prisma";
import { getResendClient, getResendFromEmail } from "@/lib/resend";
import { renderEmailTemplate, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY } from "@/lib/email-templates";

export async function sendOrderConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("Order not found");

  const template = await prisma.emailTemplate.findUnique({ where: { id: "singleton" } });
  const { subject, html } = renderEmailTemplate(
    template?.subject ?? DEFAULT_EMAIL_SUBJECT,
    template?.bodyHtml ?? DEFAULT_EMAIL_BODY,
    order
  );

  try {
    const resend = getResendClient(template?.resendApiKey);
    const { data, error: sendError } = await resend.emails.send({
      from: getResendFromEmail(template?.resendFromEmail),
      to: order.customerEmail,
      subject,
      html,
    });

    if (sendError) {
      console.error("Resend rejected the order confirmation email", sendError);
      await prisma.orderEmailLog.create({
        data: {
          orderId,
          type: "confirmation",
          toEmail: order.customerEmail,
          status: "failed",
          errorMessage: sendError.message ?? String(sendError),
        },
      });
      return { ok: false, error: sendError.message ?? String(sendError) };
    }

    await prisma.orderEmailLog.create({
      data: {
        orderId,
        type: "confirmation",
        toEmail: order.customerEmail,
        status: "sent",
        resendId: data?.id ?? null,
      },
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to send order confirmation email", err);
    await prisma.orderEmailLog.create({
      data: {
        orderId,
        type: "confirmation",
        toEmail: order.customerEmail,
        status: "failed",
        errorMessage: message,
      },
    });
    return { ok: false, error: message };
  }
}
