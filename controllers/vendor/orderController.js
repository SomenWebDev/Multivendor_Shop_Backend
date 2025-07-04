// controllers/vendor/orderController.js
const Order = require("../../models/Order");

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "newest";

    const allOrders = await Order.find({
      "products.vendor": vendorId,
    })
      .populate("customer", "name email")
      .populate("products.product", "name price");

    const filteredOrders = allOrders.filter((order) => {
      const nameMatch = order.customer?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const emailMatch = order.customer?.email
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return nameMatch || emailMatch;
    });

    // Sorting logic
    let sortedOrders = filteredOrders;

    if (sortBy === "newest") {
      sortedOrders = filteredOrders.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "oldest") {
      sortedOrders = filteredOrders.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === "totalHigh") {
      sortedOrders = filteredOrders.sort((a, b) => {
        const totalA = a.products
          .filter((p) => p.vendor.toString() === vendorId)
          .reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalB = b.products
          .filter((p) => p.vendor.toString() === vendorId)
          .reduce((acc, item) => acc + item.price * item.quantity, 0);
        return totalB - totalA;
      });
    } else if (sortBy === "totalLow") {
      sortedOrders = filteredOrders.sort((a, b) => {
        const totalA = a.products
          .filter((p) => p.vendor.toString() === vendorId)
          .reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalB = b.products
          .filter((p) => p.vendor.toString() === vendorId)
          .reduce((acc, item) => acc + item.price * item.quantity, 0);
        return totalA - totalB;
      });
    }

    const totalCount = sortedOrders.length;
    const totalPages = Math.ceil(totalCount / limit);

    const paginatedOrders = sortedOrders.slice(
      (page - 1) * limit,
      page * limit
    );

    const result = paginatedOrders.map((order) => {
      const vendorProducts = order.products.filter(
        (p) => p.vendor.toString() === vendorId
      );
      const vendorTotal = vendorProducts.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      return {
        _id: order._id,
        customer: order.customer,
        products: vendorProducts,
        totalAmount: vendorTotal,
        createdAt: order.createdAt,
      };
    });

    res.json({ orders: result, totalPages });
  } catch (err) {
    console.error("Vendor Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.updateVendorProductStatus = async (req, res) => {
  try {
    const { orderId, productId, status } = req.body;
    const vendorId = req.user.userId;

    if (!["shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (p) =>
        p.product.toString() === productId && p.vendor.toString() === vendorId
    );

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not owned by vendor" });
    }

    if (product.status !== "paid" && status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a product that's already processed" });
    }

    product.status = status;
    await order.save();

    res.json({ message: "Product status updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};
