const app = require('./src/app');
const PORT = 3000;

app.listen(PORT, '0.0.0.0',() => {
  console.log(`🚀 Medical Checkpoint API running at http://localhost:${PORT}`);
});
