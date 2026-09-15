import { prisma } from "@/lib/prisma";
import { DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY } from "@/lib/email-templates";
import { EmailTemplateFormClient } from "./EmailTemplateFormClient";

export default async function EmailTemplatePage() {
  const template = await prisma.emailTemplate.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", subject: DEFAULT_EMAIL_SUBJECT, bodyHtml: DEFAULT_EMAIL_BODY },
  });

  return <EmailTemplateFormClient initial={{ subject: template.subject, bodyHtml: template.bodyHtml }} />;
}
