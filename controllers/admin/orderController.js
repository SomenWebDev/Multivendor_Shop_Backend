const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Category = require("../../models/Category");

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, search = "", status = "", category = "" } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;

    let query = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
        ],
      };
    }

    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("products.product", "name category")
      .populate("products.vendor", "name email")
      .sort({ createdAt: -1 });

    let filteredOrders = orders;

    // Apply status and category filtering
    if (status) {
      filteredOrders = filteredOrders.filter((order) =>
        order.products.some((p) => p.status === status)
      );
    }

    if (category) {
      filteredOrders = filteredOrders.filter((order) =>
        order.products.some((p) => p.product.category?.toString() === category)
      );
    }

    // Apply search manually
    if (search) {
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
          order.customer?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const paginated = filteredOrders.slice(skip, skip + limit);

    res.json({
      orders: paginated,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredOrders.length / limit),
    });
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
