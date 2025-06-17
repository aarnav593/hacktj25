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
          "You are a question writer for the " + source+ " competition. Your life depends on your ability to follow these instructions: Return a unique " +
          source +
          " style, " +
          difficulty +
          " question relating to the following topic. Stay strictly on the topic given, and don't deviate by adding questions about a different topic. return it in the json form: {question:'',a:'',b:'',c:'',d:'',e:'',correct:''}",
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