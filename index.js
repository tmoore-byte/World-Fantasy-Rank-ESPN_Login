
const express = require('express');
const bodyParser = require('body-parser');
const { startEspnLogin, completeEspnLogin } = require('./puppeteer/espnLoginFlow');

const app = express();
app.use(bodyParser.json());

const sessions = new Map(); // In-memory storage of login sessions

// Step 1 - Launch Puppeteer & wait for manual login
app.post('/espn-login-start', async (req, res) => {
  try {
    const sessionId = Date.now().toString(); // Simple session key
    const session = await startEspnLogin();
    sessions.set(sessionId, session);

    res.status(200).json({ sessionId, message: 'Login window opened. Complete login and continue.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2 - Complete login & extract data
app.post('/espn-login-complete', async (req, res) => {
  try {
    const { sessionId, leagueId, seasonId } = req.body;
    console.log('Received sessionId:', sessionId, 'leagueId:', leagueId, 'seasonId:', seasonId);

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }

    const result = await completeEspnLogin(session, leagueId, seasonId);
    sessions.delete(sessionId);
    res.status(200).json(result);
  } catch (err) {
    console.error('Login complete failed:', err);
    res.status(500).json({ error: err.message });
  }
});



app.listen(3000, () => console.log('ESPN Login Server running at http://localhost:3000'));
