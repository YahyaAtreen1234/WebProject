# 🚀 Tracking System Setup Guide

## Quick Start

The tracking system is fully integrated into your StonesLand project. Follow these steps to activate it:

---

## ✅ Step 1: Database Migration

The Delivery model already exists in your Prisma schema. Run the following commands:

```bash
# Generate Prisma client
npm run prisma:generate

# If you need to update schema
npm run prisma:migrate -- --name add_tracking
```

---

## ✅ Step 2: Test the System

### Test the Public Tracking Page

1. Start your dev server:
```bash
npm run dev
```

2. Visit: `http://localhost:3000/tracking`

3. Try searching with a valid tracking number format:
   - Example: `TRK-20260614-A1B2`

### Test the Admin Interface

1. Login to admin at: `http://localhost:3000/admin/login`

2. Navigate to: `http://localhost:3000/admin/tracking`

3. You should see two tabs:
   - **Pending Shipments** - Orders ready to ship
   - **Active Tracking** - Shipments in progress

---

## ✅ Step 3: Create Test Orders

### Using the API

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA",
    "totalAmount": 449.99,
    "items": [
      {
        "productId": "product-id",
        "quantity": 1,
        "price": 449.99,
        "title": "Premium Ruby Gemstone"
      }
    ]
  }'
```

---

## ✅ Step 4: Ship an Order

### Via API

```bash
curl -X POST http://localhost:3000/api/orders/{orderId}/ship \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "carrier": "FedEx",
    "shippingMethod": "Express",
    "estimatedDays": 2,
    "shippingCost": 25.00
  }'
```

Response will include:
```json
{
  "success": true,
  "delivery": {
    "trackingNumber": "TRK-20260614-ABC1",
    "status": "pending",
    "estimatedDelivery": "2026-06-16T00:00:00Z"
  }
}
```

### Via Admin Dashboard

1. Go to `/admin/tracking`
2. Click "Pending Shipments" tab
3. Click "Ship This Order" button
4. Fill in carrier, method, days, and cost
5. Click "Ship Order"
6. Copy the tracking number shown in the success message

---

## ✅ Step 5: Update Tracking Status

### Via API

```bash
curl -X PUT http://localhost:3000/api/tracking/TRK-20260614-ABC1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "in_transit",
    "location": "Memphis, TN",
    "latitude": 35.1495,
    "longitude": -90.0490,
    "description": "Package in transit to destination"
  }'
```

### Via Admin Dashboard

1. Go to `/admin/tracking`
2. Click "Active Tracking" tab
3. Click "Update Tracking" on the shipment
4. Update status, location, and coordinates
5. Click "Update Tracking"

---

## ✅ Step 6: Customer Tracking

### Test Public Tracking

1. Visit: `http://localhost:3000/tracking`
2. Enter the tracking number: `TRK-20260614-ABC1`
3. See:
   - Current status
   - Location information
   - Timeline of updates
   - Order details
   - Estimated delivery date

---

## 🔧 Key Files

### Backend Files
- `src/lib/tracking.ts` - Tracking utilities
- `src/app/api/tracking/route.ts` - Public tracking endpoint
- `src/app/api/tracking/[trackingNumber]/route.ts` - Get/update tracking
- `src/app/api/orders/[id]/ship/route.ts` - Ship order endpoint
- `src/app/api/admin/tracking/route.ts` - Admin tracking list
- `prisma/schema.prisma` - Database models

### Frontend Files
- `src/components/TrackingPage.tsx` - Public tracking component
- `src/components/AdminTrackingManager.tsx` - Admin manager
- `src/app/tracking/page.tsx` - Public page
- `src/app/admin/tracking/page.tsx` - Admin page

### Database Models
- `Delivery` - Main tracking record
- `TrackingEvent` - Timeline events
- `DeliveryNotification` - Notification records

---

## 🎯 Feature Implementation Checklist

### Completed ✅
- [x] Tracking number generation (TRK-YYYYMMDD-XXXX format)
- [x] Unique tracking number validation
- [x] Order-to-delivery linking
- [x] Status tracking with timeline
- [x] Public tracking page with search
- [x] Admin tracking management dashboard
- [x] Real-time status updates
- [x] Mobile-responsive design
- [x] GPS coordinate support
- [x] Multi-carrier support
- [x] Admin authentication
- [x] API endpoints
- [x] Database schema

### In Progress 🔄
- [ ] Email notification integration
- [ ] SMS notifications
- [ ] Push notifications

### Not Implemented (Future) 📋
- [ ] Carrier API auto-sync (FedEx, UPS, DHL)
- [ ] Real-time map visualization
- [ ] Delivery signature capture
- [ ] Proof of delivery photos
- [ ] Route optimization
- [ ] Blockchain verification

---

## 🔐 Security Checklist

