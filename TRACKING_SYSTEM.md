# 📦 Shipment Tracking System

## Overview

StonesLand now includes a comprehensive shipment tracking system that allows customers to track their orders in real-time and gives admins full control over shipment management.

---

## ✨ Features

### For Customers
- **Public Tracking Page** - Search shipments by tracking number
- **Real-time Status Updates** - Track package location in real-time
- **Timeline Visualization** - View complete shipment history
- **Order Information** - See order details and estimated delivery
- **Mobile-Friendly** - Fully responsive design
- **Email Notifications** - Receive tracking number via email when shipped

### For Administrators
- **Shipment Management** - Mark orders as shipped and generate tracking numbers
- **Status Updates** - Update delivery status and location
- **GPS Coordinates** - Add latitude/longitude for mapping integration
- **Multi-Carrier Support** - FedEx, UPS, DHL, Local Courier
- **Analytics Dashboard** - View all active tracking information
- **Bulk Operations** - Manage multiple shipments efficiently

---

## 🗂️ Database Schema

### Tracking Number Format
```
TRK-YYYYMMDD-XXXX
Example: TRK-20260614-A1B2
```

### Key Models

**Delivery Model**
- `trackingNumber` - Unique tracking identifier
- `status` - pending, picked, in_transit, out_for_delivery, delivered, failed
- `carrier` - Shipping carrier (FedEx, UPS, DHL, etc.)
- `currentLocation` - Current package location
- `latitude/longitude` - GPS coordinates
- `estimatedDelivery` - Estimated delivery date
- `actualDelivery` - Actual delivery date
- `trackingHistory` - Array of TrackingEvent objects

**TrackingEvent Model**
- `status` - Event status
- `location` - Event location
- `latitude/longitude` - GPS coordinates for location
- `timestamp` - When event occurred
- `description` - Event details

**DeliveryNotification Model**
- `type` - email, sms, push
- `recipient` - Email or phone number
- `message` - Notification content
- `sent` - Whether notification was sent
- `sentAt` - When notification was sent

---

## 🔌 API Endpoints

### Public Endpoints

#### Get Tracking Information
```
GET /api/tracking?trackingNumber=TRK-20260614-A1B2
```

**Response:**
```json
{
  "trackingNumber": "TRK-20260614-A1B2",
  "status": "in_transit",
  "carrier": "FedEx",
  "currentLocation": "Memphis, TN",
  "estimatedDelivery": "2026-06-19T00:00:00Z",
  "order": {
    "id": "order-id",
    "customerName": "John Doe",
    "totalAmount": 449.99,
    "address": "123 Main St",
    "city": "New York",
    "createdAt": "2026-06-14T00:00:00Z"
  },
  "trackingHistory": [
    {
      "status": "in_transit",
      "location": "Memphis, TN",
      "timestamp": "2026-06-15T10:30:00Z",
      "description": "Package in transit"
    }
  ]
}
```

---

### Admin Endpoints

#### Get Unshipped Orders (Confirmed)
```
GET /api/orders?status=confirmed
Authorization: Bearer {adminToken}
```

**Response:**
```json
{
  "orders": [
    {
      "id": "order-id",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "totalAmount": 449.99,
      "status": "confirmed",
      "createdAt": "2026-06-14T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

#### Ship an Order (Create Delivery & Tracking)
```
POST /api/orders/{orderId}/ship
Authorization: Bearer {adminToken}

{
  "carrier": "FedEx",
  "shippingMethod": "Express",
  "estimatedDays": 2,
  "shippingCost": 25.00
}
```

**Response:**
```json
{
  "success": true,
  "delivery": {
    "trackingNumber": "TRK-20260614-A1B2",
    "status": "pending",
    "carrier": "FedEx",
    "estimatedDelivery": "2026-06-16T00:00:00Z"
  },
  "message": "Order shipped successfully. Tracking number: TRK-20260614-A1B2"
}
```

#### Update Tracking Status
```
PUT /api/tracking/{trackingNumber}
Authorization: Bearer {adminToken}

{
  "status": "in_transit",
  "location": "Memphis, TN",
  "latitude": 35.1495,
  "longitude": -90.0490,
  "description": "Package in transit to destination"
}
```

**Valid Statuses:**
- `pending` - Order prepared, ready for pickup
- `picked` - Package picked up from warehouse
- `in_transit` - In transit to destination
- `out_for_delivery` - Out for delivery today
- `delivered` - Package delivered
- `failed` - Delivery failed

#### Get All Tracking Info (Admin Dashboard)
```
GET /api/admin/tracking?status=in_transit&carrier=FedEx&page=1&limit=20
Authorization: Bearer {adminToken}
```

---

## 🖥️ Frontend Pages

### Public Tracking Page
**URL:** `/tracking`

Features:
- Search by tracking number
- Real-time status display
- Timeline visualization
- Order details display
- FAQ section
- Mobile responsive
- No authentication required

### Admin Tracking Management
**URL:** `/admin/tracking` (requires admin authentication)

Features:
- Two tabs: "Pending Shipments" & "Active Tracking"
- Ship orders with carrier selection
- Update tracking status and location
- Add GPS coordinates
- View all active deliveries
- Pagination and filtering

---

## 📧 Email Notifications

When an order is shipped, the system automatically creates a notification with:

```
Subject: Your StonesLand Order #{orderId} Has Been Shipped!
Body: Your order has been shipped with tracking number: {trackingNumber}
      Estimated delivery: {estimatedDeliveryDate}
