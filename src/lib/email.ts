import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function sendVerificationEmail(email: string, code: string) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[DEV] Verification code for ${email}: ${code}`);
      return { success: true, isDev: true };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: email,
      subject: 'Verify your StonesLand account',
      html: `
        <h2>Welcome to StonesLand!</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #facc15;">${code}</h1>
        <p>This code will expire in 24 hours.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