### Authentication
- [x] JWT token verification for admin endpoints
- [x] Admin access required for shipping/updates
- [x] Public read-only access for tracking

### Validation
- [x] Tracking number format validation
- [x] Status validation
- [x] Input sanitization
- [x] Unique tracking number enforcement

### Privacy
- [x] No unnecessary data exposure
- [x] Email addresses protected
- [x] Order details access controlled

---

## 🚨 Troubleshooting

### Tracking Page Not Found
**Issue:** 404 at `/tracking`
**Solution:** 
1. Make sure `src/app/tracking/page.tsx` exists
2. Restart dev server: `npm run dev`

### Admin Tracking Page Needs Auth
**Issue:** Redirected to login when accessing `/admin/tracking`
**Solution:**
1. Login at `/admin/login` first
2. Make sure your admin token is valid
3. Check localStorage for `adminToken`

### Orders Not Showing in Pending
**Issue:** No orders in "Pending Shipments" tab
**Solution:**
1. Create orders with status "confirmed"
2. Orders must not already have a delivery record
3. Check database query filters

### Tracking Number Not Found
**Issue:** Search returns 404
**Solution:**
1. Verify tracking number format: `TRK-YYYYMMDD-XXXX`
2. Check if delivery record exists in database
3. Verify exact tracking number (case-sensitive)

### API Returns 401 Unauthorized
**Issue:** Admin API endpoints return 401
**Solution:**
1. Include `Authorization: Bearer {token}` header
2. Verify token is not expired
3. Login again to get fresh token

---

## 📊 Testing Scenarios

### Scenario 1: Complete Happy Path
1. Create order → Order shows in pending
2. Ship order → Tracking number generated
3. Update status multiple times → Timeline builds
4. Customer searches tracking → Sees complete history

### Scenario 2: Failed Delivery
1. Ship order
2. Update status to "out_for_delivery"
3. Update status to "failed"
4. Customer sees failed status

### Scenario 3: Expedited Delivery
1. Ship with "Express" method
2. Update status quickly (faster than estimate)
3. Mark delivered early
4. Customer sees early delivery

---

## 💡 Pro Tips

### Quick Testing
```bash
# Get all orders
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all tracking
curl http://localhost:3000/api/admin/tracking \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific tracking
curl "http://localhost:3000/api/tracking?trackingNumber=TRK-20260614-ABC1"
```

### Testing Email Integration (Future)
When you integrate an email service:
```typescript
// In API endpoints, look for:
await sendEmail(customerEmail, trackingNumber);
```

### Adding GPS Coordinates
Use online tools to get coordinates:
- Google Maps: Right-click → Get coordinates
- Latitude should be -90 to 90
- Longitude should be -180 to 180

---

## 🎓 Learning Resources

### File Structure
```
src/
├── app/
│   ├── tracking/           # Public tracking page
│   ├── admin/tracking/     # Admin management page
│   └── api/
│       ├── tracking/       # Tracking API endpoints
│       └── orders/         # Order API endpoints
├── components/
│   ├── TrackingPage.tsx    # Public component
│   └── AdminTrackingManager.tsx  # Admin component
└── lib/
    └── tracking.ts         # Utilities
```

### Database Schema
- See `prisma/schema.prisma` for complete models
- Key tables: Delivery, TrackingEvent, Order, DeliveryNotification

### API Documentation
- See `TRACKING_SYSTEM.md` for complete API reference
- All endpoints documented with examples

---

## 🚀 Deployment

### Before Deploying
1. [ ] Test all tracking features locally
2. [ ] Verify admin authentication works
3. [ ] Test with real shipping data
4. [ ] Review and update carrier list if needed
5. [ ] Plan email service integration
6. [ ] Set up environment variables
7. [ ] Test on staging environment

### Environment Variables
Add to `.env.local`:
```
# Already configured
DATABASE_URL=file:./dev.db

# For future email integration
SENDGRID_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

### Performance Considerations
- Tracking page loads quickly (no auth required)
- Admin page paginated (20 per page default)
- Database indexes on `trackingNumber`, `status`, `timestamp`
- No N+1 queries in API endpoints

---

## 📞 Support & Next Steps

### What Works Now ✅
- Complete tracking system for orders
- Admin management interface
- Public tracking search
- Real-time status updates
- Mobile-responsive design

### What Needs Setup 🔧
- Email notifications (integrate SendGrid/AWS SES)
- SMS notifications (integrate Twilio)
- Push notifications (integrate Firebase)
- Carrier API integration (FedEx/UPS/DHL)

### Contact
For questions or issues, check:
1. TRACKING_SYSTEM.md - Complete documentation
2. API response error messages
3. Browser console for frontend errors
4. Database logs for data issues

---

**Status:** ✅ Ready for Use  
**Last Updated:** June 14, 2026  
**Version:** 1.0.0
