import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateMaterialsWithGemini } from './src/server/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// API route for Gemini materials calculation
app.post('/api/gemini/calculate', async (req, res) => {
  try {
    const result = await calculateMaterialsWithGemini(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/calculate:', err);
    res.status(500).json({ error: err.message || 'Error al calcular materiales' });
  }
});

// Serve static assets from dist in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
