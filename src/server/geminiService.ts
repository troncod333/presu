import { GoogleGenAI, Type } from "@google/genai";

export interface CalculateMaterialsParams {
  projectType: string;
  measurements: Record<string, number>;
  quality: 'bajo' | 'medio' | 'premium';
  address?: string;
}

export interface CalculatedMaterial {
  name: string;
  unit: string;
  basePrice: number; // in CLP
  quantity: number;
  reasoning?: string;
  category?: string;
}

export interface AICalculationResponse {
  materials: CalculatedMaterial[];
  technicalAdvice: string;
  safetyNote: string;
  savingTips: string;
  estimatedLaborMultiplier: number;
}

export async function calculateMaterialsWithGemini(
  params: CalculateMaterialsParams
): Promise<AICalculationResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurado en las variables de entorno.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const prompt = `
Eres un experto maestro de obras y cubicador profesional de construcción e instalaciones en Chile (año 2025).
Calcula con precisión los materiales necesarios y precios de referencia en Pesos Chilenos (CLP) para el siguiente proyecto:

- Tipo de Proyecto: ${params.projectType.toUpperCase()}
- Medidas y parámetros ingresados: ${JSON.stringify(params.measurements)}
- Calidad de Materiales seleccionada: ${params.quality} (bajo: económico/alternativo, medio: estándar marca reconocida Sodimac/Construmart, premium: marcas tope de gama)
- Ubicación aproximada: ${params.address || 'Santiago, Chile'}

Instrucciones:
1. Calcula la lista exacta de materiales necesarios incluyendo un margen razonable de merma (5-10%).
2. Proporciona precios base por unidad realistas del mercado chileno actual (2025) en CLP sin puntos ni comas (ej. 4500 para $4.500 CLP).
3. Añade explicaciones técnicas cortas, normativa chilena aplicable (ej. SEC para electricidad/gas, MINVU para construcción/ampliaciones) y consejos de ahorro.
4. Devuelve los resultados en el formato JSON especificado.
  `;

  const config = {
    systemInstruction:
      "Eres un software especialista en cubicar obras y presupuestar proyectos en Chile. Responde strictly en formato JSON de acuerdo con el esquema proporcionado.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        materials: {
          type: Type.ARRAY,
          description: "Lista de materiales necesarios para la obra",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nombre del material (ej. Cable 2.5mm² THHN, Cemento Melón 25kg)" },
              unit: { type: Type.STRING, description: "Unidad de medida (ej. metro, saco, m², unidad, galón, bolsa, plancha)" },
              basePrice: { type: Type.NUMBER, description: "Precio unitario estimado en CLP (ej. 4500)" },
              quantity: { type: Type.NUMBER, description: "Cantidad calculada necesaria" },
              reasoning: { type: Type.STRING, description: "Motivo del cálculo o merma incluida" },
              category: { type: Type.STRING, description: "Categoría del material" }
            },
            required: ["name", "unit", "basePrice", "quantity"]
          }
        },
        technicalAdvice: {
          type: Type.STRING,
          description: "Recomendaciones técnicas y normativa SEC/MINVU aplicable en Chile"
        },
        safetyNote: {
          type: Type.STRING,
          description: "Medidas de seguridad e inspección previa requeridas"
        },
        savingTips: {
          type: Type.STRING,
          description: "Consejo práctico para optimizar presupuesto o evitar desperdicio"
        },
        estimatedLaborMultiplier: {
          type: Type.NUMBER,
          description: "Porcentaje estimado mano de obra sobre total materiales (ej. 0.40 para 40%)"
        }
      },
      required: ["materials", "technicalAdvice", "safetyNote", "savingTips"]
    }
  };

  const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const jsonText = response.text || "{}";
        const parsed = JSON.parse(jsonText) as AICalculationResponse;
        if (parsed && Array.isArray(parsed.materials)) {
          return parsed;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Attempt ${attempt} with model '${model}' failed:`, err?.message || err);
        // Wait before retrying (1s, 2s) if it's a transient 503 or 429
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }
  }

  throw lastError || new Error("Servidor ocupado. Por favor intenta de nuevo en un momento.");
}
