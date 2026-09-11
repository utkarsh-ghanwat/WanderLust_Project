require("dotenv").config();

const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const Listing = require("../models/listing");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("MongoDB Connected");
  }
}

async function getQueryEmbedding(query) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: query,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

async function semanticSearch(query) {
  await connectDB();

  const queryVector = await getQueryEmbedding(query);

  const results = await Listing.aggregate([
    {
      $vectorSearch: {
        index: "listing_vector_index",
        path: "embedding",
        queryVector,
        numCandidates: 50,
        limit: 5,
      },
    },
    {
      $project: {
        title: 1,
        location: 1,
        country: 1,
        price: 1,
        description: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
}

module.exports = semanticSearch;

// Test only when running: node ai/rag.js
if (require.main === module) {
  (async () => {
    const results = await semanticSearch("luxury beach villa");

    console.log(results);

    await mongoose.connection.close();
    console.log("Connection Closed");
  })();
}