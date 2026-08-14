import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"TaskFlow Engine" <no-reply@taskflow.app>',
      to,
      subject,
      html,
    });
    console.log(`[Email Sent] Message ID: ${info.messageId} -> ${to}`);
    return info;
  } catch (error) {
    console.error(`[Email Failed] Error sending to ${to}:`, error.message);
  }
};