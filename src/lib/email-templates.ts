import { formatCents } from "@/lib/utils";

export type OrderForEmail = {
  number: number;
  customerName: string;
  customerEmail: string;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  items: { name: string; quantity: number; priceCents: number }[];
};

export const EMAIL_VARIABLES = [
  { key: "customerName", description: "Full customer name" },
  { key: "customerFirstName", description: "Customer's first name" },
  { key: "customerEmail", description: "Customer email address" },
  { key: "orderNumber", description: "Order number, e.g. 42" },
  { key: "itemsTable", description: "HTML table rows listing each item" },
  { key: "subtotal", description: "Formatted subtotal, e.g. $49.99" },
  { key: "shipping", description: "Formatted shipping cost, or “Free”" },
  { key: "total", description: "Formatted order total" },
  { key: "shippingAddress", description: "Formatted shipping address (HTML), blank if none" },
  { key: "currency", description: "Currency code, e.g. USD" },
] as const;

export const DEFAULT_EMAIL_SUBJECT = "Order #{{orderNumber}} confirmed";

export const DEFAULT_EMAIL_BODY = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#171717;">
  <h1 style="font-size:20px;margin:0 0 4px;">Thanks for your order, {{customerFirstName}}!</h1>
  <p style="color:#525252;font-size:14px;margin:0 0 24px;">Order #{{orderNumber}} is confirmed and being processed.</p>

  <table style="width:100%;border-collapse:collapse;">
    {{itemsTable}}
  </table>

  <table style="width:100%;margin-top:16px;font-size:14px;">
    <tr>
      <td style="padding:4px 0;color:#525252;">Subtotal</td>
      <td style="padding:4px 0;text-align:right;">{{subtotal}}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:#525252;">Shipping</td>
      <td style="padding:4px 0;text-align:right;">{{shipping}}</td>
    </tr>
    <tr>
      <td style="padding:8px 0 0;font-weight:600;border-top:1px solid #eee;">Total</td>
      <td style="padding:8px 0 0;font-weight:600;text-align:right;border-top:1px solid #eee;">{{total}}</td>
    </tr>
  </table>

  {{shippingAddress}}

  <p style="margin-top:32px;color:#a3a3a3;font-size:12px;">If you have any questions about your order, just reply to this email.</p>
</div>`;

function buildVariableMap(order: OrderForEmail): Record<string, string> {
  const itemsTable = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;color:#171717;font-size:14px;">
            ${item.name} <span style="color:#737373;">× ${item.quantity}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;color:#171717;font-size:14px;text-align:right;">
            ${formatCents(item.priceCents * item.quantity, order.currency)}
          </td>
        </tr>`
    )
    .join("");

  const shippingAddress = order.shippingAddressLine1
    ? `<div style="margin-top:24px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#171717;">Shipping to</p>
        <p style="margin:4px 0 0;color:#525252;font-size:14px;">
          ${order.shippingAddressLine1}${order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}<br/>
          ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}
        </p>
      </div>`
    : "";

  return {
    customerName: order.customerName,
    customerFirstName: order.customerName.split(" ")[0] ?? order.customerName,
    customerEmail: order.customerEmail,
    orderNumber: String(order.number),
    itemsTable,
    subtotal: formatCents(order.subtotalCents, order.currency),
    shipping: order.shippingCents > 0 ? formatCents(order.shippingCents, order.currency) : "Free",
    total: formatCents(order.totalCents, order.currency),
    shippingAddress,
    currency: order.currency.toUpperCase(),
  };
}

function applyVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in variables ? variables[key] : match
  );
}

export function renderEmailTemplate(
  subjectTemplate: string,
  bodyTemplate: string,
  order: OrderForEmail
) {
  const variables = buildVariableMap(order);
  return {
    subject: applyVariables(subjectTemplate, variables),
    html: applyVariables(bodyTemplate, variables),
  };
}

const SAMPLE_ORDER: OrderForEmail = {
  number: 1024,
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  currency: "usd",
  subtotalCents: 4999,
  shippingCents: 599,
  totalCents: 5598,
  shippingAddressLine1: "123 Main St",
  shippingAddressLine2: "Apt 4B",
  shippingCity: "New York",
  shippingState: "NY",
  shippingPostalCode: "10001",
  items: [{ name: "Demo Product", quantity: 1, priceCents: 4999 }],
};

export function renderEmailPreview(subjectTemplate: string, bodyTemplate: string) {
  return renderEmailTemplate(subjectTemplate, bodyTemplate, SAMPLE_ORDER);
}
