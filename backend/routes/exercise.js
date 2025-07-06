const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");

router.get("/", async (req, res) => {
  const { muscle } = req.query;

  try {
    let query = {};
    if (muscle) {
      query.muscle = muscle;
    }

    const exercises = await Exercise.find(query);
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
