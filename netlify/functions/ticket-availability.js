const Stripe = require('stripe');
const { TICKET_LIMIT, getSoldCount, isSalesClosed } = require('./lib/ticket-inventory');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const soldCount = await getSoldCount(stripe);
    const remaining = Math.max(TICKET_LIMIT - soldCount, 0);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ remaining, limit: TICKET_LIMIT, closed: isSalesClosed() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
