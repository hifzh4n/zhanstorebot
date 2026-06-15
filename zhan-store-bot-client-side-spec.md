# Zhan Store Bot — Client Side Development Specification

## 1. Project Overview

**Project Name:** Zhan Store Bot  
**Platform:** Telegram Bot  
**Language:** English  
**Currency:** RM / MYR  
**Main Purpose:** Sell voucher-based products through Telegram using phone number + OTP flow.

The system allows users to:

1. Start the Telegram bot.
2. View available voucher products.
3. Select a product.
4. Read product details.
5. Proceed to payment.
6. Scan DuitNow QR.
7. Upload payment proof.
8. Wait for admin approval.
9. Receive phone number after approval.
10. Use the phone number inside the selected app.
11. Click **Check OTP**.
12. Receive OTP from the bot.
13. Complete the order, or let the system auto-complete after 10 minutes.

---

## 2. Version 1 Scope

This document focuses on the **client-side bot flow first**.

Version 1 includes:

- Telegram user flow
- Product selection
- Payment QR display
- Payment proof upload
- Admin notification on Telegram
- Waiting for admin approval
- Mock SMS provider for development
- Phone number delivery
- OTP checking
- OTP cooldown and attempt limit
- Auto-complete order logic
- Firebase database/storage structure

Version 1 does **not** include full admin panel implementation yet, but the client-side flow must be ready to connect with the admin panel later.

---

## 3. Confirmed Requirements

### 3.1 Bot

```txt
Bot Name: Zhan Store Bot
Bot Language: English
Admin Contact: @tauhusoya
```

### 3.2 Products

Only 2 products for now:

```txt
1. ZUS Coffee Buy 1 Free 1 Voucher
   Price: RM 2.50

2. Tealive Buy 1 Free 1 Voucher
   Price: RM 2.50
```

### 3.3 Product Availability

There is **no stock count** in Version 1.

Products are available unless:

```txt
1. Admin disables the product
2. smscode.gg API balance/credit is empty
3. smscode.gg service has an error
```

### 3.4 Payment

```txt
Payment Method: DuitNow QR
QR Image: Same QR for all products
QR Storage: Firebase Storage
Payment Proof: Image or document
```

Allowed upload types:

```txt
Images: JPG, JPEG, PNG
Documents: PDF
```

### 3.5 Admin

```txt
Admin Count: 1
Admin Contact: @tauhusoya
Admin Login: Email + password later using Firebase Auth
Payment Decision: Approve / Reject
Reject Reason: Required
```

### 3.6 OTP

```txt
Country: Malaysia only
Services: Tealive, Zus Coffee
OTP Check: User manually clicks Check OTP
Max OTP Check Attempts: 10
OTP Cooldown: 15 seconds
Auto Complete: 10 minutes after OTP is sent
Development Mock OTP: Appears immediately
```

---

## 4. Final Tech Stack

```txt
Telegram Bot:
Node.js + TypeScript + grammY

Backend:
Firebase Cloud Functions

Database:
Cloud Firestore

Authentication:
Firebase Authentication

Storage:
Firebase Storage

Admin Panel Later:
Next.js + TypeScript + shadcn/ui + Tailwind CSS

Admin Hosting Later:
Vercel or Firebase Hosting

OTP Provider:
smscode.gg

Development Testing:
Mock SMS Provider
```

---

## 5. Firebase Services Used

### 5.1 Firebase Cloud Functions

Used for:

```txt
- Telegram webhook
- Bot command handling
- Product selection
- Order creation
- Payment proof processing
- Admin notification
- Admin approve/reject API later
- smscode.gg API calls
- Mock SMS provider
- OTP checking
- Auto-complete logic
```

### 5.2 Cloud Firestore

Used for:

```txt
- Users
- Products
- Orders
- Payment proofs
- Settings
- Logs
```

### 5.3 Firebase Storage

Used for:

```txt
- DuitNow QR image
- Product images
- Payment proof files
```

### 5.4 Firebase Authentication

Used later for:

```txt
- Admin email/password login
```

