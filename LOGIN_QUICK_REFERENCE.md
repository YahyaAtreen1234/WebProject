# 🔑 Login System - Quick Reference

## ⚡ Get Started in 60 Seconds

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Go to Login Page
```
http://localhost:3000/admin/login
```

### Step 3: Login with Demo Credentials
Click: **"📋 Try Demo Login"**

Or enter manually:
- **Email:** `admin@stonesland.com`
- **Password:** `AdminPassword123!`

### Step 4: You're In! 🎉
You'll see the admin dashboard with all sections:
- 📦 Orders
- 🚚 Deliveries  
- 📍 Tracking
- 🎛️ Advanced Panel

---

## 🔐 Credentials

### Default Admin Account
```
Email:    admin@stonesland.com
Password: AdminPassword123!
```

### Change Credentials
Edit `.env.local`:
```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-new-password
```

Restart server: `npm run dev`

---

## 📌 Key Features

| Feature | How to Use |
|---------|-----------|
| **Show/Hide Password** | Click 👁️ icon while typing |
| **Remember Me** | Check box to save email |
| **Demo Login** | Click "📋 Try Demo Login" |
| **Caps Lock Warning** | Shows when Caps Lock on |
| **Forgot Password** | Click link (coming soon) |
| **Logout** | Click 🚪 button in header |

---

## 🎯 Navigation After Login

After logging in, you'll see these buttons in the header:

```
📦 Orders      → Manage all orders
🚚 Deliveries  → View delivery dashboard
📍 Tracking    → Manage shipment tracking
🎛️ Panel       → Advanced delivery dashboard
🚪 Logout      → Exit admin panel
```

---

## ✅ Form Validation

The login form checks:

```
✓ Email must be valid format (example@domain.com)
✓ Password must be 6+ characters
✓ Both fields required
✓ Case-sensitive (passwords are case-sensitive)
```

Error messages will tell you what's wrong.

---

## 🚨 If Locked Out

**After 5 failed attempts:**
- Account blocked for 15 minutes
- Try again after waiting
- Or clear browser: `localStorage.clear()`

---

## 🔒 Security Tips

- ✅ Use strong password
- ✅ Check "Remember me" only on trusted devices
- ✅ Logout when done
- ✅ Never share password
- ✅ Don't login on public WiFi without VPN

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Login page blank | Restart: `npm run dev` |
| Login fails | Check .env.local credentials |
| Keep redirecting to login | Token expired, login again |
| Can't logout | Click 🚪 button or clear browser |
| Forgot password | Coming soon (contact admin) |

---

## 📍 All Admin URLs

```
Login Page:           /admin/login
Orders:              /admin/orders
Deliveries:          /admin/deliveries
Tracking:            /admin/tracking
Advanced Panel:      /admin/delivery-panel
```

---

## 💾 What's Stored

After login:
```javascript
localStorage.adminToken          // Your session token
localStorage.rememberedEmail     // Your email (if checked)
```

On logout: Both are cleared ✓

---

## 🎓 Demo Account Details

The demo account lets you safely test:

```
Email:    admin@stonesland.com
Password: AdminPassword123!
```

Same as default account. Use it to:
- Test all features
- Learn the interface
- Create test data
- No real data affected

---

## 🚀 Next Steps

1. ✅ Start server: `npm run dev`
2. ✅ Go to `/admin/login`
3. ✅ Click "Try Demo Login"
4. ✅ Explore admin dashboard
5. ✅ Manage orders, deliveries, tracking

---

## 📞 Need Help?

See full documentation: `LOGIN_SYSTEM_GUIDE.md`

Quick answers:
- **Can't login?** Check credentials match .env.local
- **Locked out?** Wait 15 min or clear localStorage
- **Forgot password?** Contact admin (feature coming soon)
- **More questions?** See LOGIN_SYSTEM_GUIDE.md

---

**Login system ready!** 🔑

Visit: **http://localhost:3000/admin/login**
