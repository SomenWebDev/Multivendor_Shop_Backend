const Product = require("../../models/Product");
const Order = require("../../models/Order");

exports.getVendorDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const totalProducts = await Product.countDocuments({ vendor: vendorId });

    // Fetch all orders that include vendor's products
    const orders = await Order.find({ "products.vendor": vendorId })
      .sort({ createdAt: -1 }) // latest first
      .limit(5) // for recent orders
      .populate("products.product", "name");

    let totalOrders = 0;
    let totalEarnings = 0;

    const productSales = {}; // For calculating best-selling product

    orders.forEach((order) => {
      // Filter vendor's products with accepted statuses
      const vendorProducts = order.products.filter(
        (p) =>
          p.vendor.toString() === vendorId &&
          ["paid", "shipped", "delivered"].includes(p.status)
      );

      if (vendorProducts.length > 0) totalOrders++;

      vendorProducts.forEach((item) => {
        totalEarnings += item.price * item.quantity;

        const pid = item.product._id.toString();
        if (!productSales[pid]) {
          productSales[pid] = {
            name: item.product.name,
            quantity: 0,
            earnings: 0,
          };
        }
        productSales[pid].quantity += item.quantity;
        productSales[pid].earnings += item.price * item.quantity;
      });
    });

    // Determine best-selling product by quantity
    let bestSellingProduct = null;
    let maxQuantity = 0;

    Object.values(productSales).forEach((prod) => {
      if (prod.quantity > maxQuantity) {
        maxQuantity = prod.quantity;
        bestSellingProduct = prod;
      }
    });

    // Format recent orders data for frontend
    const recentOrders = orders.map((order) => ({
      _id: order._id,
      createdAt: order.createdAt,
      products: order.products
        .filter((p) => p.vendor.toString() === vendorId)
        .map((p) => ({
          name: p.product.name,
          quantity: p.quantity,
          price: p.price,
          status: p.status,
        })),
      totalAmount: order.products
        .filter((p) => p.vendor.toString() === vendorId)
        .reduce((sum, p) => sum + p.price * p.quantity, 0),
    }));

    res.json({
      totalProducts,
      totalOrders,
      totalEarnings,
      recentOrders,
      bestSellingProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
