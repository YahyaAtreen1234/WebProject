# Features Guide

Complete documentation of all features in Mineral Gallery.

## Table of Contents

1. [Shopping Features](#shopping-features)
2. [User Account Features](#user-account-features)
3. [Checkout & Payment](#checkout--payment)
4. [Shipping & Delivery](#shipping--delivery)
5. [Admin Features](#admin-features)
6. [Support Features](#support-features)

---

## Shopping Features

### Product Browsing

**Homepage**
- Featured products showcase
- Category navigation
- Search functionality

**Shop Page**
- Complete product catalog
- Filtering by category
- Sorting options:
  - Newest first
  - Price: low to high
  - Price: high to low
  - Most popular

**Product Details**
- Full product description
- High-quality images with zoom
- Current availability/stock status
- Average rating and review count
- Related products

### Product Reviews

**Reading Reviews**
- View customer reviews with ratings
- Filter by rating (1-5 stars)
- Sort reviews (newest, most helpful)
- See verified purchase badge
- Review helpful votes

**Writing Reviews**
- Rate product (1-5 stars)
- Write review title (required)
- Write detailed comment (min 10 chars)
- Mark review as verified if purchased
- Edit your own review
- Delete your own review

**Review Display**
- Average rating with star display
- Review count
- Breakdown by rating
- Pagination (10 per page)
- Helpful vote counter

### Wishlist

**Add to Wishlist**
- Save products from shop or detail page
- Heart icon to toggle
- Wishlist counter in navigation

**View Wishlist**
- Access at `/wishlist`
- See all saved products
- Remove items
- Add to cart from wishlist

**Wishlist Persistence**
- Saved per user account
- Syncs across devices when logged in
- Stored in database

### Product Comparison

**Start Comparison**
- Click "Compare" on product cards
- Add up to 5 products to compare
- View comparison table

**Compare Features**
- Side-by-side product specs
- Price comparison
- Stock availability
- Customer rating
- Filter comparison items
- Add compared items to cart

---

## User Account Features

### Registration

**Sign Up**
- Email address (required, must be valid)
- Full name (required)
- Password (min 6 chars, required)
- Password confirmation
- Email verification required

**After Registration**
- Verification email sent
- Click link to confirm email
- Account becomes active

### Login & Logout

**Login**
- Email and password required
- "Remember me" option (optional)
- JWT token issued (24-hour expiry)

**Logout**
- Click logout in user menu
- Token invalidated
- Redirected to home page

### User Profile

**Profile Information**
- Full name
- Email address
- Phone number (optional)
- Profile picture (optional)

**Update Profile**
- Edit any profile field
- Upload new profile picture
- Changes saved immediately

### Password Management

**Change Password**
- Current password required for verification
- New password (min 6 chars)
- Confirm new password
- Old password invalidated

**Forgot Password**
- Enter email on forgot password page
- Reset link sent to email
- Click link to set new password
- Old password immediately invalidated

### Address Management

**Add Address**
- Full name (required)
- Phone number (required)
- Address line 1 (required)
- Address line 2 (optional)
- City (required)
- State/Province (optional)
- Postal code (required)
- Country (required)
- Mark as default address

**Manage Addresses**
- View all saved addresses
- Set default address for checkout
- Edit address details
- Delete address (if not only one)
- Add new addresses

### Payment Methods

**Saved Payment Methods**
- View all saved cards
- Last 4 digits displayed (not full number)
- Expiry date
- Cardholder name
- Set as default payment method

**Add Payment Method**
- Credit card details
- PayPal account
- Apple Pay
- Google Pay
- Bank transfer

**Security**
- No full card numbers stored
- Payment processing via Stripe
- PCI DSS compliant

---

## Checkout & Payment

### Shopping Cart

**Add to Cart**
- Click "Add to Cart" on product
- Select quantity
- Toast notification confirms
- Cart icon shows item count

**Cart Page**
- View all cart items
- Adjust quantities
- Remove items
- See subtotal
- Apply discount code
- Proceed to checkout

**Cart Persistence**
- Saved in browser localStorage
- Syncs when logged in (database)
- Survives browser close

**Empty Cart**
- Button to clear all items
- Confirmation dialog

### Discount Codes

**Apply Discount**
- Enter code on cart or checkout
- Validation instantly
- Show savings amount
- Code details displayed
- One code per order

**Discount Types**
- **Percentage:** e.g., 10% off
- **Fixed Amount:** e.g., $5 off
- **Free Shipping:** Free delivery
- **Minimum Order:** Some require minimum purchase

**Discount Details**
- Code name
- Discount amount/percentage
- Minimum order requirement
- Expiry date (if applicable)
- Usage limit per customer
- "WELCOME10" - 10% off

### Checkout Flow

**Step 1: Shipping Address**
- Select from saved addresses or add new
- Shipping method selection
- Estimated delivery date

**Step 2: Billing Address**
- Same as shipping or different
- Save for future use

**Step 3: Payment Method**
- Select saved payment method or add new
- Billing address confirmation
- Secure payment form

**Step 4: Review Order**
- Order summary
- Item list with prices
- Shipping cost
- Discount applied
- Tax calculation
- Total amount

**Order Confirmation**
- Order number generated (e.g., ORD-2024-001)
- Confirmation email sent
- Redirect to order details page
- Receipt available for download

### Payment Methods

**Credit/Debit Card**
- Processed by Stripe
- Secure tokenization
- No card storage on server

**Digital Wallets**
- Apple Pay
- Google Pay
- PayPal

**Bank Transfer**
- Coming soon

---

## Shipping & Delivery

### Shipping Methods

**Available Carriers**
- FedEx
- UPS
- DHL

**Methods**
- Standard (5-7 business days)
- Express (2-3 business days)
- Overnight (1 business day)

**Costs**
- Calculated by weight and distance
- Free shipping for orders over $100
- Free shipping with FREESHIP code

### Delivery Tracking

**Track Order**
- Use order number (ORD-XXXX)
- Tracking number provided in confirmation
- Real-time GPS tracking
- Live map view

**Tracking Information**
- Current location with map
- Delivery status
- Estimated delivery date
- Timeline of events
- Signature required (if applicable)

**Delivery Notifications**
- Email notifications at each milestone
- SMS updates (if opted in)
- In-app notifications

**Order Statuses**
- **Pending:** Awaiting processing
- **Processing:** Preparing shipment
- **Picked Up:** Carrier collected
- **In Transit:** On the way
- **Delivery Attempt:** Out for delivery
- **Delivered:** Successfully delivered
- **Returned:** Sent back to sender

### Returns & Refunds

**Return Request**
- Initiated from order details page
- Select items to return (1-5 days after delivery)
- Return reason required
- Return condition selection:
  - New (unopened)
  - Like new
  - Good condition
  - Fair condition
  - Poor condition

**Return Shipping**
- Free return label generated
- Prepaid shipping label
- Drop at any carrier location

**Refund Processing**
- Return must be received within 30 days
- Item condition verified
- Refund issued within 5 business days
- Credited to original payment method

**Return Status Tracking**
- Track return shipment
- Check refund status
- Estimated refund date

---

## Admin Features

### Dashboard

**Overview Cards**
- Total revenue (current month)
- Total orders (current month)
- Total customers
- Average order value

**Charts**
- Revenue trend (last 30 days)
- Orders by status
- Top products
- Customer growth

**Recent Activity**
- Latest orders
- New customers
- Recent reviews
- Support tickets

### Product Management

**List Products**
- Search by name or ID
- Filter by category
- Pagination
- Bulk actions

**Create Product**
- Product title (required)
- Description
- Price
- Category selection
- Stock quantity
- Upload images (up to 5)
- Featured product toggle

**Edit Product**
- Update any field
- Change pricing
- Adjust stock
- Manage images
- Mark/unmark featured

**Delete Product**
- Soft delete option
- Confirmation required
- Archive instead of delete

### Order Management

**View Orders**
- Filter by status
- Date range filtering
- Search by order number or customer
- Sort by date, amount, status

**Order Details**
- Customer information
- Item list with prices
- Shipping address
- Tracking information
- Payment details
- Order notes

**Update Order**
- Change order status
- Add order notes
- Refund order (partial or full)
- Void order

**Fulfill Order**
- Generate packing slip
- Create shipping label
- Mark as shipped
- Send tracking info to customer
- View fulfillment status

### User Management

**List Users**
- View all users
- Search by email or name
- Filter by role
- Sort by registration date

**Create User**
- Add new user manually
- Set role (admin, manager, staff, viewer, customer)
- Set status (active, inactive, pending)
- Send welcome email

**Edit User**
- Update name and email
- Change role
- Change status
- Reset password
- View user activity

**Delete User**
- Soft delete option
- Archive user data
- Prevent login

**User Roles & Permissions**
- Admin: Full access
- Manager: Orders, reports, view users
- Staff: Orders and deliveries
- Viewer: Read-only access
- Customer: Regular user

### Financial Reports

**Revenue Reports**
- Total revenue by date range
- Revenue by product
- Revenue by category
- Refunds and chargebacks
- Average order value

**Sales Reports**
- Orders by date
- Top selling products
- Conversion metrics
- Customer acquisition cost

**Discount Analytics**
- Most used codes
- Discount redemption rate
- Discount revenue impact

### Email Marketing

**Email Campaigns**
- Create new campaign
- Select recipient list
- Compose HTML email
- Preview email
- Schedule send date/time

**Newsletter**
- Manage subscriber list
- Send newsletters
- Track opens and clicks
- Unsubscribe management

**Transactional Emails**
- Order confirmation
- Shipping notification
- Delivery confirmation
- Return confirmation
- Refund notification

### Delivery Management

**Shipping Rates**
- View all configured rates
- Add new shipping method
- Edit shipping costs
- Set rate per carrier/method

**Delivery Admin Panel**
- View all deliveries
- Update tracking info
- Add delivery events
- Send notifications
- Manage returns

**Tracking Management**
- Update delivery status
- Add location updates
- Manage signature requirements
- Modify delivery date

### Reports & Analytics

**Sales Analytics**
- Revenue trends
- Order trends
- Top products
- Top categories
- Customer lifetime value

**Customer Analytics**
- Total customers
- New customers (period)
- Customer retention
- Average customer value
- Cohort analysis

**Inventory Analytics**
- Stock levels
- Stock turnover rate
- Low stock alerts
- Best sellers
- Slow movers

---

## Support Features

### Contact Form

**Send Message**
- Name (required)
- Email (required)
- Phone (optional)
- Subject (required)
- Message (required)
- Receive confirmation email

**Support Team Access**
- View all messages
- Filter by read status
- Search messages
- Reply to customer

### Support Tickets

**Create Ticket**
- Subject (required)
- Category:
  - General
  - Order
  - Product
  - Technical
  - Refund
  - Shipping
  - Other
- Priority (optional):
  - Low
  - Medium (default)
  - High
  - Urgent

**Ticket Management**
- View ticket list (user and admin)
- Filter by status
- Filter by category
- Add messages to ticket
- Assign to staff member (admin)
- Change priority
- Mark as resolved

**Ticket Statuses**
- **Open:** New ticket
- **In Progress:** Being handled
- **Waiting Customer:** Awaiting response
- **Resolved:** Fixed, pending closure
- **Closed:** Complete

**Internal Notes**
- Admin-only notes
- Not visible to customer
- Document troubleshooting steps
- Add file attachments

**Ticket History**
- View all conversations
- See timestamps
- Track who responded
- See attachments

### FAQ & Help

**Help Center Pages**
- Shipping information
- Return policy
- Payment methods
- Frequently asked questions
- Glossary

**Self-Service**
- Search help articles
- Filter by category
- Related articles
- Helpful/not helpful votes

---

## Additional Features

### Notifications

**Email Notifications**
- Order confirmation
- Order status updates
- Shipping notification
- Delivery confirmation
- Return status
- Refund confirmation
- Promotional emails (opt-in)

**In-App Notifications**
- Toast messages for actions
- Notification center (upcoming)
- Unread message count

### Custom Orders

**Request Custom Item**
- Describe desired product
- Upload reference images
- Set budget range
- Set deadline
- Admin reviews and quotes
- Customer accepts quote
- Order enters fulfillment

### Money-Back Guarantee

**30-Day Guarantee**
- Full refund within 30 days
- No questions asked
- Original condition required
- Shipping cost may apply
- Refund to original payment method

---

## Accessibility Features

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support
- Mobile responsive design

---

## Performance Features

- Image optimization
- Lazy loading
- Code splitting
- Caching strategies
- Database query optimization
- CDN delivery (Vercel)

---

## Security Features

- Secure password hashing
- JWT authentication
- HTTPS encryption
- Role-based access control
- PCI DSS compliance
- CSRF protection
- XSS prevention

---

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Roadmap

Upcoming features in development:

- [ ] Live chat support
- [ ] AR product preview
- [ ] Mobile app (React Native)
- [ ] AI product recommendations
- [ ] Subscription products
- [ ] Wholesale pricing
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics
- [ ] Marketplace (3rd-party sellers)
- [ ] Loyalty program
