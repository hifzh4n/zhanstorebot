# Zhan Store Bot — Admin Panel Development Specification

## 1. Project Overview

**Project Name:** Zhan Store Bot  
**Admin Panel Type:** Web Admin Dashboard  
**Purpose:** Allow the admin to manage orders, approve/reject payment proofs, view order status, manage products, upload images/QR, and configure basic bot settings.

This admin panel is built for **1 admin only** for Version 1.

---

## 2. Confirmed Admin Requirements

```txt
Admin Count: 1 admin only
Admin Login: Email + password
Auth Provider: Firebase Authentication
Database: Cloud Firestore
Storage: Firebase Storage
UI: Next.js + shadcn/ui + Tailwind CSS
Theme: Light mode + Dark mode
Admin Telegram: @tauhusoya
```

The admin panel should allow admin to:

```txt
1. Login using email and password
2. View dashboard summary
3. View incoming orders
4. Open order details
5. View uploaded payment proof
6. Approve payment
7. Reject payment with reason
8. View customer Telegram information
9. View order status
10. Manage products
11. Upload product images
12. Upload DuitNow QR image
13. View basic settings
14. Logout
```

---

## 3. Final Admin Tech Stack

```txt
Framework: Next.js
Language: TypeScript
Styling: Tailwind CSS
UI Component: shadcn/ui
Authentication: Firebase Authentication
Database: Cloud Firestore
Storage: Firebase Storage
Hosting: Vercel recommended or Firebase Hosting
Icons: lucide-react
Toast: sonner
Forms: react-hook-form + zod
Theme: next-themes
```

Recommended packages:

```bash
npm install firebase lucide-react sonner next-themes
npm install react-hook-form zod @hookform/resolvers
```

---

## 4. Admin Panel Goals

The admin panel should be simple, clean, and focused.

Main flow:

```txt
User uploads payment proof
→ Admin receives Telegram notification
→ Admin opens admin panel
→ Admin checks proof
→ Admin approves or rejects
→ System continues bot flow
```

---

## 5. Admin Panel Route Structure

```txt
/login
/admin/dashboard
/admin/orders
/admin/orders/[orderId]
/admin/products
/admin/settings
/admin/profile
```

Optional later:

```txt
/admin/reports
/admin/logs
/admin/support
```

---

## 6. Page Details

## 6.1 Login Page

Route:

```txt
/login
```

Purpose:

```txt
Allow admin to login using email and password.
```

Fields:

```txt
Email
Password
```

Button:

```txt
Login
```

Validation:

```txt
Email is required
Password is required
Invalid email format
Wrong email/password error
```

After login:

```txt
Redirect to /admin/dashboard
```

UI suggestion:

```txt
Centered card
Bot name at top
Clean shadcn form
```

---

## 6.2 Dashboard Page

Route:

```txt
/admin/dashboard
```

Purpose:

```txt
Show quick system summary.
```

Cards:

```txt
Pending Approval
Approved Today
Rejected Today
Completed Today
Failed Orders
Total Orders
```

Sections:

```txt
Recent Orders
Quick Actions
System Status
```

Quick actions:

```txt
View Pending Orders
Manage Products
Update QR Code
```

System status:

```txt
SMS Provider: Mock / smscode.gg
Bot Status: Active
Maintenance Mode: Off
```

---

## 6.3 Orders Page

Route:

```txt
/admin/orders
```

Purpose:

```txt
View and filter all orders.
```

Table columns:

```txt
Order ID
User
Product
Amount
Status
Created At
Action
```

Filters:

```txt
All
Waiting Approval
Approved
Rejected
Waiting OTP
OTP Received
Completed
Failed
Cancelled
```

Search:

```txt
Search by Order ID
Search by Telegram username
```

Default sorting:

```txt
Newest first
```

Status badge idea:

