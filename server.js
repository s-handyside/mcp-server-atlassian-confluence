const { exec } = require('child_process');

exec('node dist/index.js server --transport sse', (err, stdout, stderr) => {
  if (err) {
    console.error('MCP Server failed to start:', err);
    process.exit(1);
  }
  console.log(stdout);
  console.error(stderr);
});