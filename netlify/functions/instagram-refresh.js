const { getStore } = require('@netlify/blobs');

// Scheduled function: runs on the 1st of every month
// Refreshes the Instagram long-lived token before it expires (60-day TTL)
exports.handler = async () => {
  let token = process.env.INSTAGRAM_TOKEN;

  try {
    const store = getStore({ name: 'instagram', consistency: 'strong' });
    const stored = await store.get('token');
    if (stored) token = stored;
  } catch (_) {}

  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'No token found' }) };
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
    );
    const data = await res.json();

    if (!data.access_token) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Refresh failed', detail: data }) };
    }

    const store = getStore({ name: 'instagram', consistency: 'strong' });
    await store.set('token', data.access_token);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, expires_in: data.expires_in }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
