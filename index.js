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

// Function to get a random question
const getRandomQuestion = (quizData) => {
  const randomIndex = Math.floor(Math.random() * quizData.length);
  return quizData[randomIndex];
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
