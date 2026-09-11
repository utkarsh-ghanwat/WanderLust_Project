const semanticSearch = require("../rag");

async function searchListingsTool(userQuery) {
  const results = await semanticSearch(userQuery);

  return results.map((item) => ({
    id: item._id,
    title: item.title,
    location: `${item.location}, ${item.country}`,
    price: item.price,
    description: item.description,
    score: Number(item.score.toFixed(3)),
  }));
}

module.exports = searchListingsTool;