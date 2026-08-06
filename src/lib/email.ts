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

/**
 * Whether outbound mail can actually be delivered.
 *
 * `.env.example` ships with placeholder credentials, and copying it to `.env`
 * without editing leaves SMTP_USER set to a non-address. A bare
 * `!process.env.SMTP_USER` check reads that as configured and every send then
 * fails authentication at the provider -- silently, for anything dispatched
 * fire-and-forget. Treat the placeholders as unconfigured.
 */
const SMTP_PLACEHOLDERS = ['your-email@gmail.com', 'your-app-specific-password'];

export function isEmailConfigured(): boolean {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return false;
  if (SMTP_PLACEHOLDERS.includes(user) || SMTP_PLACEHOLDERS.includes(pass)) return false;
  if (!user.includes('@')) return false;

  return true;
}

export async function sendVerificationEmail(email: string, code: string) {
  try {
    if (!isEmailConfigured()) {
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

interface CustomOrderAlertData {
  customOrderNumber: string;
  customerName: string;
  customerEmail: string;
  description: string;
  budget?: number | null;
  deadline?: string | null;
}

/**
 * Notifies the shop that a customer has requested a piece.
 *
 * Sends to ADMIN_EMAIL, falling back to the configured sender address so a
 * missing variable degrades to "mail yourself" rather than silently dropping
 * the alert.
 */
export async function sendCustomOrderAlert(data: CustomOrderAlertData) {
  const adminEmail =
    process.env.ADMIN_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    if (!isEmailConfigured() || !adminEmail) {
      console.log(`[DEV] Custom order request ${data.customOrderNumber} from ${data.customerEmail}`);
      return { success: true, isDev: true };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: adminEmail,
      replyTo: data.customerEmail,
      subject: `New product request: ${data.customOrderNumber}`,
      html: `
        <h2>New product request</h2>
        <p><strong>Reference:</strong> ${data.customOrderNumber}</p>
        <p><strong>From:</strong> ${data.customerName} (${data.customerEmail})</p>
        ${data.budget ? `<p><strong>Budget:</strong> $${data.budget}</p>` : ''}
        ${data.deadline ? `<p><strong>Needed by:</strong> ${data.deadline}</p>` : ''}
        <p><strong>What they are looking for:</strong></p>
        <div style="border-left: 3px solid #facc15; padding: 8px 16px; margin: 16px 0;">
          ${data.description.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 13px;">
          Open the Custom Orders tab in your admin panel to quote this request.
        </p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Custom order alert email failed:', error);
    return { success: false, error };
  }
}

interface ContactReplyData {
  to: string;
  customerName: string;
  subject: string;
  originalMessage: string;
  reply: string;
}

/**
 * Delivers an admin's reply to a contact-form message.
 *
 * Replies are also persisted as ContactReply rows, but the customer has no
 * account area in which to read them -- email is the only channel that
 * actually reaches them.
 */
export async function sendContactReply(data: ContactReplyData) {
  try {
    if (!isEmailConfigured()) {
      console.log(`[DEV] Contact reply to ${data.to}:`, data.reply);
      return { success: true, isDev: true };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: data.to,
      subject: `Re: ${data.subject}`,
      html: `
        <p>Hi ${data.customerName},</p>
        <p>Thank you for contacting StonesLand. Here is our reply:</p>
        <div style="border-left: 3px solid #facc15; padding: 8px 16px; margin: 16px 0;">
          ${data.reply.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 13px;">Your original message:</p>
        <div style="border-left: 3px solid #ccc; padding: 8px 16px; color: #666; font-size: 13px;">
          ${data.originalMessage.replace(/\n/g, '<br>')}
        </div>
        <p style="margin-top: 24px;">— The StonesLand Team</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Contact reply email failed:', error);
    return { success: false, error };
  }
}

interface OrderConfirmationData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  try {
    if (!isEmailConfigured()) {
      console.log(`[DEV] Order confirmation for ${data.customerEmail}:`, data.orderNumber);
      return { success: true, isDev: true };
    }

    const itemsHtml = data.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
          </tr>`
      )
      .join('');

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <h2>Thank you for your order, ${data.customerName}!</h2>
        <p>Your order has been confirmed. Here are the details:</p>

        <h3>Order Number: ${data.orderNumber}</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #facc15; color: #000;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Quantity</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin: 20px 0;">
          <p><strong>Subtotal:</strong> $${data.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${data.tax.toFixed(2)}</p>
          <p><strong>Shipping:</strong> $${data.shipping.toFixed(2)}</p>
          <h3 style="color: #facc15;">Total: $${data.total.toFixed(2)}</h3>
        </div>

        <h3>Shipping Address</h3>
        <p>
          ${data.address}<br>
          ${data.city}, ${data.postalCode}<br>
          ${data.country}
        </p>

        <p>You will receive a tracking number once your order ships.</p>
        <p>Thank you for shopping at StonesLand!</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, resetCode: string) {
  try {
    if (!isEmailConfigured()) {
      console.log(`[DEV] Password reset code for ${email}: ${resetCode}`);
      return { success: true, isDev: true };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: email,
      subject: 'Reset your StonesLand password',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use this code:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #facc15;">${resetCode}</h1>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Password reset email failed:', error);
    return { success: false, error };
  }
}
