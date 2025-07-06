// controllers/vendor/orderController.js
const Order = require("../../models/Order");

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim().toLowerCase() || "";
    const sortBy = req.query.sortBy || "newest";

    // Build dynamic sort
    let sortStage = {};
    if (sortBy === "newest") sortStage = { createdAt: -1 };
    else if (sortBy === "oldest") sortStage = { createdAt: 1 };

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          "products.vendor": vendorId,
        },
      },
      {
        $addFields: {
          vendorProducts: {
            $filter: {
              input: "$products",
              as: "p",
              cond: { $eq: ["$$p.vendor", vendorId] },
            },
          },
        },
      },
      {
        $addFields: {
          vendorTotal: {
            $sum: {
              $map: {
                input: "$vendorProducts",
                as: "item",
                in: { $multiply: ["$$item.price", "$$item.quantity"] },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $match: {
          ...(search && {
            $or: [
              { "customer.name": { $regex: search, $options: "i" } },
              { "customer.email": { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }),
        },
      },
      {
        $sort: sortStage,
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    const orders = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({ orders, totalPages });
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
