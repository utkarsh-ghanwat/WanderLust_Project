const express = require("express");
const router = express.Router();

const travelAgent = require("../ai/agent");

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await travelAgent(message);

    res.json({
      success: true,
      reply,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
});

module.exports = router;