import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface OrderConfirmationData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
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
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-number { font-size: 24px; font-weight: bold; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .summary-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .summary-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #667eea; padding-top: 10px; }
        .address { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hello ${data.customerName},</p>
          <p>Thank you for your order! Your purchase has been confirmed and is being prepared.</p>

          <div class="order-number">Order #${data.orderNumber}</div>

          <table>
            <thead>
              <tr style="background: #667eea; color: white;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>$${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (8%):</span>
              <span>$${data.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>${data.shipping === 0 ? 'FREE' : `$${data.shipping.toFixed(2)}`}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>$${data.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="address">
            <h3>📍 Shipping Address</h3>
            <p>
              ${data.address}<br>
              ${data.city}, ${data.postalCode}<br>
              ${data.country}
            </p>
          </div>

          <p>You will receive a shipping confirmation email with tracking information within 24 hours.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="button">Track Your Order</a>

          <div class="footer">
            <p>StonesLand © 2026. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendShippingNotification(
  customerEmail: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .tracking { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #667eea; }
        .tracking-label { color: #999; font-size: 12px; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order is on the Way!</h1>
        </div>
        <div class="content">
          <p>Your order has been shipped and is on its way to you.</p>

          <div class="tracking">
            <div class="tracking-label">TRACKING NUMBER</div>
            <div class="tracking-number">${trackingNumber}</div>
            <p><strong>Carrier:</strong> ${carrier}</p>
          </div>

          <p>You can track your package in real-time using the tracking number above.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/tracking/${trackingNumber}" class="button">Track Package</a>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            StonesLand © 2026. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@stonesland.com',
      to: customerEmail,
      subject: `Your Order ${orderNumber} Has Shipped - Tracking: ${trackingNumber}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send shipping email:', error);
    return false;
  }
}
