const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const TempOrder = require("../../models/TempOrder");

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

    try {
      const tempOrder = await TempOrder.findOne({ sessionId: session.id });

      if (!tempOrder) {
        throw new Error("No matching temp order found for this session");
      }

      const products = tempOrder.cartItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendorId,
      }));

      const order = await Order.create({
        customer: tempOrder.customer,
        products,
        totalAmount: session.amount_total / 100,
        paymentIntentId: session.payment_intent,
        phone: tempOrder.phone,
        address: tempOrder.address,
      });

      console.log("✅ Final order created:", order._id);

      for (const item of products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }

      // Clean up temp data
      await TempOrder.deleteOne({ _id: tempOrder._id });
    } catch (error) {
      console.error("❌ Failed to process Stripe webhook:", error);
      return res.status(400).json({ error: "Order creation failed" });
    }
  }

  res.status(200).json({ received: true });
};