```

**Note:** Email sending requires integration with an email service (SendGrid, AWS SES, etc.). Currently set to create notification records.

---

## 🔐 Security

### Authentication
- All admin endpoints require JWT token verification
- Tokens obtained via admin login at `/admin/login`
- Tokens must be sent in `Authorization: Bearer {token}` header

### Validation
- Tracking numbers validated against format: `TRK-YYYYMMDD-XXXX`
- Unique tracking number generation prevents duplicates
- Status validation ensures only valid statuses accepted
- Input sanitization on all endpoints

### Privacy
- Customers can only access public `/tracking` endpoint
- No authentication required for customer tracking
- Order details include only relevant information
- Email addresses not exposed except to recipients

---

## 🚀 Usage Examples

### Admin: Ship an Order

```typescript
const response = await fetch('/api/orders/order-123/ship', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    carrier: 'FedEx',
    shippingMethod: 'Express',
    estimatedDays: 2,
    shippingCost: 25.00,
  }),
});

const data = await response.json();
console.log(`Tracking: ${data.delivery.trackingNumber}`);
```

### Admin: Update Tracking Status

```typescript
const response = await fetch('/api/tracking/TRK-20260614-A1B2', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    status: 'out_for_delivery',
    location: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    description: 'Out for delivery today',
  }),
});
```

### Customer: Track Order

```typescript
const response = await fetch(
  '/api/tracking?trackingNumber=TRK-20260614-A1B2'
);
const tracking = await response.json();
console.log(`Status: ${tracking.status}`);
console.log(`Location: ${tracking.currentLocation}`);
console.log(`Est. Delivery: ${tracking.estimatedDelivery}`);
```

---

## 📊 Statistics & Metrics

Track shipments by:
- **Status** - pending, in transit, delivered, failed
- **Carrier** - FedEx, UPS, DHL, Local
- **Date** - Order date, ship date, delivery date
- **Average Delivery Time** - Days from ship to delivery
- **Success Rate** - Percentage of successful deliveries

---

## 🔄 Status Flow

```
pending (order ready)
   ↓
picked (picked from warehouse)
   ↓
in_transit (in transit)
   ↓
out_for_delivery (arriving today)
   ↓
delivered (SUCCESS)

OR

failed (EXCEPTION - delivery issue)
```

---

## 📱 Mobile Features

The tracking page is fully mobile-optimized with:
- Responsive layout for all screen sizes
- Touch-friendly buttons
- Readable text on small screens
- Optimized image handling
- Fast loading times
- Works offline-first (caching ready)

---

## 🛠️ Configuration

### Carriers
Add more carriers by updating the `CARRIERS` array in `AdminTrackingManager.tsx`:

```typescript
const CARRIERS = ['FedEx', 'UPS', 'DHL', 'Local Courier', 'Your Carrier'];
```

### Shipping Methods
Update `SHIPPING_METHODS`:

```typescript
const SHIPPING_METHODS = ['Standard', 'Express', 'Overnight', 'International'];
```

### Status Options
Update `STATUSES`:

```typescript
const STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];
```

---

## 🔌 Integration Checklist

- [x] Database models (Delivery, TrackingEvent, DeliveryNotification)
- [x] API endpoints (GET tracking, POST ship, PUT update)
- [x] Public tracking page with search
- [x] Admin tracking management dashboard
- [x] Automatic tracking number generation (TRK-YYYYMMDD-XXXX)
- [x] Real-time status updates
- [x] Timeline visualization
- [x] Email notification records
- [x] Mobile-responsive design
- [x] Security & validation
- [ ] Email service integration (SendGrid/AWS SES)
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Carrier API integration (auto-pull data)

---

## 📞 Support

For issues or questions:
1. Check the FAQ section on `/tracking` page
2. Review admin dashboard at `/admin/tracking`
3. Check API responses for error messages
4. Verify JWT token validity for admin operations

---

## 🎯 Next Steps

To fully activate the system:

1. **Integrate Email Service**
   - Connect SendGrid or AWS SES
   - Update notification system to actually send emails

2. **Add Carrier APIs**
   - Integrate FedEx, UPS, DHL APIs
   - Auto-pull tracking updates

3. **Implement SMS/Push**
   - Add Twilio for SMS notifications
   - Add Firebase for push notifications

4. **Analytics Dashboard**
   - View delivery metrics
   - Track success rates
   - Analyze carrier performance

5. **Map Integration**
   - Display GPS coordinates on map
   - Real-time delivery visualization
   - Route optimization

---

**Version:** 1.0.0  
**Last Updated:** June 14, 2026  
**Status:** ✅ Active
