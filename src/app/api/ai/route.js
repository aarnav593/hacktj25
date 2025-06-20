import OpenAI from "openai";

export async function POST(req) {
  const { source, difficulty, topic } = await req.json();

  let model = "gpt-4o";
  if (difficulty === "easy") model = "gpt-4o-mini";

  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "Return a unique " +
          source +
          " style, " +
          difficulty +
          " question relating to the following topic, and return it in the json form: {question:'',a:'',b:'',c:'',d:'',e:'',correct:''}",
      },
      {
        role: "user",
        content: topic,
      },
    ],
  });

  let questionObj;
  try {
    questionObj = JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "AI did not return valid JSON." }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(questionObj), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}