```txt
WAITING_ADMIN_APPROVAL - Yellow
PAYMENT_APPROVED - Blue
PAYMENT_REJECTED - Red
WAITING_OTP - Purple
OTP_RECEIVED - Indigo
COMPLETED - Green
AUTO_COMPLETED - Green
FAILED - Red
CANCELLED - Gray
```

---

## 6.4 Order Details Page

Route:

```txt
/admin/orders/[orderId]
```

Purpose:

```txt
Review payment proof and approve/reject order.
```

Sections:

```txt
1. Order Summary
2. Customer Info
3. Payment Proof
4. OTP / Phone Number Info
5. Status Timeline
6. Admin Actions
```

### Order Summary

Show:

```txt
Order ID
Product Name
Brand
Amount
Currency
Status
Created At
Updated At
```

### Customer Info

Show:

```txt
Telegram User ID
Telegram Username
Telegram Chat ID
First Name
Last Active
```

### Payment Proof

If image:

```txt
Show image preview
Open in new tab
Download proof
```

If PDF:

```txt
Show PDF card/icon
Open in new tab
Download proof
```

### OTP / Phone Info

Show after approval:

```txt
SMS Provider
SMS Order ID
Phone Number
OTP Code
OTP Attempts
Last OTP Check
Auto Complete At
```

### Admin Actions

If status is:

```txt
WAITING_ADMIN_APPROVAL
```

Show:

```txt
Approve Payment
Reject Payment
```

Reject modal fields:

```txt
Reason textarea
Cancel button
Reject Order button
```

Reject reason is required.

---

## 7. Admin Approval Flow

When admin clicks **Approve Payment**:

```txt
1. Verify admin
2. Check order exists
3. Check order status is WAITING_ADMIN_APPROVAL
4. Update order status to PAYMENT_APPROVED
5. Save approvedAt
6. Save approvedBy
7. Create admin log
8. Request phone number from SMS provider
9. Update order to WAITING_OTP
10. Send Telegram message to user
```

Recommended order update:

```js
{
  status: "PAYMENT_APPROVED",
  approvedAt: Timestamp,
  approvedBy: adminUid,
  updatedAt: Timestamp
}
```

After approve, backend continues:

```txt
PAYMENT_APPROVED
→ REQUESTING_NUMBER
→ NUMBER_READY
→ WAITING_OTP
```

User receives:

```txt
Payment approved ✅

Your phone number is ready:

+60123456789

Use this number to register in the selected app.
After you request OTP in the app, click Check OTP below.
```

---

## 8. Admin Rejection Flow

When admin clicks **Reject Payment**:

```txt
1. Verify admin
2. Check order exists
3. Check order status is WAITING_ADMIN_APPROVAL
4. Validate rejection reason
5. Update order status to PAYMENT_REJECTED
6. Save rejection reason
7. Save rejectedAt
8. Save rejectedBy
9. Create admin log
10. Send Telegram message to user
```

Recommended order update:

```js
{
  status: "PAYMENT_REJECTED",
  rejectionReason: "Payment proof unclear",
  rejectedAt: Timestamp,
  rejectedBy: adminUid,
  updatedAt: Timestamp
}
```

User receives:

```txt
Payment proof rejected ❌

Reason:
Payment proof unclear.

Please upload a new payment proof or contact admin.
Admin: @tauhusoya
```

---

## 9. Products Page

Route:

```txt
/admin/products
```

Purpose:

```txt
View and edit product details.
```

Products for Version 1:

```txt
1. ZUS Coffee Buy 1 Free 1 Voucher
2. Tealive Buy 1 Free 1 Voucher
```

Table columns:

```txt
Image
Product Name
Brand
Price
Service Name
Status
Action
```

Admin can edit:

```txt
Product name
Description
Price
Image
Active/Inactive status
```

Important:

```txt
No stock count.
No stock field.
No product quantity.
```

Product availability is based on:

```txt
1. Product is active
2. API balance/credit is available
3. Service has no error
```

For Version 1, do not implement real API balance checker yet.

Product document example:

