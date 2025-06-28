//controllers//customer//orderController.js
const Order = require("../../models/Order");

exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const totalCount = await Order.countDocuments({ customer: customerId });
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("products.product", "name price imageUrl")
      .populate("products.vendor", "name");

    res.json({ orders, totalPages });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Server error while fetching orders" });
  }
};
