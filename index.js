const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Example endpoint
app.get('/', (req, res) => {
  res.send('Welcome to TORF API Server');
});

// Function to get a random question from a JSON file
const getRandomQuestion = (jsonData) => {
  const randomIndex = Math.floor(Math.random() * jsonData.length);
  return jsonData[randomIndex];
};

// TORF API endpoint to send a random question from quiz.json
app.get('/api/torf', (req, res) => {
  try {
    // Read quiz.json file
    const filePath = path.join(__dirname, 'quiz.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading quiz data:', err);
        res.status(500).json({ error: 'Failed to fetch quiz data' });
        return;
      }
      const quizData = JSON.parse(data);
      // Get a random question
      const randomQuestion = getRandomQuestion(quizData);
      // Respond with the random question
      res.json(randomQuestion);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

// Math API endpoint to send math question from math.json
app.get('/api/math', (req, res) => {
  try {
    // Read math.json file
    const filePath = path.join(__dirname, 'math.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading math data:', err);
        res.status(500).json({ error: 'Failed to fetch math data' });
        return;
      }
      const mathData = JSON.parse(data);
      // Get a random math question
      const randomQuestion = getRandomQuestion(mathData);
      // Respond with the random math question
      res.json(randomQuestion);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

// Anime API endpoint to send anime question from anime.json
app.get('/api/anime', (req, res) => {
  try {
    // Read anime.json file
    const filePath = path.join(__dirname, 'anime.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading anime data:', err);
        res.status(500).json({ error: 'Failed to fetch anime quiz data' });
        return;
      }
      const animeData = JSON.parse(data);
      // Get a random anime quiz question
      const randomQuestion = getRandomQuestion(animeData);
      // Respond with the random anime quiz question
      res.json(randomQuestion);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
