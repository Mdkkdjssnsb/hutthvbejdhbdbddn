const express = require('express');
const { connectToDatabase } = require('../db');
const router = express.Router();
let liaMongo;

// Initialize database connection
connectToDatabase().then(db => {
  liaMongo = db;
});

router.put('/scores', async (req, res) => {
  const { playerid, option } = req.body;

  if (!playerid || !option) {
    return res.status(400).json({ error: 'playerid and option are required.' });
  }

  try {
    let player = await liaMongo.findOne({ playerid });

    if (!player) {
      player = { playerid, correct: 0, wrong: 0, totalPlayed: 0 };
    }

    if (option === 'correct') {
      player.correct += 1;
    } else if (option === 'wrong') {
      player.wrong += 1;
    }

    player.totalPlayed += 1;

    await liaMongo.update({ playerid }, player, { upsert: true });

    res.json({ message: 'Score updated', scores: player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/scores/:playerid', async (req, res) => {
  const { playerid } = req.params;

  try {
    const player = await liaMongo.findOne({ playerid });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ playerid, scores: player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
