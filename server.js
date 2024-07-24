const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Example endpoint
app.get('/', (req, res) => {
  res.send('Welcome to QUIZ API Server');
});

// Function to get a random question from a JSON file
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
    // Read data based on category
    const filePath = path.join(__dirname, `${category}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading ${category} data:`, err);
        return res.status(500).json({ error: `Failed to fetch ${category} data` });
      }
      const jsonData = JSON.parse(data);
      // Get a random question from the category data
      const randomQuestion = getRandomQuestion(jsonData);
      // Respond with the random question
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
