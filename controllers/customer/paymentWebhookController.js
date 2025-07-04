const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../../models/Order");
const Product = require("../../models/Product");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Invalid webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    try {
      const parsedItems = JSON.parse(metadata.cartItems || "[]");

      // Map products from metadata
      const products = parsedItems.map((item) => {
        if (!item.vendorId) {
          throw new Error("Missing vendorId in cart item");
        }

        return {
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          vendor: item.vendorId,
        };
      });

      // ✅ Create the order with shipping info
      const order = await Order.create({
        customer: metadata.customerId,
        products,
        totalAmount: session.amount_total / 100,
        paymentIntentId: session.payment_intent,
        shippingInfo: {
          name: metadata.shippingName,
          phone: metadata.shippingPhone,
          address: metadata.shippingAddress,
        },
      });

      console.log("✅ Order saved:", order._id, "on", order.createdAt);

      // ✅ Reduce stock for each product
      for (const item of parsedItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        } else {
          console.warn(
            `⚠️ Product not found for stock update: ${item.productId}`
          );
        }
      }
    } catch (error) {
      console.warn(
        "❌ Failed to parse cartItems, save order, or update stock:",
        error
      );
      return res
        .status(400)
        .json({ error: "Order creation or stock update failed" });
    }
  }

  res.status(200).json({ received: true });
};
