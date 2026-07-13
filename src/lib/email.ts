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
    if (!process.env.SMTP_USER) {
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
    if (!process.env.SMTP_USER) {
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
