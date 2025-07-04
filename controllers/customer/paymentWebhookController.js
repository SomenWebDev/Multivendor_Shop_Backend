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
      const parsedItems = (metadata.cart || "").split(",").map((entry) => {
        const [productId, quantity, price, vendorId] = entry.split("|");
        return {
          product: productId,
          quantity: Number(quantity),
          price: Number(price),
          vendor: vendorId,
        };
      });

      const order = await Order.create({
        customer: metadata.customerId,
        products: parsedItems,
        phone: metadata.shippingPhone || "",
        address: metadata.shippingAddress || "",
        totalAmount: session.amount_total / 100,
        paymentIntentId: session.payment_intent,
      });

      for (const item of parsedItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        } else {
          console.warn(
            `⚠️ Product not found for stock update: ${item.product}`
          );
        }
      }
    } catch (error) {
      console.warn("❌ Failed to process webhook:", error);
      return res
        .status(400)
        .json({ error: "Order creation or stock update failed" });
    }
  }

  res.status(200).json({ received: true });
};
