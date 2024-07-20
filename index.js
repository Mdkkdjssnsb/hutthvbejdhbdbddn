const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const usersFilePath = path.join(__dirname, 'users.json');

// Middleware
app.use(bodyParser.json());

// Function to get a random question from a JSON file
const getRandomQuestion = (jsonData) => {
  if (!jsonData.length) throw new Error('No questions available');
  const randomIndex = Math.floor(Math.random() * jsonData.length);
  return jsonData[randomIndex];
};

// Helper function to read JSON file
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw new Error('Failed to read JSON file');
  }
};

// Helper function to write JSON file
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    throw new Error('Failed to write JSON file');
  }
};

// Example endpoint
app.get('/', (req, res) => {
  res.send('Welcome to QUIZ API Server');
});

// Endpoint to send a random question based on category
app.get('/api/quiz', async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category parameter is required.' });
  }

  const filePath = path.join(__dirname, `${category}.json`);

  try {
    const jsonData = await readJsonFile(filePath);
    const randomQuestion = getRandomQuestion(jsonData);
    res.json(randomQuestion);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch question data' });
  }
});

// Endpoint to update user progress
app.post('/api/update-progress', async (req, res) => {
  const { uid, correct, incorrect, played } = req.body;

  if (typeof uid !== 'string' || typeof correct !== 'number' || typeof incorrect !== 'number' || typeof played !== 'number') {
    return res.status(400).json({ error: 'Invalid input types.' });
  }

  try {
    const users = await readJsonFile(usersFilePath);
    let user = users.find(u => u.uid === uid);

    if (user) {
      user.correct += correct;
      user.incorrect += incorrect;
      user.played += played;
    } else {
      user = { uid, correct, incorrect, played };
      users.push(user);
    }

    await writeJsonFile(usersFilePath, users);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Endpoint to get user progress
app.get('/api/user-progress', async (req, res) => {
  const { uid } = req.query;

  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Valid uid parameter is required.' });
  }

  try {
    const users = await readJsonFile(usersFilePath);
    const user = users.find(u => u.uid === uid);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Endpoint to get global ranking
app.get('/api/global-ranking', async (req, res) => {
  try {
    const users = await readJsonFile(usersFilePath);
    const sortedUsers = users.sort((a, b) => b.correct - a.correct);
    res.json(sortedUsers);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch global ranking' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
