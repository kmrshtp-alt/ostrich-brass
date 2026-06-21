const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { last_name, first_name, last_name_kana, first_name_kana, phone, referrer, adult_count, child_count } = body;
  const name = `${last_name || ''} ${first_name || ''}`.trim();

  if (!last_name || !first_name || !adult_count || parseInt(adult_count) < 1) {
    return { statusCode: 400, body: JSON.stringify({ error: '姓・名・大人の枚数は必須です' }) };
  }

  const quantity = parseInt(adult_count);

  try {
    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'Ostrich Brass Concert in Nagasaki 前売り券',
              description: '2026年9月20日（日）長崎県美術館ホール',
            },
            unit_amount: 1500,
          },
          quantity,
        },
      ],
      mode: 'payment',
      customer_email: undefined, // Stripeの画面でメールを入力してもらう
      metadata: {
        last_name: last_name || '',
        first_name: first_name || '',
        last_name_kana: last_name_kana || '',
        first_name_kana: first_name_kana || '',
        name,
        phone: phone || '',
        referrer: referrer || '',
        adult_count: String(quantity),
        child_count: String(parseInt(child_count) || 0),
      },
      success_url: 'https://ostrich-brass.netlify.app/nagasaki2026.html?success=true',
      cancel_url: 'https://ostrich-brass.netlify.app/nagasaki2026.html?canceled=true',
      locale: 'ja',
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
