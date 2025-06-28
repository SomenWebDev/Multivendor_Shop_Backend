const StripeAccount = require("../../models/StripeAccount");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createVendorPayout = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const account = await StripeAccount.findOne({ user: vendorId });
    if (!account || !account.accountId) {
      return res.status(400).json({ message: "Stripe account not found" });
    }

    const { amount } = req.body;
    const amountInCents = Math.round(amount * 100);

    const payout = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: account.accountId,
      description: `Payout to vendor ${vendorId}`,
    });

    res.json({ success: true, payout });
  } catch (error) {
    console.error("Payout error:", error);
    res.status(500).json({ message: "Payout failed" });
  }
};
