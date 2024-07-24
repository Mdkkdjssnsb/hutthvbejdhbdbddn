const express = require('express');
const bodyParser = require('body-parser');
const quizRoutes = require('./routes/quizRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const port = 3000; // Hardcoded port

app.use(bodyParser.json());

// Use routes
app.use('/api', quizRoutes);
app.use('/api', scoreRoutes);
app.use('/api', leaderboardRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
