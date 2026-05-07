const MAX_NICKNAME_LENGTH = 20;

module.exports = async function handler(request, response) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return response.status(500).json({
      message: "Supabase environment variables are missing.",
    });
  }

  if (request.method === "GET") {
    return getRankings(response, supabaseUrl, supabasePublishableKey);
  }

  if (request.method === "POST") {
    return createRanking(request, response, supabaseUrl, supabasePublishableKey);
  }

  response.setHeader("Allow", "GET, POST");
  return response.status(405).json({ message: "Method Not Allowed" });
};

async function getRankings(response, supabaseUrl, supabasePublishableKey) {
  const apiUrl = new URL("/rest/v1/quiz_rankings", supabaseUrl);
  apiUrl.searchParams.set("select", "id,nickname,score,total_questions,created_at");
  apiUrl.searchParams.set("total_questions", "eq.100");
  apiUrl.searchParams.set("order", "score.desc");
  apiUrl.searchParams.append("order", "created_at.asc");
  apiUrl.searchParams.set("limit", "10");

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

async function createRanking(request, response, supabaseUrl, supabasePublishableKey) {
  const nickname = typeof request.body?.nickname === "string" ? request.body.nickname.trim() : "";
  const score = Number(request.body?.score);
  const totalQuestions = Number(request.body?.total_questions);

  if (!nickname || Number.isNaN(score) || Number.isNaN(totalQuestions)) {
    return response.status(400).json({
      message: "Nickname, score, and total_questions are required.",
    });
  }

  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return response.status(400).json({
      message: "Nickname is too long.",
    });
  }

  if (totalQuestions !== 100) {
    return response.status(400).json({
      message: "Only 100-question ranking games can be saved.",
    });
  }

  if (score < 0 || score > totalQuestions) {
    return response.status(400).json({
      message: "Score is out of range.",
    });
  }

  const apiUrl = new URL("/rest/v1/quiz_rankings", supabaseUrl);

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
          score,
          total_questions: totalQuestions,
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
