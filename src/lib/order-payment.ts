import { prisma } from '@/lib/db';
import { sendOrderConfirmation } from '@/lib/email';

interface CompleteOrderPaymentInput {
  orderId: string;
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
  paymentRecordType: 'credit_card' | 'paypal' | 'bank_transfer';
  transactionId: string;
  stripePaymentId?: string;
}

export async function completeOrderPayment(input: CompleteOrderPaymentInput): Promise<boolean> {
  const result = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.order.findUnique({
      where: { id: input.orderId },
      include: { items: true },
    });

    if (!existing) throw new Error(`Order ${input.orderId} was not found.`);
    if (existing.paymentStatus === 'succeeded') {
      return { order: existing, completed: false, stockIssues: [] };
    }
    const methodMatches =
      existing.paymentMethod === input.paymentMethod ||
      (input.paymentMethod === 'stripe' && existing.paymentMethod === null);
    if (existing.paymentStatus !== 'pending' || !methodMatches) {
      throw new Error(`Order ${input.orderId} is not awaiting this payment method.`);
    }

    const claimed = await transaction.order.updateMany({
      where: {
        id: input.orderId,
        paymentStatus: 'pending',
        OR: [
          { paymentMethod: input.paymentMethod },
          ...(input.paymentMethod === 'stripe' ? [{ paymentMethod: null }] : []),
        ],
      },
      data: {
        paymentStatus: 'succeeded',
        status: 'confirmed',
        paymentMethod: input.paymentMethod,
        ...(input.stripePaymentId && { stripePaymentId: input.stripePaymentId }),
      },
    });

    if (claimed.count !== 1) {
      const current = await transaction.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });
      if (current?.paymentStatus === 'succeeded') {
        return { order: current, completed: false, stockIssues: [] };
      }
      throw new Error(`Order ${input.orderId} payment was already changed.`);
    }

    const pendingRecord = await transaction.paymentRecord.findFirst({
      where: {
        orderId: input.orderId,
        type: input.paymentRecordType,
        status: 'pending',
      },
    });

    if (pendingRecord) {
      await transaction.paymentRecord.update({
        where: { id: pendingRecord.id },
        data: {
          status: 'completed',
          transactionId: input.transactionId,
          processedAt: new Date(),
        },
      });
    } else {
      await transaction.paymentRecord.create({
        data: {
          orderId: input.orderId,
          type: input.paymentRecordType,
          amount: existing.totalAmount,
          currency: 'USD',
          status: 'completed',
          transactionId: input.transactionId,
          processedAt: new Date(),
        },
      });
    }

    if (existing.discountCode) {
      await transaction.discount.updateMany({
        where: { code: existing.discountCode },
        data: { timesUsed: { increment: 1 } },
      });
    }

    const stockIssues: string[] = [];
    for (const item of existing.items) {
      const decrement = await transaction.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (decrement.count !== 1) stockIssues.push(item.productId);
    }

    return { order: existing, completed: true, stockIssues };
  });

  if (!result.completed) return true;

  for (const productId of result.stockIssues) {
    console.error('[payments] Paid order could not be deducted from stock:', input.orderId, productId);
  }

  try {
    await sendOrderConfirmation({
      orderNumber: result.order.orderNumber,
      customerEmail: result.order.customerEmail,
      customerName: result.order.customerName,
      items: result.order.items.map((item) => ({
        name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: result.order.subtotal,
      tax: result.order.tax,
      shipping: result.order.shipping,
      total: result.order.totalAmount,
      address: result.order.address,
      city: result.order.city,
      postalCode: result.order.postalCode,
      country: result.order.country,
    });
  } catch (error) {
    console.error('[payments] Order confirmation email failed for', input.orderId, error);
  }

  return true;
}
