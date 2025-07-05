const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const TempOrder = require("../../models/TempOrder");

exports.createCheckoutSession = async (req, res) => {
  const { customerId, cartItems, shippingInfo } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
    });

    // Save temporary order details using Stripe session ID
    await TempOrder.create({
      sessionId: session.id,
      customer: customerId,
      cartItems,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    res.status(500).json({ error: "Checkout session failed" });
  }
};
