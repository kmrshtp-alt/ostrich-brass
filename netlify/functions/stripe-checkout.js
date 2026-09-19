const Stripe = require('stripe');
const { TICKET_LIMIT, SALES_CLOSE_AT, isSalesClosed, getSoldCount } = require('./lib/ticket-inventory');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (isSalesClosed()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: '前売り券のオンライン受付は終了しました。当日券（2,000円）を会場受付にてお求めください。' }),
    };
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
    // 販売済み枚数を集計（支払い完了済みのセッション＋手売り分）
    const soldCount = await getSoldCount(stripe);
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

    const childQuantity = parseInt(child_count) || 0;
    const line_items = [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'Ostrich Brass Concert in Nagasaki 前売り券（大人）',
            description: '2026年9月20日（日）長崎県美術館ホール',
          },
          unit_amount: 1500,
        },
        quantity,
      },
    ];
    if (childQuantity > 0) {
      line_items.push({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'Ostrich Brass Concert in Nagasaki 前売り券（小学生以下）',
            description: '2026年9月20日（日）長崎県美術館ホール・無料',
          },
          unit_amount: 0,
        },
        quantity: childQuantity,
      });
    }

    // 受付終了時刻を過ぎて決済が完了しないよう、決済画面の有効期限を終了時刻に合わせる（Stripeの下限は30分）
    const nowSec = Math.floor(Date.now() / 1000);
    const expiresAt = Math.min(
      Math.max(Math.floor(SALES_CLOSE_AT / 1000), nowSec + 31 * 60),
      nowSec + 23 * 3600
    );

    const session = await stripe.checkout.sessions.create({
      expires_at: expiresAt,
      line_items,
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
