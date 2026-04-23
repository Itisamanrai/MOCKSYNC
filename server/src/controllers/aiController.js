const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const extractFeedback = (data) => {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      if (typeof block?.text === "string" && block.text.trim()) {
        return block.text.trim();
      }
    }
  }

  return "";
};

const getAiFeedback = async (req, res) => {
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "OPENAI_API_KEY is missing on server" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const openAiRes = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    const data = await openAiRes.json();

    if (!openAiRes.ok) {
      return res.status(openAiRes.status).json({
        message: data?.error?.message || "OpenAI request failed",
      });
    }

    const feedback = extractFeedback(data);
    if (!feedback) {
      return res.status(502).json({ message: "No feedback text returned by OpenAI" });
    }

    return res.status(200).json({
      message: "AI feedback generated",
      feedback,
      model,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate AI feedback",
      error: error.message,
    });
  }
};

module.exports = { getAiFeedback };