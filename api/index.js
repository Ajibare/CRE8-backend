const app = require('../dist/index.js');
const expressApp = app.default || app;

// Vercel serverless handler
module.exports = (req, res) => {
  return expressApp(req, res);
};
