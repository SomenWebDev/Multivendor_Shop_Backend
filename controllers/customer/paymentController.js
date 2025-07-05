const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { customerId, cartItems, shippingInfo } = req.body;

  try {
    const flatCartItems = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      vendorId: item.vendorId,
    }));

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
      metadata: {
        customerId,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        cartItems: JSON.stringify(flatCartItems),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    res.status(500).json({ error: "Checkout session failed" });
  }
};
