// routes/vendor/vendorRoutes.js
const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");
const permitRoles = require("../../middleware/roleMiddleware");

const router = express.Router();

// ✅ Vendor dashboard route only
router.get("/dashboard", verifyToken, permitRoles("vendor"), (req, res) => {
  res.json({ message: "Vendor Dashboard Access Granted" });
});

module.exports = router;
