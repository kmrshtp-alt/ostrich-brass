const Stripe = require('stripe');

const TICKET_LIMIT = 80; // 前売り券の総販売上限

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
    // 販売済み枚数を集計（支払い完了済みのセッションのみ）
    let soldCount = 0;
    let hasMore = true;
    let startingAfter = undefined;

    while (hasMore) {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const s of sessions.data) {
        if (s.payment_status !== 'paid') continue;
        soldCount += parseInt(s.metadata?.adult_count || 0);
        soldCount += parseInt(s.metadata?.child_count || 0);
      }

      hasMore = sessions.has_more;
      if (hasMore) {
        startingAfter = sessions.data[sessions.data.length - 1].id;
      }
    }

    const remaining = TICKET_LIMIT - soldCount;

    if (remaining <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '前売り券は完売しました。当日券（2,000円）を会場受付にてお求めください。' }),
      };
    }

    if (quantity > remaining) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `残り${remaining}枚です。枚数を変更してください。` }),
      };
    }

    const session = await stripe.checkout.sessions.create({
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
      customer_email: undefined,
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
      payment_intent_data: {
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
      },
      success_url: 'https://ostrich-brass.netlify.app/nagasaki2026.html?success=true',
      cancel_url: 'https://ostrich-brass.netlify.app/nagasaki2026.html?canceled=true',
      locale: 'ja',
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, remaining: remaining - quantity }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
