require("dotenv").config();

const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const Listing = require("../models/listing");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function connectDB() {
  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("MongoDB Connected");
}

function createListingText(listing) {
  return `
Title: ${listing.title}
Description: ${listing.description}
Location: ${listing.location}, ${listing.country}
Price: ₹${listing.price}
  `.trim();
}

async function generateEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

async function generateAllEmbeddings() {
  const listings = await Listing.find({});

  console.log(`Found ${listings.length} listings\n`);

  for (const listing of listings) {
    const text = createListingText(listing);

    const embedding = await generateEmbedding(text);

    listing.embedding = embedding;
    await listing.save();

    console.log(`Embedded: ${listing.title}`);
  }

  console.log("\nAll embeddings created successfully!");
}

async function main() {
  try {
    await connectDB();
    await generateAllEmbeddings();
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log("Connection Closed");
  }
}

main();