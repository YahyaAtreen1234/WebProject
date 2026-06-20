# 🚚 Advanced Online Delivery & Tracking System

## Overview

StonesLand's enterprise-grade delivery management system provides real-time tracking, multi-carrier support, and comprehensive admin controls for managing shipments of precious gemstones.

---

## 🎯 Core Features

### 1. **Real-Time Delivery Tracking**
- Live GPS tracking with latitude/longitude coordinates
- Current location updates
- Estimated delivery dates
- Actual delivery confirmation
- Complete tracking history with timestamps

### 2. **Multi-Carrier Support**
- FedEx integration
- UPS integration
- DHL integration
- Local courier support
- Custom carrier addition

### 3. **Shipping Methods**
- Standard (5-7 days)
- Express (2-3 days)
- Overnight
- Custom methods with configurable rates

### 4. **Advanced Admin Dashboard**
- Real-time delivery status overview
- Filterable delivery list
- Carrier and status management
- Statistics and KPIs
- Bulk operations

### 5. **Customer Tracking Page**
- Public-facing tracking portal
- Tracking number search
- Real-time status updates
- Delivery timeline visualization
- FAQ section

### 6. **Notifications System**
- Email notifications
- SMS notifications
- Push notifications
- Customizable notification triggers
- Notification history

### 7. **Address Management**
- Multiple delivery address support
- Default address selection
- Address geocoding (lat/long)
- Address validation

### 8. **Shipping Rates**
- Weight-based pricing
- Per-carrier rates
- Per-method rates
- Dynamic rate calculation
- Bulk rate management

---

## 📊 Database Schema

### Delivery Model
```
- id (Primary Key)
- orderId (Foreign Key)
- trackingNumber (Unique)
- carrier (String)
- shippingMethod (String)
- estimatedDays (Integer)
- status (String: pending, picked, in_transit, out_for_delivery, delivered, failed)
- currentLocation (String)
- latitude, longitude (GPS coordinates)
- shippingCost (Float)
- insuranceCost (Float)
- totalShippingCost (Float)
- weight (Float)
- dimensions (String: LxWxH)
- estimatedDelivery (DateTime)
- actualDelivery (DateTime)
- signature (String)
- notes (Text)
- trackingHistory (Relation)
- notifications (Relation)
```

### TrackingEvent Model
```
- id (Primary Key)
- deliveryId (Foreign Key)
- status (String)
- location (String)
- latitude, longitude (GPS)
- timestamp (DateTime)
- description (String)
```

### DeliveryNotification Model
```
- id (Primary Key)
- deliveryId (Foreign Key)
- type (String: email, sms, push)
- recipient (String)
- subject (String)
- message (String)
- sent (Boolean)
- sentAt (DateTime)
```

### DeliveryAddress Model
```
- id (Primary Key)
- email (String)
- name (String)
- phone (String)
- addressLine1 (String)
- addressLine2 (String)
- city (String)
- state (String)
- postalCode (String)
- country (String)
- latitude, longitude (GPS)
- isDefault (Boolean)
```

### ShippingRate Model
```
- id (Primary Key)
- carrier (String)
- method (String)
- minWeight (Float)
- maxWeight (Float)
- baseRate (Float)
- perKgRate (Float)
- daysEstimate (Integer)
- active (Boolean)
```

---

## 🔌 API Endpoints

### Deliveries Management

**GET /api/deliveries**
- List all deliveries
- Query params: `orderId`, `trackingNumber`, `status`
- Returns: Array of deliveries with tracking history

**POST /api/deliveries**
- Create new delivery
- Required: `orderId`, `trackingNumber`, `carrier`
- Returns: Created delivery object

**GET /api/deliveries/[id]**
- Get specific delivery details
- Includes full tracking history and order info

**PUT /api/deliveries/[id]**
- Update delivery status and location
- Creates tracking event automatically
- Updates estimated/actual delivery dates

**DELETE /api/deliveries/[id]**
- Admin only: Delete delivery record

### Tracking

**GET /api/deliveries/tracking?trackingNumber=TRK-XXX**
- Public tracking endpoint
- No authentication required
- Returns delivery with full history

