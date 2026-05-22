const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  let token = process.env.INSTAGRAM_TOKEN;

  // Use refreshed token from Blobs if available
  try {
    const store = getStore({ name: 'instagram', consistency: 'strong' });
    const stored = await store.get('token');
    if (stored) token = stored;
  } catch (_) {}

  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Instagram token not configured' }) };
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=6&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) return { statusCode: 400, body: JSON.stringify(data) };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
