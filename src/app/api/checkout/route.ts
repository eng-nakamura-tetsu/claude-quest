import Stripe from "stripe";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return Response.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const { searchParams } = new URL(req.url);
  const org = searchParams.get("org") ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: "Claude Quest PRO",
            description: `${org ? org + " — " : ""}プライベートリポジトリ対応・リアルタイムEXP・週次レポート`,
          },
          unit_amount: 7800,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${req.headers.get("origin") ?? "https://claude-quest.vercel.app"}/?success=1`,
    cancel_url: `${req.headers.get("origin") ?? "https://claude-quest.vercel.app"}/pricing`,
    metadata: { org },
  });

  return Response.json({ url: session.url });
}
