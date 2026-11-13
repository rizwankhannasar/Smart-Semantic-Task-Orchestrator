
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const extractTasks = async (userInput, clarification = "") => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Karachi"
  });

  const prompt = `
Today's date is ${today}.
User's timezone is Asia/Karachi.

Original user instructions:
"${userInput}"

User's clarification:
"${clarification || "No clarification provided yet."}"

Your job is to extract and manage the user's tasks.

Rules:
1. Extract every distinct task.
2. Assign priority: low, medium, or high.
3. Convert clearly specified deadlines to ISO 8601.
4. Never invent a deadline.
5. Use an empty string for a missing deadline.
6. A missing optional deadline alone does not require clarification.
7. If essential information is ambiguous, ask one clear clarification question.
8. Do not create tasks from unclear instructions.
9. If clarification is provided, use it to update the original tasks.
10. Do not ask again about information already clarified.
11. If clarification resolves the ambiguity, set needsClarification to false.
12. Preserve all other valid tasks.

Return the result using the required JSON schema.
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    let timeoutId;

    try {
      console.log(`Gemini request attempt ${attempt}...`);

      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Gemini request timed out after 30 seconds."));
        }, 30000);
      });

      const request = ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    },
                    deadline: { type: "string" }
                  },
                  required: ["title", "priority", "deadline"]
                }
              },
              needsClarification: { type: "boolean" },
              clarificationQuestion: { type: "string" }
            },
            required: [
              "tasks",
              "needsClarification",
              "clarificationQuestion"
            ]
          }
        }
      });

      const response = await Promise.race([request, timeout]);

      console.log("Gemini response received!");

      return JSON.parse(response.text);

    } catch (error) {
      console.error(`Gemini attempt ${attempt} failed:`, error.message);

      const isTemporary =
        error.message.includes("503") ||
        error.message.includes("UNAVAILABLE") ||
        error.message.includes("429") ||
        error.message.includes("timed out");

      if (!isTemporary || attempt === 3) {
        throw error;
      }

      console.log("Retrying Gemini request...");

      await new Promise(resolve =>
        setTimeout(resolve, 1000 * 2 ** (attempt - 1))
      );

    } finally {
      clearTimeout(timeoutId);
    }
  }
};
