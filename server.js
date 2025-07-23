// server.js
const { serve } = require('./dist/index.js');

serve({ transport: 'sse' });