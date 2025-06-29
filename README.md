# 🛒 Multivendor Shop Backend

This is the backend of a full-stack multivendor e-commerce platform built using **Express.js**, **MongoDB**, and **Stripe**. It handles authentication, vendor management, product listings, order processing, payments, and admin moderation.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based login/register system
- Role-based access: `customer`, `vendor`, `admin`
- Protected routes for each role

### 🛍 Vendor Dashboard
- Create, update, delete products
- Upload product images via **Cloudinary**
- View vendor-specific orders
- Earnings tracking

### 🛒 Customer Experience
- Browse products with category & search filters
- Add items to cart (stored in frontend context/localStorage)
- Checkout flow with Stripe payment
- Submit/edit/delete product reviews
- View past orders

### 🧑‍💼 Admin Panel
- Approve or reject vendor requests
- Moderate product listings
- View all orders and users

---

## 🧰 Technologies Used

| Tech              | Purpose                                  |
|-------------------|-------------------------------------------|
| **Express.js**    | Server framework                          |
| **MongoDB + Mongoose** | Database + ODM                          |
| **jsonwebtoken**  | JWT-based session management              |
| **bcryptjs**      | Password hashing                          |
| **multer**        | File upload handling                      |
| **cloudinary**    | Hosting uploaded product images           |
| **nodemailer**    | Sending transactional emails              |
| **stripe**        | Payment gateway        |
| **cookie-parser**, **cors**, **dotenv** | Server utilities       |

---

## 📁 Folder Structure


---
Multivendor_Shop_Backend/
│
├── controllers/ # All business logic
├── models/ # Mongoose schemas
├── middlewares/ # Auth, error handlers
├── routes/ # REST API endpoints
├── utils/ # Cloudinary config, email helper, validators
├── config/ # Stripe & Cloudinary setup
├── .env #  environment variables
├── server.js # App entry point
└── README.md # You're here!
## ⚙️ Environment Variables

Create a `.env` file in the root with:
PORT=5000
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password

CLIENT_URL=http://localhost:5173

---

## 🔌 API Endpoints Overview

### 🔑 Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### 👨‍🍳 Vendor
- `POST /api/vendor/products`
- `GET /api/vendor/products`
- `GET /api/vendor/orders`
- `GET /api/vendor/earnings`

### 🛍 Products
- `GET /api/products/public`
- `GET /api/products/:id`
- `GET /api/products/search`

### 📦 Orders
- `POST /api/orders/checkout-session` (Stripe)
- `POST /api/orders` (after payment)
- `GET /api/orders/customer`
- `GET /api/orders/:id`

### ⭐ Reviews
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `GET /api/reviews/public`

### 🧑‍💼 Admin
- `GET /api/admin/vendors`
- `GET /api/admin/products`
- `GET /api/admin/orders`

---
## 📬 Nodemailer Integration

We use `nodemailer` to send verification emails during user registration.

### 📌 Use Cases

- ✅ Sends a verification email with a secure activation link after user signup.
- 📥 Ensures only valid email addresses can register.


---

## ☁️ Cloudinary Integration

- Product images are uploaded and stored via **Cloudinary**
- Accessible URLs are saved in the DB

---

## 💳 Stripe Payment Integration

- Checkout powered by **Stripe Checkout**
- Webhooks listen for payment success

To test webhooks locally:

```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
📦 Scripts

# Start in development mode
npm run dev

# Start in production mode
npm start

