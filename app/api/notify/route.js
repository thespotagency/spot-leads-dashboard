const ALLOWED_ORIGIN = 'https://thespotagency.github.io';

export async function POST(req) {
  try {
    const body = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return new Response(JSON.stringify({ error: 'Telegram not configured' }), {
        status: 500,
        headers: corsHeaders(),
      });
    }

    const text =
      '🔥 New Lead — The Spot\n\n' +
      'Name: ' + (body.name || '-') + '\n' +
      'Phone: ' + (body.phone || '-') + '\n' +
      'Business: ' + (body.business_name || '-') + '\n' +
      'Type: ' + (body.business_type || '-') + '\n' +
      'Budget: ' + (body.monthly_budget || '-') + '\n' +
      'Message: ' + (body.message || '-');

    await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}