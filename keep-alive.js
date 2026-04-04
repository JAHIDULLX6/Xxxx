/**
 * keep-alive.js — Optional standalone health-check server
 * Used when hosting on platforms that need a separate HTTP ping endpoint.
 * The main dashboard (dashboard/app.js) already exposes /health, /ping, /alive
 * on the main PORT, so this file is NOT needed on Render, Railway, or VPS.
 *
 * Only use this if you host the bot WITHOUT the dashboard enabled.
 * To activate: require('./keep-alive.js') in  or index.js
 */

const http = require('http');
const PORT = process.env.HEALTH_PORT || process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/' || req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.on('error', () => {});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[keep-alive] Health server running on port ${PORT}`);
});

module.exports = server;
