const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const TempOrder = require("../../models/TempOrder");

exports.createCheckoutSession = async (req, res) => {
  const { customerId, cartItems, shippingInfo } = req.body;

  console.log("Received createCheckoutSession request:");
  console.log("customerId:", customerId);
  console.log("cartItems:", cartItems);
  console.log("shippingInfo:", shippingInfo);

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

    const tempOrderData = {
      sessionId: session.id,
      customer: customerId,
      cartItems,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
    };

    console.log("Saving TempOrder:", tempOrderData);

    const newTempOrder = await TempOrder.create(tempOrderData);

    console.log("TempOrder saved:", newTempOrder);

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    res.status(500).json({ error: "Checkout session failed" });
  }
};
