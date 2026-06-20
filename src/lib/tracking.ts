import { prisma } from './db';

export function generateTrackingNumber(): string {
  // Format: TRK-YYYYMMDD-XXXX (e.g., TRK-20260614-A1B2)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate random 4-character alphanumeric suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `TRK-${dateStr}-${suffix}`;
}

export async function generateUniqueTrackingNumber(): Promise<string> {
  let trackingNumber = generateTrackingNumber();
  let exists = await prisma.delivery.findUnique({
    where: { trackingNumber },
  });

  // Keep generating until we find a unique one
  while (exists) {
    trackingNumber = generateTrackingNumber();
    exists = await prisma.delivery.findUnique({
      where: { trackingNumber },
    });
  }

  return trackingNumber;
}

export function isValidTrackingNumber(trackingNumber: string): boolean {
  const pattern = /^TRK-\d{8}-[A-Z0-9]{4}$/;
  return pattern.test(trackingNumber);
}
