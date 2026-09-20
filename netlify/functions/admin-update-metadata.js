// 購入済みチケットのメタデータを手直しするための管理用エンドポイント。
const Stripe = require('stripe');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ostrich2017-'; // Netlifyの環境変数 ADMIN_PASSWORD を設定すると変更できる

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

  const { session_id, metadata } = body;
  if (!session_id || !metadata || typeof metadata !== 'object') {
    return { statusCode: 400, body: JSON.stringify({ error: 'session_id と metadata が必要です' }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const updated = await stripe.checkout.sessions.update(session_id, { metadata });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, metadata: updated.metadata }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