```js
{
  id: "zus_coffee_b1f1",
  name: "ZUS Coffee Buy 1 Free 1 Voucher",
  brand: "ZUS Coffee",
  serviceName: "Zus Coffee",
  price: 2.50,
  currency: "MYR",
  description: "ZUS Coffee Buy 1 Free 1 Voucher.",
  imageUrl: "",
  imageStoragePath: "products/zus-coffee-b1f1.png",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 10. Settings Page

Route:

```txt
/admin/settings
```

Purpose:

```txt
Manage app and bot settings.
```

Sections:

```txt
1. Bot Settings
2. Payment Settings
3. OTP Settings
4. Admin Contact
5. Maintenance Mode
```

### Bot Settings

Fields:

```txt
Bot Name
Currency
SMS Provider
```

Example:

```txt
Bot Name: Zhan Store Bot
Currency: MYR
SMS Provider: mock
```

### Payment Settings

Fields:

```txt
DuitNow QR Image
DuitNow QR Storage Path
```

Admin can upload/replace QR image.

Storage path:

```txt
qr/duitnow-qr.png
```

### OTP Settings

Fields:

```txt
OTP Cooldown Seconds: 15
OTP Max Attempts: 10
Auto Complete Minutes: 10
Mock Phone Number: +60123456789
Mock OTP: 123456
```

### Admin Contact

Fields:

```txt
Admin Telegram Username: @tauhusoya
Admin Telegram Chat ID
```

### Maintenance Mode

Field:

```txt
isMaintenanceMode: true / false
```

If maintenance mode is on, bot should not allow new orders.

Bot message:

```txt
Zhan Store Bot is currently under maintenance.

