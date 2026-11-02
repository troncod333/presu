import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/gemini/calculate', async (req, res) => {
    try {
      const { projectType, measurements, quality, address } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(503).json({ error: 'GEMINI_API_KEY no configurada. Usando motor local de cálculo.' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI();
      const prompt = `Actúa como un Ingeniero Constructor y Cubilador Senior en Chile.
Genera la cubicación y presupuesto detallado para una obra en Chile:
- Especialidad / Tipo de obra: ${projectType}
- Dimensiones y medidas: ${JSON.stringify(measurements || {})}
- Calidad de materiales: ${quality || 'medio'}
- Ubicación / Comuna: ${address || 'Santiago, Chile'}

REGLA CRÍTICA DE CANTIDADES:
- Para artefactos, accesorios y elementos contables (enchufes, interruptores, focos/luminarias, cámaras, puertas, artefactos de baño, disyuntores, etc. o unidad "un", "pza", "tira", "saco", "rollo"), la propiedad 'quantity' DEBE ser estrictamente un número ENTERO positivo (ejemplo: 6, NO 6.5).
- Para medidas continuas superficiales o lineales (m², m, m³), puede ser decimal con máximo 1 decimal (ejemplo: 15.5).

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "materials": [
    {
      "name": "Nombre comercial del producto en ferreterías chilenas (Sodimac/Easy/Chilemat)",
      "unit": "un | m² | saco | tira | rollo | galon | tineta",
      "basePrice": 12345 (en pesos chilenos CLP sin puntos),
      "quantity": 10 (entero para artefactos/unidades contables),
      "category": "Estructura | Revestimiento | Conductores | Artefactos | Iluminación | etc.",
      "reasoning": "Breve explicación técnica del rendimiento o merma"
    }
  ],
  "technicalAdvice": "Normativa técnica chilena aplicable (MINVU, SEC, NCh) y consejo de instalación.",
  "safetyNote": "Recomendación de seguridad y EPP para los maestros.",
  "savingTips": "Consejo de compra inteligente en distribuidoras mayoristas.",
  "estimatedLaborMultiplier": 0.45
}`;

      let responseText = '';
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let lastError = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`Model ${model} failed, trying next:`, mErr?.message || mErr);
        }
      }

      if (!responseText) {
        throw lastError || new Error('No se pudo generar contenido con IA');
      }

      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error en /api/gemini/calculate:', error);
      return res.status(500).json({ error: error.message || 'Error al procesar con IA Gemini' });
    }
  });

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
    console.log(`Cubicador Pro running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
