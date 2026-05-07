const MAX_NICKNAME_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 200;

module.exports = async function handler(request, response) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return response.status(500).json({
      message: "Supabase environment variables are missing.",
    });
  }

  if (request.method === "GET") {
    return getMessages(response, supabaseUrl, supabasePublishableKey);
  }

  if (request.method === "POST") {
    return createMessage(request, response, supabaseUrl, supabasePublishableKey);
  }

  response.setHeader("Allow", "GET, POST");
  return response.status(405).json({ message: "Method Not Allowed" });
};

async function getMessages(response, supabaseUrl, supabasePublishableKey) {
  const apiUrl = new URL("/rest/v1/quiz_messages", supabaseUrl);
  apiUrl.searchParams.set("select", "id,nickname,message,created_at");
  apiUrl.searchParams.set("order", "created_at.desc");
  apiUrl.searchParams.set("limit", "20");

  try {
    const supabaseResponse = await fetch(apiUrl, {
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
      },
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();

      return response.status(supabaseResponse.status).json({
        message: "Supabase request failed.",
        details: errorText,
      });
    }

    const rows = await supabaseResponse.json();
    return response.status(200).json(rows);
  } catch (error) {
    return response.status(500).json({
      message: "Unexpected server error.",
      details: error.message,
    });
  }
}

async function createMessage(request, response, supabaseUrl, supabasePublishableKey) {
  const nickname = typeof request.body?.nickname === "string" ? request.body.nickname.trim() : "";
  const message = typeof request.body?.message === "string" ? request.body.message.trim() : "";

  if (!nickname || !message) {
    return response.status(400).json({
      message: "Nickname and message are required.",
    });
  }

  if (nickname.length > MAX_NICKNAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return response.status(400).json({
      message: "Input is too long.",
    });
  }

  const apiUrl = new URL("/rest/v1/quiz_messages", supabaseUrl);

  try {
    const supabaseResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
      },
      body: JSON.stringify([
        {
          nickname,
          message,
        },
      ]),
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();

      return response.status(supabaseResponse.status).json({
        message: "Supabase insert failed.",
        details: errorText,
      });
    }

    const rows = await supabaseResponse.json();
    return response.status(201).json(rows[0] || null);
  } catch (error) {
    return response.status(500).json({
      message: "Unexpected server error.",
      details: error.message,
    });
  }
}
