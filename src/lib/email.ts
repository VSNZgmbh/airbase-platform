import { Resend } from "resend";
import { createElement } from "react";
import { render } from "@react-email/render";

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

const FROM = process.env.EMAIL_FROM ?? "VOLTAIR <noreply@voltair.one>";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const client = getResend();
  const html = await render(createElement(payload.template, payload.props));

  if (!client) {
    console.log(
      `[Email] Resend not configured — would send "${payload.subject}" to ${payload.to}`
    );
    console.log("[Email] HTML preview (first 200 chars):", html.slice(0, 200));
    return;
  }

  await client.emails.send({
    from: FROM,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html,
  });
}