Please try again later.
```

---

## 11. Profile Page

Route:

```txt
/admin/profile
```

Purpose:

```txt
Show current admin account.
```

Show:

```txt
Admin Email
Admin UID
Last Login
```

Actions:

```txt
Logout
```

Optional later:

```txt
Change password
```

---

## 12. Firebase Auth Setup

Use Firebase Authentication with email/password.

Create admin manually:

```txt
Firebase Console
→ Authentication
→ Users
→ Add user
```

Example:

```txt
Email: your email
Password: your password
```

After creating admin, copy the admin UID.

Save admin in Firestore:

```txt
adminUsers/{uid}
```

Example:

```js
{
  uid: "firebase_auth_uid",
  email: "admin@example.com",
  role: "admin",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 13. Firebase Collections

Admin panel uses:

```txt
users
products
orders
paymentProofs
settings
adminUsers
adminLogs
```

Optional later:

```txt
supportTickets
smsRequests
otpLogs
notifications
```

---

## 14. Firebase Storage Paths

```txt
qr/
  duitnow-qr.png

products/
  zus-coffee-b1f1.png
  tealive-b1f1.png

payment-proofs/
  {orderId}/
    proof.jpg
    proof.pdf
```

---

## 15. Admin Panel Project Structure

```txt
zhan-store-admin/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       ├── orders/
│       │   ├── page.tsx
│       │   └── [orderId]/
│       │       └── page.tsx
│       ├── products/
│       │   └── page.tsx
│       ├── settings/
│       │   └── page.tsx
│       └── profile/
│           └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-header.tsx
│   │   └── theme-toggle.tsx
│   ├── orders/
│   │   ├── orders-table.tsx
│   │   ├── order-status-badge.tsx
│   │   ├── payment-proof-preview.tsx
│   │   ├── approve-payment-dialog.tsx
│   │   └── reject-payment-dialog.tsx
│   ├── products/
│   │   ├── product-form.tsx
│   │   └── product-image-upload.tsx
│   └── settings/
│       ├── qr-upload.tsx
│       └── settings-form.tsx
├── lib/
│   ├── firebase.ts
│   ├── auth.ts
│   ├── firestore.ts
│   ├── storage.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-orders.ts
│   ├── use-products.ts
│   └── use-settings.ts
├── types/
│   ├── order.ts
│   ├── product.ts
│   ├── user.ts
│   └── settings.ts
├── middleware.ts
├── .env.local
└── package.json
```

---

## 16. Admin Navigation

Sidebar navigation:

```txt
Dashboard
Orders
Products
Settings
Profile
Logout
```

Suggested icons from `lucide-react`:

```txt
Dashboard - LayoutDashboard
Orders - ReceiptText
Products - Package
Settings - Settings
Profile - User
Logout - LogOut
```

---

## 17. Theme

Use:

```txt
next-themes
```

Requirements:

```txt
Light mode
Dark mode
System mode optional
```

Header should have:

```txt
Theme toggle
Admin email
Logout button
```

---

## 18. Admin Actions and Permissions

Admin can:

```txt
View dashboard
View all orders
Approve payment
Reject payment
Edit products
Upload product image
Upload QR image
Edit settings
Logout
```

Admin cannot in Version 1:

```txt
Create another admin
Delete orders
Delete users
Manually change OTP code
```

Optional later:

```txt
Manual retry phone number request
Manual resend OTP message
Manual mark failed
```

---

## 19. Order Action Rules

### 19.1 Approve Button

Show approve button only if:

```txt
order.status == WAITING_ADMIN_APPROVAL
```

### 19.2 Reject Button

Show reject button only if:

```txt
order.status == WAITING_ADMIN_APPROVAL
```

### 19.3 Reject Reason

Reject reason is required.

Minimum length:

```txt
5 characters
```

### 19.4 Prevent Duplicate Actions

Before approve/reject:

```txt
Check latest order status from Firestore.
If status is not WAITING_ADMIN_APPROVAL, block action.
```

---

## 20. Cloud Functions Needed for Admin Panel

Sensitive admin actions should go through Cloud Functions, not direct Firestore writes.

Required functions:

```txt
approvePayment(orderId)
rejectPayment(orderId, reason)
updateProduct(productId, data)
updateSettings(data)
```

### 20.1 approvePayment(orderId)

Does:

```txt
1. Verify Firebase Auth user
2. Verify user is admin
3. Check order exists
4. Check order status is WAITING_ADMIN_APPROVAL
5. Update order to PAYMENT_APPROVED
6. Create admin log
7. Request phone number using SMS provider
8. Update order to WAITING_OTP
9. Send Telegram message to user
```

### 20.2 rejectPayment(orderId, reason)

Does:

```txt
1. Verify Firebase Auth user
2. Verify user is admin
3. Check order exists
4. Check order status is WAITING_ADMIN_APPROVAL
5. Validate rejection reason
6. Update order to PAYMENT_REJECTED
7. Create admin log
8. Send Telegram message to user
```

### 20.3 updateProduct(productId, data)

Does:

```txt
1. Verify admin
2. Validate product fields
3. Update product document
4. Create admin log
```

### 20.4 updateSettings(data)

Does:

```txt
1. Verify admin
2. Validate settings fields
3. Update settings/app
4. Create admin log
```

---

## 21. Why Use Cloud Functions for Admin Actions?

Use Cloud Functions for sensitive actions because:

```txt
1. Prevents fake client-side updates
2. Keeps approve/reject logic centralized
3. Allows bot notification after admin action
4. Allows SMS provider logic after approval
5. Safer than direct Firestore updates
```

Direct Firestore reads are okay for display.

Sensitive writes should go through backend functions.

---

## 22. Firestore Security Rule Concept

Only authenticated admin can read admin data.

Concept:

```txt
adminUsers/{uid} controls admin access
```

Rules idea:

```txt
allow read: if request.auth != null
  && exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));

allow write: if false;
```

Sensitive writes happen through Cloud Functions using Admin SDK.

---

## 23. Storage Security Rule Concept

Admin can upload:

```txt
qr/*
products/*
```

Bot backend uploads:

```txt
payment-proofs/*
```

Admin can read:

```txt
qr/*
products/*
payment-proofs/*
```

Avoid public unauthenticated direct writes.

---

## 24. Environment Variables

Create `.env.local` in admin project.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_ADMIN_PANEL_NAME=Zhan Store Admin
NEXT_PUBLIC_CURRENCY=MYR
NEXT_PUBLIC_FUNCTIONS_REGION=asia-southeast1
```

Important:

```txt
Firebase client config can be NEXT_PUBLIC.
Do not expose Telegram bot token.
Do not expose smscode.gg API key.
```

Secrets stay in Cloud Functions only.

---

## 25. UI Design Direction

Style:

```txt
Clean
Modern
Simple
Mobile responsive
Professional
```

Suggested UI:

```txt
Rounded cards
Status badges
Simple table
Dialog modals
Dark mode support
Loading skeletons
Toast feedback
```

Color usage:

```txt
Green - approve/completed
Red - reject/failed
Yellow - pending
Blue - approved/processing
Gray - cancelled/inactive
```

---

## 26. Dashboard Layout

Desktop:

```txt
Sidebar on left
Header on top
Content area
```

Mobile:

```txt
Top header
Drawer menu
Cards stacked vertically
```

Dashboard content:

```txt
Summary cards
Recent orders table
Quick actions
```

---

## 27. Order Table Features

Version 1:

```txt
Filter by status
Search by Order ID / username
Sort by newest first
```

Optional:

```txt
Pagination
Date filter
```

---

## 28. Payment Proof Preview

If image:

```txt
Show image preview
Open in new tab
Download
```

If PDF:

```txt
Show PDF card
Open in new tab
Download
```

Accepted proof types:

```txt
image/jpeg
image/jpg
image/png
application/pdf
```

---

## 29. Product Image Upload

Admin can upload product image.

Storage paths:

```txt
products/zus-coffee-b1f1.png
products/tealive-b1f1.png
```

After upload:

```txt
Update product.imageUrl
Update product.imageStoragePath
```

Allowed types:

```txt
image/jpeg
image/png
image/webp
```

Max size:

```txt
3 MB
```

---

## 30. DuitNow QR Upload

Admin can upload or replace DuitNow QR.

Storage path:

```txt
qr/duitnow-qr.png
```

After upload:

```txt
Update settings/app.duitNowQrUrl
Update settings/app.duitNowQrStoragePath
```

Allowed types:

```txt
image/jpeg
image/png
image/webp
```

Max size:

```txt
3 MB
```

---

## 31. Validation Rules

### Product Form

```txt
Product name required
Price required
Price must be more than 0
Currency fixed as MYR
Service name required
```

### Settings Form

```txt
Bot name required
Admin Telegram username required
OTP cooldown must be more than 0
OTP max attempts must be more than 0
Auto complete minutes must be more than 0
```

### Reject Payment Form

```txt
Reason required
Minimum 5 characters
```

---

## 32. Admin Logs

Every admin action should create a log.

Collection:

```txt
adminLogs/{logId}
```

Example:

```js
{
  logId: "LOG-XXXXXX",
  action: "PAYMENT_APPROVED",
  orderId: "ORD-20260614-000001",
  adminId: "firebase_admin_uid",
  adminEmail: "admin@example.com",
  message: "Payment approved",
  createdAt: Timestamp
}
```

Actions to log:

```txt
PAYMENT_APPROVED
PAYMENT_REJECTED
PRODUCT_UPDATED
PRODUCT_IMAGE_UPDATED
QR_UPDATED
SETTINGS_UPDATED
ADMIN_LOGIN
ADMIN_LOGOUT
```

---

## 33. Error Handling

Use `sonner` toast.

Success messages:

```txt
Payment approved successfully.
Payment rejected successfully.
Product updated successfully.
QR image updated successfully.
Settings saved successfully.
```

Error messages:

```txt
Failed to approve payment.
Failed to reject payment.
Order status already changed.
You are not allowed to perform this action.
Failed to upload image.
```

---

## 34. Loading States

Every page/action needs loading state.

Examples:

```txt
Login button loading
Orders table loading skeleton
Order details loading
Approve button loading
Reject button loading
Image upload loading
Settings save loading
```

---

## 35. Empty States

Examples:

```txt
No orders found.
No pending payment approvals.
No payment proof uploaded yet.
No product image uploaded.
```

---

## 36. Development Order

Build admin panel in this order:

```txt
1. Create Next.js project
2. Install shadcn/ui
3. Setup Firebase client SDK
4. Setup Firebase Auth login
5. Create protected admin layout
6. Build dashboard page
7. Build orders table
8. Build order details page
9. Build approve/reject function calls
10. Build product page
11. Build product image upload
12. Build settings page
13. Build DuitNow QR upload
14. Add dark/light mode
15. Add logs/toasts/loading states
```

---

## 37. Setup Commands

Create project:

```bash
npx create-next-app@latest zhan-store-admin
```

Recommended choices:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
App Router: Yes
Import alias: Yes
```

Go into project:

```bash
cd zhan-store-admin
```

Install dependencies:

```bash
npm install firebase lucide-react sonner next-themes
npm install react-hook-form zod @hookform/resolvers
```

Install shadcn/ui:

```bash
npx shadcn@latest init
```

Add shadcn components:

```bash
npx shadcn@latest add button card input label textarea dialog table badge dropdown-menu sheet separator skeleton switch tabs alert
```

---

## 38. Firebase Client Setup

Create:

```txt
lib/firebase.ts
```

Example:

```ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-southeast1");
```

---

## 39. Protected Route Logic

All `/admin/*` routes require login.

If not logged in:

```txt
Redirect to /login
```

After login:

```txt
Check adminUsers/{uid}
```

If not admin:

```txt
Show unauthorized page
Logout user
```

---

## 40. Admin Layout

Admin layout should contain:

```txt
Sidebar
Header
Theme toggle
Logout button
Main content
```

Sidebar links:

```txt
Dashboard
Orders
Products
Settings
Profile
```

---

## 41. Admin Approval Function Call

From order details page, call Cloud Function:

```txt
approvePayment
```

Payload:

```js
{
  orderId: "ORD-20260614-000001"
}
```

On success:

```txt
Show toast
Refresh order data
```

---

## 42. Admin Rejection Function Call

Call Cloud Function:

```txt
rejectPayment
```

Payload:

```js
{
  orderId: "ORD-20260614-000001",
  reason: "Payment proof unclear"
}
```

On success:

```txt
Show toast
Close dialog
Refresh order data
```

---

## 43. Version 1 Must-Have Features

Admin panel is complete when:

```txt
1. Admin can login
2. Admin can logout
3. Admin cannot access dashboard without login
4. Admin can view dashboard summary
5. Admin can view all orders
6. Admin can filter pending orders
7. Admin can open order details
8. Admin can view payment proof
9. Admin can approve payment
10. Admin can reject payment with reason
11. User is notified after approve/reject
12. Approved order continues phone number flow
13. Admin can view products
14. Admin can update product active/inactive
15. Admin can upload product images
16. Admin can upload DuitNow QR
17. Admin can update settings
18. Dark/light mode works
```

---

## 44. Features Not Needed Yet

Do not build these in Version 1:

```txt
Multi-admin role system
Advanced reports
Revenue graph
Refund system
Payment gateway integration
Manual stock count
Coupon system
Malay localization
Push notifications
Full support ticket system
User management actions
```

---

## 45. Future Version Ideas

Later can add:

```txt
1. API balance checker
2. Sales analytics
3. Daily revenue report
4. Admin order notes
5. Support ticket page
6. Retry phone number request
7. Retry Telegram message
8. Export orders to CSV
9. Telegram broadcast
10. Multi-admin permissions
```

---

# End of Specification

This document is the full admin panel development guide for **Zhan Store Bot Version 1**.
