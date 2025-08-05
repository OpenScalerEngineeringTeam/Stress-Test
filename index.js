const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

function simulateRealisticLoad(user) {
  for (let i = 0; i < 3; i++) {
    // Simulate external API payloads
    const fakeResponse = JSON.stringify({
      sid: user.session_id,
      name: user.name,
      id: user.user_id,
      metadata: Array.from({ length: 1000 }, (_, idx) => ({
        key: `meta-${idx}`,
        value: Math.random().toString(36).substring(2, 15),
      })),
    });

    // Parse, process, re-serialize (CPU + RAM load)
    const parsed = JSON.parse(fakeResponse);
    parsed.metadata = parsed.metadata.filter((_, i) => i % 2 === 0);
    JSON.stringify(parsed);
  }
}

// POST /register
app.post('/register', (req, res) => {
  const { name, user_id, session_id } = req.body;

  if (!name || !user_id || !session_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  simulateRealisticLoad({ name, user_id, session_id });

  const reqId = crypto.randomUUID();
  res.status(200).json({
    status: 'registered',
    request_id: reqId,
    received: { name, user_id, session_id },
  });
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Status
app.get('/status', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'running',
    pid: process.pid,
    memoryMB: {
      rss: (mem.rss / 1024 / 1024).toFixed(2),
      heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2),
    },
    uptime: process.uptime().toFixed(2),
  });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

