const searchListings = require("./tools/searchListings");

async function run() {
  const result = await searchListings(
    "luxury villa with swimming pool near beach"
  );

  console.log(result);
}

run();