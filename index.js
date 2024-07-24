const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const LiaMongo = require('lia-mongo');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize lia-mongo
const liaMongo = new LiaMongo({
  uri: "mongodb+srv://aryankumarg:iuYj*f5m8YsAFCF@goatmart.c64ig7m.mongodb.net/?retryWrites=true&w=majority&appName=GoatMart",
  collection: "myCollection",
  isOwnHost: false,
});

liaMongo.start().then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

// Helper function to get a random question from a JSON file
const getRandomQuestion = (jsonData) => {
  const randomIndex = Math.floor(Math.random() * jsonData.length);
  return jsonData[randomIndex];
};

// Endpoint to send a random question based on category
app.get('/api/quiz', (req, res) => {
  const { category } = req.query;
  try {
    if (!category) {
      return res.status(400).json({ error: 'category parameter is required.' });
    }
    const filePath = path.join(__dirname, `${category}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading ${category} data:`, err);
        return res.status(500).json({ error: `Failed to fetch ${category} data` });
      }
      const jsonData = JSON.parse(data);
      const randomQuestion = getRandomQuestion(jsonData);
      res.json(randomQuestion);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

// Endpoint to update player scores
app.put('/api/scores', async (req, res) => {
  const { playerid, option } = req.body;

  if (!playerid || !option) {
    return res.status(400).json({ error: 'playerid and option are required.' });
  }

  try {
    // Fetch player data
    let player = await liaMongo.findOne({ playerid });

    if (!player) {
      player = { playerid, correct: 0, wrong: 0, totalPlayed: 0 };
    }

    // Update player data
    if (option === 'correct') {
      player.correct += 1;
    } else if (option === 'wrong') {
      player.wrong += 1;
    }

    player.totalPlayed += 1;

    // Save updated player data
    await liaMongo.update({ playerid }, player, { upsert: true });

    res.json({
      message: 'Score updated',
      scores: player
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get player scores and game stats
app.get('/api/scores/:playerid', async (req, res) => {
  const { playerid } = req.params;

  try {
    const player = await liaMongo.findOne({ playerid });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({
      playerid,
      scores: player
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
