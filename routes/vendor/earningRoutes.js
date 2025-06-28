//routes//vendor//earningRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/authMiddleware");
const permitRoles = require("../../middleware/roleMiddleware");
const {
  getVendorEarnings,
  getVendorDetailedEarnings,
} = require("../../controllers/vendor/earningController");
// ✅ Apply auth & role middleware to all product routes
router.use(verifyToken, permitRoles("vendor"));
router.get("/", getVendorEarnings);
router.get("/details", getVendorDetailedEarnings);
module.exports = router;
