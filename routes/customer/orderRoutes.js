//coutes//customer//orderRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/authMiddleware");
const permitRoles = require("../../middleware/roleMiddleware");
const {
  getCustomerOrders,
} = require("../../controllers/customer/orderController");

router.use(verifyToken, permitRoles("customer"));
router.get("/", getCustomerOrders);

module.exports = router;