---

## 6. High-Level Architecture

```txt
Telegram User
   ↓
Zhan Store Bot
   ↓
Firebase Cloud Functions
   ↓
Cloud Firestore
   ↓
Firebase Storage
   ↓
smscode.gg API / Mock SMS Provider
   ↓
Telegram Bot Response
```

Admin flow later:

```txt
User uploads proof
   ↓
Bot notifies admin on Telegram
   ↓
Admin opens admin panel
   ↓
Admin approves / rejects
   ↓
Cloud Function continues order flow
```

---

## 7. Full User Flow

### 7.1 Start Bot

User sends:

```txt
/start
```

Bot replies:

```txt
Welcome to Zhan Store Bot 👋

Please choose a voucher below:
```

Buttons:

```txt
[ZUS Coffee Buy 1 Free 1 Voucher]
[Tealive Buy 1 Free 1 Voucher]
[Contact Admin]
```

---

### 7.2 Product Selection

When user selects product, bot shows product details.

Example for ZUS Coffee:

```txt
ZUS Coffee Buy 1 Free 1 Voucher

Price: RM 2.50

How it works:
1. Make payment using DuitNow QR.
2. Upload your payment proof.
3. Admin will verify your payment.
4. After approval, you will receive a Malaysia phone number.
5. Use the phone number in the ZUS Coffee app.
6. Request OTP in the app.
7. Click Check OTP here.
8. Bot will send the OTP once received.

Click below to proceed.
```

Buttons:

```txt
[Proceed to Payment]
[Back to Products]
[Contact Admin]
```

---

### 7.3 Proceed to Payment

When user clicks **Proceed to Payment**, system creates an order in Firestore.

Order status:

```txt
WAITING_PAYMENT
```

Then bot sends DuitNow QR image.

Bot message:

```txt
Order Created ✅

Order ID: ORD-XXXXXX
Product: ZUS Coffee Buy 1 Free 1 Voucher
Amount: RM 2.50

Please scan the DuitNow QR and make payment.

After payment, upload your payment proof here as an image or PDF document.
```

Buttons:

```txt
[Cancel Order]
[Contact Admin]
```

---

### 7.4 Upload Payment Proof

User uploads image or PDF document.

Allowed:

```txt
.jpg
.jpeg
.png
.pdf
```

If file is valid:

```txt
Payment proof received ✅

Your order is now waiting for admin approval.
You will be notified once your payment has been reviewed.
```

Order status:

```txt
WAITING_ADMIN_APPROVAL
```

System uploads proof file to Firebase Storage.

System notifies admin on Telegram.

---

### 7.5 Admin Notification

Admin receives Telegram message:

```txt
New Payment Proof Received 🔔

Order ID: ORD-XXXXXX
Product: ZUS Coffee Buy 1 Free 1 Voucher
Amount: RM 2.50
User: @telegram_username

Please review this order in the admin panel.
```

Button:

```txt
[Open Admin Panel]
```

For development before admin panel exists, the button can point to placeholder URL:

```txt
https://your-domain.com/admin/orders/ORD-XXXXXX
```

---

### 7.6 Waiting for Admin Approval

While waiting, if user clicks or sends message, bot can reply:

```txt
Your payment proof is still waiting for admin approval.

Please wait for confirmation.
Need help? Contact admin: @tauhusoya
```

---

### 7.7 If Payment Approved

Admin approves later from admin panel.

After approval:

```txt
Order status = PAYMENT_APPROVED
```

System automatically requests phone number from:

```txt
smscode.gg
```

In development:

```txt
Mock SMS Provider
```

Then bot sends phone number to user.

Example:

```txt
Payment approved ✅

Your phone number is ready:

+60123456789

Use this number to register in the ZUS Coffee app.
After you request OTP in the app, click Check OTP below.
```

Buttons:

```txt
[Check OTP]
[Need Help]
```

Order status:

```txt
WAITING_OTP
```

---

### 7.8 If Payment Rejected

Admin rejects later from admin panel and enters reason.

Example rejection reason:

