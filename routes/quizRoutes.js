const express = require('express');
const fs = require('fs');
const path = require('path');
const { getRandomQuestion } = require('../utils');
const router = express.Router();

// Helper function to get a random question from a JSON file
const getRandomQuestionFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(`Error reading file: ${err.message}`);
      }
      const jsonData = JSON.parse(data);
      resolve(getRandomQuestion(jsonData));
    });
  });
};

// Endpoint to get a random question by category
router.get('/quiz', async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: 'Category parameter is required.' });
  }

  const filePath = path.join(__dirname, `${category}.json`);

  try {
    const question = await getRandomQuestionFromFile(filePath);
    res.json(question);
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    res.status(500).json({ error: `Failed to fetch ${category} data` });
  }
});

module.exports = router;
