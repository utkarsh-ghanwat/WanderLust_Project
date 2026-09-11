require("dotenv").config();

const { GoogleGenAI, Type } = require("@google/genai");
const searchListings = require("./tools/searchListings");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function travelAgent(userMessage) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: userMessage,

    config: {
      tools: [
        {
          functionDeclarations: [
            {
              name: "search_listings",
              description:
                "Search WanderLust properties using semantic search",

              parameters: {
                type: Type.OBJECT,
                properties: {
                  query: {
                    type: Type.STRING,
                    description:
                      "Natural language search query from the user",
                  },
                },
                required: ["query"],
              },
            },
          ],
        },
      ],
    },
  });

  const part = response.candidates[0].content.parts[0];

  if (part.functionCall) {
    const query = part.functionCall.args.query;

    const listings = await searchListings(query);

    const finalResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `
User asked:
${userMessage}

Available listings:
${JSON.stringify(listings, null, 2)}

Recommend the best options in a friendly travel assistant style.
      `,
    });

    return finalResponse.text;
  }

  return response.text;
}

module.exports = travelAgent;