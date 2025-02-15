// openAiClient.js
import { OpenAI } from "openai";

/**
 * Create a single instance for your OpenAI client.
 * This is a simple approach for demonstration,
 * but in production, you'd store your API key securely on a server.
 */
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Exposes the key in the browser, be aware of security.
});

/**
 * Optional helper function to streamline making a chat completion call.
 * Feel free to adjust the parameters as needed.
 */
export async function getOpenAiChatCompletion({
  systemPrompt,
  userContent,
  model = "gpt-4o",
  maxTokens = 300,
  temperature = 0.7,
}) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI error:", error);
    return ""; // or throw error
  }
}

export default openai; // In case you want direct access to the `openai` instance