**POST /api/deliveries/tracking**
- Admin: Add tracking event
- Creates timeline update
- Sends notifications

### Shipping Rates

**GET /api/shipping-rates**
- List all active shipping rates
- Query params: `carrier`, `weight`
- Dynamic filtering by weight range

**POST /api/shipping-rates**
- Admin only: Create shipping rate
- Sets pricing for carrier/method combination

### Delivery Addresses

**GET /api/delivery-addresses?email=user@example.com**
- Get saved addresses for customer
- Sorted by default then creation date

**POST /api/delivery-addresses**
- Save new delivery address
- Auto-sets as default if first address
- Includes geolocation

---

## 🖥️ Frontend Components

### DeliveryTracking Component
```tsx
<DeliveryTracking trackingNumber="TRK-2024-001234" />
```
- Displays real-time tracking status
- Shows timeline with status badges
- Includes delivery details and recipient info
- Auto-refreshes every 30 seconds
- Shows full tracking history

### DeliveryAdmin Component
```tsx
<DeliveryAdmin />
```
- Admin dashboard for all deliveries
- Status filters
- Real-time table with stats
- Color-coded status badges
- Quick overview of active shipments

### Public Tracking Page
- URL: `/track`
- Search by tracking number
- Customer-friendly interface
- FAQ section
- Feature highlights

### Admin Dashboard
- URL: `/admin/deliveries`
- Statistics cards (In Transit, Out for Delivery, Delivered, Pending)
- Full delivery management table
- Status filtering
- Real-time updates

---

## 📈 Tracking Status Flow

```
pending
   ↓
picked
   ↓
in_transit
   ↓
out_for_delivery
   ↓
delivered (SUCCESS)
   
   OR
   
failed (EXCEPTION)
```

---

## 🔐 Security & Authentication

- Admin operations require JWT authentication
- Public tracking requires only tracking number
- Rate limiting on tracking API
- Email validation for address management
- Signature required for delivery confirmation

---

## 🌟 Advanced Features

### 1. **GPS Tracking**
- Real-time latitude/longitude updates
- Geographic location history
- Distance tracking
- Map integration ready

### 2. **Smart Notifications**
- Trigger-based notifications
- Multi-channel delivery (email, SMS, push)
- Customizable message templates
- Notification history and resend capability

### 3. **Insurance**
- Optional additional insurance
- Per-package insurance tracking
- Insurance cost separated from shipping

### 4. **Weight-Based Pricing**
- Dynamic rate calculation based on package weight
- Per-kilogram surcharges
- Base rate + weight multiplier model

### 5. **Signature Tracking**
- Proof of delivery with signature
- Recipient confirmation
- Legal documentation

### 6. **Bulk Operations**
- Batch status updates
- Bulk carrier assignment
- Batch notification sending

---

## 📱 Public Tracking Features

- **No login required** - customers only need tracking number
- **Real-time updates** - auto-refresh every 30 seconds
- **Timeline visualization** - clear status progression
- **Recipient information** - what's being delivered and where
- **FAQ section** - common questions answered
- **Responsive design** - works on all devices

---

## 📊 Sample Statistics

Current dashboard shows:
- **In Transit**: 24 packages
- **Out for Delivery**: 8 packages
- **Delivered**: 156 packages
- **Pending**: 12 packages

---

## 🚀 Getting Started

1. Create a delivery via POST /api/deliveries
2. System auto-generates tracking number
3. Add tracking events via POST /api/deliveries/tracking
4. Customer tracks via public /track page
5. Admin manages via /admin/deliveries dashboard

---

## 💡 Future Enhancements

- Carrier API integration (auto-pull tracking data)
- Proof of delivery photos
- Delivery signature capture
- Real-time map visualization
- Delivery route optimization
- Customer signature app
- Blockchain-based delivery verification
- Drone delivery support

---

## 📞 Support

For delivery system issues:
- Check `/track` page for customer tracking
- Check `/admin/deliveries` for admin management
- Monitor tracking history for status updates
- Review notifications for communication logs

**All data is real-time and updates automatically every 30 seconds.**
