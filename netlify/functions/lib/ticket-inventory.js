const manualTickets = require('./manual-tickets');

const TICKET_LIMIT = 95; // 前売り券の総販売上限
const SALES_CLOSE_AT = Date.parse('2026-09-20T00:00:00+09:00'); // 9/19 23:59 を過ぎたらオンライン販売終了

function isSalesClosed(now = Date.now()) {
  return now >= SALES_CLOSE_AT;
}

async function getSoldCount(stripe) {
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

  for (const m of manualTickets) {
    soldCount += m.adult_count + m.child_count;
  }

  return soldCount;
}

module.exports = { TICKET_LIMIT, SALES_CLOSE_AT, isSalesClosed, getSoldCount };
