import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env.js';

const transporter: Transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

function buildBaseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">InternAI</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:13px;">
                &copy; ${new Date().getFullYear()} InternAI. All rights reserved.
              </p>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:600;">Verify Your Email</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Welcome to InternAI! Please verify your email address to activate your account and start exploring internship opportunities.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
          <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;color:#64748b;font-size:13px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;word-break:break-all;">
      <a href="${verificationUrl}" style="color:#6366f1;font-size:13px;text-decoration:underline;">${verificationUrl}</a>
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      This link will expire in 24 hours. If you didn't create an account, please ignore this email.
    </p>`;

  const html = buildBaseTemplate('Verify Your Email', body);

  await transporter.sendMail({
    from: `"InternAI" <${env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email — InternAI',
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:600;">Reset Your Password</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      We received a request to reset the password for your InternAI account. Click the button below to choose a new password.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:8px;background:linear-gradient(135deg,#ef4444,#f97316);">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;color:#64748b;font-size:13px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;word-break:break-all;">
      <a href="${resetUrl}" style="color:#6366f1;font-size:13px;text-decoration:underline;">${resetUrl}</a>
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email — your password will remain unchanged.
    </p>`;

  const html = buildBaseTemplate('Reset Your Password', body);

  await transporter.sendMail({
    from: `"InternAI" <${env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset — InternAI',
    html,
  });
}
