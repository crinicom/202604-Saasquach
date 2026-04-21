import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Gemini AI (AI Studio)
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const body = await req.json();
    const { phase, state, context } = body;
    
    const activeContext = context || (state && state.context) || {};
    console.log(`[AI ROUTE] Processing phase: ${phase} using Google Generative AI`);

    // Inicializar Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Lista de modelos a intentar (priorizando 1.5 Flash por velocidad)
    const MODELS_TO_TRY = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    
    let lastError: any = null;
    let modelResponse: any = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`[AI ROUTE] Attempting with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        let prompt = '';
        if (phase === 'CONVERGENCE') {
          prompt = `Analyze the following 'WHY' responses for the problem: ${state?.problemStatement || 'Operational Improvement'}.
          Generate 3-5 deep root causes as an organizational oracle.
          Responses: ${JSON.stringify(activeContext.whyResponses || [])}
          Respond ONLY in JSON format: { "rootCauses": [ { "id", "text", "description" } ] }`;
        } else if (phase === 'DESIGN') {
          prompt = `Based on selected root cause: ${activeContext.selectedRootCause?.text || 'Systemic friction'}, 
          generate a professional MermaidJS flowchart for an optimized clinical process.
          Respond ONLY in JSON format: { "mermaid": "graph TD\\n..." }`;
        } else {
          prompt = `Analyze this ritual state and provide collective intelligence insights: ${JSON.stringify(activeContext)}`;
        }

        const result = await model.generateContent(prompt);
        modelResponse = result.response;
        console.log(`[AI ROUTE] Success with model: ${modelName}`);
        break; 
      } catch (err: any) {
        console.warn(`[AI ROUTE] Model ${modelName} failed:`, err.message);
        lastError = err;
        continue;
      }
    }

    if (!modelResponse) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    }

    const text = modelResponse.text();
    // Limpiar posibles bloques de markdown
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('[AI ROUTE] JSON parse error from AI:', text);
      return NextResponse.json({ error: 'AI returned invalid JSON format', raw: text }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[AI ROUTE] Critical Error:', error);
    return NextResponse.json({ 
      error: error.message,
      detail: 'Ensure GEMINI_API_KEY is valid and has sufficient quota.'
    }, { status: 500 });
  }
}