```txt
Payment proof unclear.
```

Bot sends:

```txt
Payment proof rejected ❌

Reason:
Payment proof unclear.

Please upload a new payment proof or contact admin.
Admin: @tauhusoya
```

Buttons:

```txt
[Upload New Proof]
[Contact Admin]
[Cancel Order]
```

Order status:

```txt
PAYMENT_REJECTED
```

---

### 7.9 Check OTP

User clicks:

```txt
Check OTP
```

Rules:

```txt
Max attempts: 10
Cooldown: 15 seconds
```

If user clicks too fast:

```txt
Please wait 15 seconds before checking OTP again.
```

If attempt exceeds limit:

```txt
You have reached the maximum OTP check attempts.

Please contact admin for help: @tauhusoya
```

Order status:

```txt
OTP_ATTEMPT_LIMIT_REACHED
```

If OTP not ready:

```txt
OTP is not received yet.

Please wait and try again.
```

If OTP received:

```txt
Your OTP is:

123456

Please use this code in the app.

This order will be automatically marked as completed after 10 minutes.
If everything is okay, you may click Complete now.
```

Buttons:

```txt
[Complete]
[Need Help]
```

Order status:

```txt
OTP_RECEIVED
```

---

### 7.10 Complete Order

If user clicks **Complete**:

```txt
Thank you ✅

Your order has been completed.
```

Order status:

```txt
COMPLETED
```

If user does nothing:

```txt
OTP_RECEIVED
→ wait 10 minutes
→ AUTO_COMPLETED
```

This is important because many users will not click Complete after getting OTP.

---

### 7.11 Need Help

If user clicks **Need Help**:

```txt
Need help?

Please contact admin directly:
@tauhusoya
```

Order status can remain the same, but system should log the action.

Optional:

```txt
supportRequested: true
```

---

## 8. Order Status List

Use these statuses:

```txt
CREATED
WAITING_PAYMENT
WAITING_PROOF
WAITING_ADMIN_APPROVAL
PAYMENT_APPROVED
PAYMENT_REJECTED
REQUESTING_NUMBER
NUMBER_READY
WAITING_OTP
OTP_RECEIVED
COMPLETED
AUTO_COMPLETED
OTP_ATTEMPT_LIMIT_REACHED
FAILED
CANCELLED
```

---

## 9. Status Flow Diagram

```txt
/start
  ↓
PRODUCT_SELECTED
  ↓
WAITING_PAYMENT
  ↓
WAITING_PROOF
  ↓
WAITING_ADMIN_APPROVAL
  ↓
 ┌──────────────────────┐
 │ Admin Approves        │
 └──────────────────────┘
  ↓
PAYMENT_APPROVED
  ↓
REQUESTING_NUMBER
  ↓
NUMBER_READY
  ↓
WAITING_OTP
  ↓
OTP_RECEIVED
  ↓
 ┌─────────────────────────────┐
 │ User clicks Complete         │
 │ OR auto-complete after 10 min│
 └─────────────────────────────┘
  ↓
COMPLETED / AUTO_COMPLETED
```

Rejected flow:

```txt
WAITING_ADMIN_APPROVAL
  ↓
PAYMENT_REJECTED
  ↓
User uploads new proof
  ↓
WAITING_ADMIN_APPROVAL
```

Error flow:

```txt
REQUESTING_NUMBER
  ↓
FAILED
  ↓
Ask user to contact @tauhusoya
```

---

## 10. Firestore Collections

### 10.1 users

Path:

```txt
users/{telegramUserId}
```

Example:

```js
{
  telegramUserId: "123456789",
  username: "hifzhan74",
  firstName: "Hifzhan",
  lastName: "Fauzi",
  languageCode: "en",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActiveAt: Timestamp
}
```

---

### 10.2 products

Path:

```txt
products/{productId}
```

Product 1:

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
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Product 2:

