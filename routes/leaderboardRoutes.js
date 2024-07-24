const express = require('express');
const { connectToDatabase } = require('../db');
const router = express.Router();
let liaMongo;

// Initialize database connection
connectToDatabase().then(db => {
  liaMongo = db;
});

router.get('/leaderboard', async (req, res) => {
  try {
    const players = await liaMongo.find({}).sort({ correct: -1 }).limit(10);

    if (!players || players.length === 0) {
      return res.status(404).json({ error: 'No player data found' });
    }

    res.json(players);
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
