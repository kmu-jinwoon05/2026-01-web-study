module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return response.status(500).json({
      message: "Supabase environment variables are missing.",
    });
  }

  const apiUrl = new URL("/rest/v1/pokemon_quiz_items", supabaseUrl);
  apiUrl.searchParams.set("select", "pokemon_id,name_ko,name_en,aliases");
  apiUrl.searchParams.set("order", "pokemon_id.asc");

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
};