```js
{
  id: "tealive_b1f1",
  name: "Tealive Buy 1 Free 1 Voucher",
  brand: "Tealive",
  serviceName: "Tealive",
  price: 2.50,
  currency: "MYR",
  description: "Tealive Buy 1 Free 1 Voucher.",
  imageUrl: "",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Important:

```txt
No stock field.
No stock count.
No remaining quantity.
```

---

### 10.3 orders

Path:

```txt
orders/{orderId}
```

Example:

```js
{
  orderId: "ORD-20260614-000001",

  telegramUserId: "123456789",
  telegramUsername: "hifzhan74",
  telegramChatId: "123456789",

  productId: "zus_coffee_b1f1",
  productName: "ZUS Coffee Buy 1 Free 1 Voucher",
  brand: "ZUS Coffee",
  serviceName: "Zus Coffee",

  price: 2.50,
  currency: "MYR",

  status: "WAITING_ADMIN_APPROVAL",

  paymentMethod: "DUITNOW_QR",
  paymentProofUrl: "https://...",
  paymentProofStoragePath: "payment-proofs/ORD-20260614-000001/proof.jpg",
  paymentProofFileType: "image/jpeg",
  paymentUploadedAt: Timestamp,

  rejectionReason: null,
  rejectedAt: null,
  rejectedBy: null,

  approvedAt: null,
  approvedBy: null,

  smsProvider: "mock",
  smsOrderId: null,
  phoneNumber: null,
  otpCode: null,

  otpAttempts: 0,
  lastOtpCheckAt: null,
  otpReceivedAt: null,

  autoCompleteAt: null,
  completedAt: null,
  cancelledAt: null,

  errorMessage: null,

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 10.4 paymentProofs

Path:

```txt
paymentProofs/{proofId}
```

Example:

```js
{
  proofId: "PROOF-XXXXXX",
  orderId: "ORD-20260614-000001",
  telegramUserId: "123456789",

  fileUrl: "https://...",
  storagePath: "payment-proofs/ORD-20260614-000001/proof.jpg",
  fileType: "image/jpeg",
  fileName: "proof.jpg",
  fileSize: 123456,

  uploadedAt: Timestamp
}
```

---

### 10.5 settings

Path:

```txt
settings/app
```

Example:

```js
{
  botName: "Zhan Store Bot",
  currency: "MYR",

  adminTelegramUsername: "@tauhusoya",
  adminTelegramChatId: "",

  duitNowQrUrl: "",
  duitNowQrStoragePath: "qr/duitnow-qr.png",

  smsProvider: "mock",
  mockPhoneNumber: "+60123456789",
  mockOtp: "123456",

  otpCooldownSeconds: 15,
  otpMaxAttempts: 10,
  autoCompleteMinutes: 10,

  isMaintenanceMode: false,

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 10.6 adminLogs

Path:

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

---

## 11. Firebase Storage Structure

Use these folders:

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

Example:

```txt
payment-proofs/ORD-20260614-000001/proof.jpg
```

---

## 12. Environment Variables

### 12.1 Development

```env
NODE_ENV=development

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=your_random_webhook_secret

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_project_id.appspot.com

ADMIN_TELEGRAM_USERNAME=@tauhusoya
ADMIN_TELEGRAM_CHAT_ID=your_admin_chat_id

SMS_PROVIDER=mock
MOCK_PHONE_NUMBER=+60123456789
MOCK_OTP=123456

OTP_COOLDOWN_SECONDS=15
OTP_MAX_ATTEMPTS=10
AUTO_COMPLETE_MINUTES=10

ADMIN_PANEL_URL=http://localhost:3000
```

### 12.2 Production Later

```env
NODE_ENV=production

TELEGRAM_BOT_TOKEN=your_real_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=your_random_webhook_secret

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_project_id.appspot.com

ADMIN_TELEGRAM_USERNAME=@tauhusoya
ADMIN_TELEGRAM_CHAT_ID=your_admin_chat_id

SMS_PROVIDER=smscode
SMSCODE_API_KEY=your_smscode_api_key
SMSCODE_COUNTRY=malaysia

OTP_COOLDOWN_SECONDS=15
OTP_MAX_ATTEMPTS=10
AUTO_COMPLETE_MINUTES=10

ADMIN_PANEL_URL=https://your-admin-domain.com
```

Important:

```txt
Never hardcode bot token or API key inside source code.
Use Firebase environment config or Secret Manager.
```

---

## 13. Project Folder Structure

Recommended structure:

```txt
zhan-store-bot/
├── functions/
│   ├── src/
│   │   ├── index.ts
│   │   ├── bot.ts
│   │   ├── firebase.ts
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── constants/
│   │   │   ├── products.ts
│   │   │   ├── statuses.ts
│   │   │   └── messages.ts
│   │   ├── handlers/
│   │   │   ├── start.handler.ts
│   │   │   ├── product.handler.ts
│   │   │   ├── payment.handler.ts
│   │   │   ├── proof.handler.ts
│   │   │   ├── otp.handler.ts
│   │   │   ├── complete.handler.ts
│   │   │   └── contact.handler.ts
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── payment-proof.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── admin-notification.service.ts
│   │   │   ├── sms-provider.interface.ts
│   │   │   ├── mock-sms.service.ts
│   │   │   └── smscode.service.ts
│   │   ├── keyboards/
│   │   │   ├── product.keyboard.ts
│   │   │   ├── payment.keyboard.ts
│   │   │   ├── otp.keyboard.ts
│   │   │   └── common.keyboard.ts
│   │   ├── utils/
│   │   │   ├── order-id.ts
│   │   │   ├── currency.ts
│   │   │   ├── date.ts
│   │   │   ├── file-validation.ts
│   │   │   └── errors.ts
│   │   └── types/
│   │       ├── user.ts
│   │       ├── product.ts
│   │       ├── order.ts
│   │       └── sms.ts
│   ├── package.json
│   └── tsconfig.json
├── admin/
│   └── later
├── firebase.json
├── .firebaserc
└── README.md
```

---

## 14. Callback Data Naming

Use clear callback data for buttons.

```txt
product:zus_coffee_b1f1
product:tealive_b1f1

payment:proceed:{orderId}
order:cancel:{orderId}

otp:check:{orderId}
order:complete:{orderId}
order:help:{orderId}

nav:products
nav:start
```

Examples:

```txt
product:zus_coffee_b1f1
otp:check:ORD-20260614-000001
```

---

## 15. Bot Commands

Set these Telegram commands:

```txt
/start - Start the bot
/products - View voucher products
/orders - View current order status
/help - Contact admin
```

Optional later:

```txt
/cancel - Cancel current order
```

---

## 16. Bot Message Templates

### 16.1 Welcome Message

```txt
Welcome to Zhan Store Bot 👋

Choose your voucher below:
```

---

### 16.2 Product Detail Message

```txt
{productName}

Price: RM {price}

How it works:
1. Make payment using DuitNow QR.
2. Upload your payment proof.
3. Admin will verify your payment.
4. After approval, you will receive a Malaysia phone number.
5. Use the phone number in the {brand} app.
6. Request OTP in the app.
7. Click Check OTP here.
8. Bot will send the OTP once received.

Click below to proceed.
```

---

### 16.3 Payment Message

```txt
Order Created ✅

Order ID: {orderId}
Product: {productName}
Amount: RM {price}

Please scan the DuitNow QR and make payment.

After payment, upload your payment proof here as an image or PDF document.
```

---

### 16.4 Proof Received Message

```txt
Payment proof received ✅

Your order is now waiting for admin approval.
You will be notified once your payment has been reviewed.
```

---

### 16.5 Admin Notification Message

```txt
New Payment Proof Received 🔔

Order ID: {orderId}
Product: {productName}
Amount: RM {price}
User: @{telegramUsername}

Please review this order in the admin panel.
```

---

### 16.6 Payment Approved Message

```txt
Payment approved ✅

Your phone number is ready:

{phoneNumber}

Use this number to register in the {brand} app.
After you request OTP in the app, click Check OTP below.
```

---

### 16.7 Payment Rejected Message

```txt
Payment proof rejected ❌

Reason:
{rejectionReason}

Please upload a new payment proof or contact admin.
Admin: @tauhusoya
```

---

### 16.8 OTP Received Message

```txt
Your OTP is:

{otpCode}

Please use this code in the app.

This order will be automatically marked as completed after 10 minutes.
If everything is okay, you may click Complete now.
```

---

### 16.9 Complete Message

```txt
Thank you ✅

Your order has been completed.
```

---

### 16.10 Error Message

```txt
Sorry, something went wrong while processing your order.

Please contact admin for help:
@tauhusoya
```

---

## 17. Mock SMS Provider

During development, do not use smscode.gg balance.

Use:

```env
SMS_PROVIDER=mock
```

### 17.1 Mock Phone Number

```txt
+60123456789
```

### 17.2 Mock OTP

```txt
123456
```

### 17.3 Mock Behavior

When admin approves payment:

```txt
System gives fake Malaysia phone number immediately.
```

When user clicks Check OTP:

```txt
System gives OTP immediately.
```

This allows full flow testing without using real API credit.

---

## 18. SMS Provider Interface

Create one common interface so mock and real provider can be swapped easily.

```ts
export interface SmsProvider {
  requestNumber(params: {
    serviceName: string;
    country: "malaysia";
    orderId: string;
  }): Promise<{
    success: boolean;
    smsOrderId?: string;
    phoneNumber?: string;
    errorMessage?: string;
  }>;

  getOtp(params: {
    smsOrderId: string;
    orderId: string;
  }): Promise<{
    success: boolean;
    otpCode?: string;
    isReady: boolean;
    errorMessage?: string;
  }>;
}
```

---

## 19. OTP Cooldown Logic

Rules:

```txt
Max attempts: 10
Cooldown: 15 seconds
```

When user clicks Check OTP:

1. Get order.
2. Check order status is `WAITING_OTP`.
3. Check `otpAttempts < 10`.
4. Check `lastOtpCheckAt`.
5. If last check was less than 15 seconds ago, reject.
6. If okay, increment `otpAttempts`.
7. Call SMS provider.
8. If OTP ready, save OTP and update status to `OTP_RECEIVED`.

Pseudo logic:

```txt
if order.otpAttempts >= 10:
    show max attempt message

if now - lastOtpCheckAt < 15 seconds:
    show cooldown message

increment otpAttempts
call sms provider

if otp received:
    save otp
    status = OTP_RECEIVED
    autoCompleteAt = now + 10 minutes
else:
    show not ready message
```

---

## 20. Auto Complete Logic

After OTP is sent:

```txt
status = OTP_RECEIVED
autoCompleteAt = now + 10 minutes
```

Use scheduled Cloud Function:

```txt
Every 1 minute:
- Find orders where status == OTP_RECEIVED
- autoCompleteAt <= now
- Update status to AUTO_COMPLETED
```

This prevents stuck orders.

---

## 21. Product Availability Logic

No stock count.

Before allowing payment:

```txt
Check product.isActive == true
Check app is not in maintenance mode
Optional later: check smscode.gg API balance
```

If unavailable:

```txt
Sorry, this product is temporarily unavailable.

Please contact admin:
@tauhusoya
```

For development, skip real API balance check.

---

## 22. Payment Proof Validation

Allowed file types:

```txt
image/jpeg
image/jpg
image/png
application/pdf
```

Maximum file size suggestion:

```txt
5 MB
```

If invalid:

```txt
Invalid file type.

Please upload payment proof as an image or PDF document.
```

If too large:

```txt
File is too large.

Please upload a file below 5 MB.
```

---

## 23. Security Rules Concept

### 23.1 Firestore

Client users should not directly access Firestore.

Because Telegram users interact through bot only:

```txt
All Firestore reads/writes happen through Firebase Cloud Functions.
```

Admin panel later should use Firebase Auth and security rules.

### 23.2 Storage

Payment proof upload should be handled by Cloud Functions.

Do not allow public unauthenticated direct writes to Storage.

### 23.3 Secrets

Never expose:

```txt
TELEGRAM_BOT_TOKEN
SMSCODE_API_KEY
Firebase Admin SDK credentials
```

Use Firebase environment variables or Secret Manager.

---

## 24. Development Setup Plan

### Step 1: Create Firebase Project

Create Firebase project:

```txt
zhan-store-bot
```

Enable:

```txt
Cloud Firestore
Firebase Storage
Firebase Authentication
Cloud Functions
```

---

### Step 2: Create Telegram Bot

Use BotFather:

```txt
/newbot
```

Bot name:

```txt
Zhan Store Bot
```

Save bot token securely.

---

### Step 3: Initialize Firebase Functions

```bash
firebase init functions
```

Choose:

```txt
TypeScript
ESLint: Yes
Install dependencies: Yes
```

---

### Step 4: Install Bot Dependencies

Inside `functions`:

```bash
npm install grammY
npm install axios
```

Optional:

```bash
npm install zod
```

---

### Step 5: Create Firestore Seed Data

Create the two product documents:

```txt
products/zus_coffee_b1f1
products/tealive_b1f1
```

---

### Step 6: Upload QR Image

Upload to Firebase Storage:

```txt
qr/duitnow-qr.png
```

Then save URL/path in:

```txt
settings/app
```

---

### Step 7: Build Bot Flow

Build in this order:

```txt
1. /start
2. Product list
3. Product details
4. Create order
5. Show QR
6. Accept payment proof
7. Notify admin
8. Simulate admin approval
9. Generate mock phone number
10. Check OTP
11. Auto complete
```

---

## 25. Development Implementation Order

### Phase 1: Basic Bot

```txt
- Setup Firebase Functions
- Setup grammY bot
- Create webhook endpoint
- Add /start command
- Add product buttons
```

### Phase 2: Product Flow

```txt
- Create products collection
- Fetch active products
- Show product details
- Add Proceed to Payment button
```

### Phase 3: Order Creation

```txt
- Generate order ID
- Create order document
- Save user info
- Save selected product
- Set status WAITING_PAYMENT
```

### Phase 4: Payment Flow

```txt
- Send DuitNow QR image
- Ask user to upload proof
- Validate image/PDF
- Upload proof to Firebase Storage
- Update order status WAITING_ADMIN_APPROVAL
```

### Phase 5: Admin Notification

```txt
- Send Telegram message to admin
- Include order details
- Include admin panel URL placeholder
```

### Phase 6: Mock Approval

Before admin panel exists, create temporary dev command:

```txt
/dev_approve ORD-XXXXXX
/dev_reject ORD-XXXXXX reason
```

Only admin chat ID can use this.

Later remove or protect this command.

### Phase 7: Mock SMS

```txt
- Add SmsProvider interface
- Add MockSmsService
- Return +60123456789
- Return OTP 123456
```

### Phase 8: OTP Flow

```txt
- Add Check OTP button
- Add cooldown
- Add max attempts
- Save OTP
- Send OTP to user
```

### Phase 9: Auto Complete

```txt
- Add autoCompleteAt
- Add scheduled function
- Auto-complete OTP_RECEIVED orders after 10 minutes
```

---

## 26. Temporary Development Admin Commands

Because full admin panel is not built yet, add these temporary commands:

```txt
/dev_approve ORDER_ID
/dev_reject ORDER_ID reason
```

Example:

```txt
/dev_approve ORD-20260614-000001
```

```txt
/dev_reject ORD-20260614-000001 Payment proof unclear
```

Only allow if sender Telegram chat ID equals:

```txt
ADMIN_TELEGRAM_CHAT_ID
```

This lets client flow be tested fully before admin panel is ready.

---

## 27. Important Edge Cases

Handle these cases:

```txt
1. User sends /start again during active order
2. User selects another product while order is waiting
3. User uploads proof without active order
4. User uploads wrong file type
5. User uploads proof after order is cancelled
6. Admin rejects payment
7. User uploads new proof after rejection
8. Phone number request fails
9. OTP check cooldown
10. OTP max attempts reached
11. OTP received but user does not click Complete
12. User clicks Complete twice
13. User clicks Check OTP after order already completed
```

---

## 28. Recommended Active Order Rule

One user should only have one active order at a time.

Active statuses:

```txt
WAITING_PAYMENT
WAITING_PROOF
WAITING_ADMIN_APPROVAL
PAYMENT_APPROVED
REQUESTING_NUMBER
NUMBER_READY
WAITING_OTP
OTP_RECEIVED
```

If user starts again while active order exists:

```txt
You already have an active order.

Order ID: {orderId}
Status: {status}

Please complete or cancel this order first.
```

Buttons:

```txt
[View Order]
[Cancel Order]
[Contact Admin]
```

---

## 29. Cancel Order Rule

User can cancel only before payment proof approval.

Allowed cancel statuses:

```txt
WAITING_PAYMENT
WAITING_PROOF
PAYMENT_REJECTED
```

Not allowed after:

```txt
WAITING_ADMIN_APPROVAL
PAYMENT_APPROVED
WAITING_OTP
OTP_RECEIVED
COMPLETED
AUTO_COMPLETED
```

If not allowed:

```txt
This order cannot be cancelled at this stage.

Please contact admin:
@tauhusoya
```

---

## 30. Logging

Log important actions:

```txt
USER_STARTED_BOT
PRODUCT_SELECTED
ORDER_CREATED
PAYMENT_PROOF_UPLOADED
ADMIN_NOTIFIED
PAYMENT_APPROVED
PAYMENT_REJECTED
PHONE_NUMBER_REQUESTED
PHONE_NUMBER_RECEIVED
OTP_CHECKED
OTP_RECEIVED
ORDER_COMPLETED
ORDER_AUTO_COMPLETED
ORDER_CANCELLED
ERROR_OCCURRED
```

Logs can be stored in:

```txt
orders/{orderId}/logs/{logId}
```

or global:

```txt
adminLogs/{logId}
```

For Version 1, order subcollection is cleaner.

---

## 31. Suggested Order Subcollection Logs

Path:

```txt
orders/{orderId}/logs/{logId}
```

Example:

```js
{
  action: "PAYMENT_PROOF_UPLOADED",
  message: "User uploaded payment proof",
  createdAt: Timestamp,
  metadata: {
    fileType: "image/jpeg"
  }
}
```

---

## 32. Acceptance Criteria

The client-side bot is complete when:

```txt
1. User can start bot
2. User can view products
3. User can view product details
4. User can proceed to payment
5. Bot shows DuitNow QR
6. User can upload payment proof
7. Payment proof is saved to Firebase Storage
8. Order is saved in Firestore
9. Admin receives Telegram notification
10. Admin can approve/reject using temporary dev command
11. Approved order generates mock phone number
12. User receives phone number
13. User can click Check OTP
14. OTP cooldown works
15. OTP max attempt limit works
16. Mock OTP is sent immediately
17. Order becomes OTP_RECEIVED
18. User can click Complete
19. Order can auto-complete after 10 minutes
20. User can contact admin
```

---

## 33. Final Client-Side Version 1 Summary

Build this first:

```txt
/start
→ Product list
→ Product details
→ Proceed to payment
→ Show DuitNow QR
→ Upload payment proof
→ Notify admin
→ Temporary admin approve/reject
→ Mock phone number
→ Check OTP
→ Mock OTP
→ Complete / auto-complete
```

Do not build these yet:

```txt
Full admin dashboard
Real smscode.gg balance check
Real payment gateway
Stock system
Multi-admin system
Malay localization
Advanced analytics
```

---

## 34. Notes for Future Version

Later improvements:

```txt
1. Full admin dashboard
2. Firebase Auth admin login
3. Real smscode.gg integration
4. API balance checker
5. Admin product management
6. Product active/inactive toggle
7. Order search/filter
8. Support ticket system
9. Sales report
10. Telegram broadcast to users
11. Malay language support
12. Payment gateway integration
```

---

# End of Specification

This document is the full client-side development guide for **Zhan Store Bot Version 1**.
