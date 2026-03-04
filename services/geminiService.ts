
import { GoogleGenAI, Type } from "@google/genai";
import { ProductionOrder } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProduction = async (orders: ProductionOrder[]) => {
  if (orders.length === 0) return "Nenhuma ordem para analisar.";

  const prompt = `Analise as seguintes ordens de produção e forneça um resumo executivo de gargalos, sugestões de priorização e dicas de eficiência:
  ${JSON.stringify(orders.map(o => ({
    id: o.id,
    produto: o.productName,
    qtd: o.quantity,
    prazo: o.deadline,
    status: o.status,
    prioridade: o.priority
  })))}`;

  try {
    const response = await ai.models.generateContent({
      // Upgrade to gemini-3-pro-preview for advanced reasoning and industrial consulting tasks
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor especialista em gestão industrial e lean manufacturing. Seja conciso e prático.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar análise inteligente.";
  }
};
