const Stripe = require('stripe');

const ADMIN_PASSWORD = 'Ostrich2017-';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (body.password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: '認証エラー' }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    let tickets = [];
    let hasMore = true;
    let startingAfter = undefined;

    while (hasMore) {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const s of sessions.data) {
        if (s.payment_status !== 'paid') continue;
        tickets.push({
          id: s.id,
          created: s.created,
          last_name: s.metadata?.last_name || '',
          first_name: s.metadata?.first_name || '',
          last_name_kana: s.metadata?.last_name_kana || '',
          first_name_kana: s.metadata?.first_name_kana || '',
          phone: s.metadata?.phone || '',
          referrer: s.metadata?.referrer || '',
          adult_count: parseInt(s.metadata?.adult_count || 0),
          child_count: parseInt(s.metadata?.child_count || 0),
        });
      }

      hasMore = sessions.has_more;
      if (hasMore) {
        startingAfter = sessions.data[sessions.data.length - 1].id;
      }
    }

    tickets.sort((a, b) => b.created - a.created);

    const totalAdults = tickets.reduce((sum, t) => sum + t.adult_count, 0);
    const totalChildren = tickets.reduce((sum, t) => sum + t.child_count, 0);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets, totalAdults, totalChildren }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
