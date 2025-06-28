const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());

// ✅ Stripe webhook MUST use raw body parser BEFORE other middleware
app.use("/webhook", bodyParser.raw({ type: "application/json" }));
const webhookRoutes = require("./routes/customer/webhookRoutes");
app.use("/webhook", webhookRoutes);

// ✅ Apply JSON parsers AFTER webhook
app.use(express.json());
app.use(bodyParser.json());

// ✅ Route imports
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor/vendorRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const customerRoutes = require("./routes/customer/customerRoutes");
const vendorProductRoutes = require("./routes/vendor/productRoutes");
const vendorOrderRoutes = require("./routes/vendor/orderRoutes");
const vendorEarningRoutes = require("./routes/vendor/earningRoutes");
const vendorDashboardRoutes = require("./routes/vendor/dashboardRoutes");
const categoryRoutes = require("./routes/public/categoryRoutes");
const publicProductRoutes = require("./routes/public/productRoutes");
const publicReviewRoutes = require("./routes/public/reviewRoutes");
const customerOrderRoutes = require("./routes/customer/orderRoutes");
const customerReviewRoutes = require("./routes/customer/reviewRoutes"); // ✅ ADD THIS
const paymentRoutes = require("./routes/customer/paymentRoutes");
const adminVendorRoutes = require("./routes/admin/vendorRoutes");
const adminProductRoutes = require("./routes/admin/productRoutes");
const adminOrderRoutes = require("./routes/admin/orderRoutes");
const adminUserRoutes = require("./routes/admin/userRoutes");
const adminDashboardRoutes = require("./routes/admin/dashboardRoutes");

// ✅ Use all routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", publicReviewRoutes); // ✅ Public reviews
app.use("/api/customer/reviews", customerReviewRoutes); // ✅ Protected reviews
app.use("/api/payment", paymentRoutes);
app.use("/api/products/public", publicProductRoutes);
app.use("/api/vendor/products", vendorProductRoutes);
app.use("/api/vendor/orders", vendorOrderRoutes);
app.use("/api/vendor/earnings", vendorEarningRoutes);
app.use("/api/vendor/dashboard", vendorDashboardRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/admin/vendors", adminVendorRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Failed:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
