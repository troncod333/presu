import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { calculateMaterialsWithGemini } from './src/server/geminiService';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

