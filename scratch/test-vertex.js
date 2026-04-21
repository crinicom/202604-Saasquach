const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

// Configuración
const project = 'gen-lang-client-0585123825';
const location = 'us-central1';

// Establecer credenciales para la prueba
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../gen-lang-client-0585123825-ce150e9d867f.json');

async function testAI() {
  console.log(`[TEST] Inicializando Vertex AI para proyecto: ${project}`);
  console.log(`[TEST] Usando credenciales: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

  try {
    const vertexAI = new VertexAI({ project, location });
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = 'Hola, responde con la palabra "OK" si puedes leerme.';
    console.log(`[TEST] Enviando prompt: "${prompt}"`);

    const resp = await model.generateContent(prompt);
    const text = resp.response.candidates?.[0].content.parts?.[0].text || '';
    
    console.log(`[TEST] Respuesta recibida: "${text.trim()}"`);
    
    if (text.includes('OK')) {
      console.log('✅ PRUEBA EXITOSA: Vertex AI está funcionando correctamente.');
    } else {
      console.log('⚠️ RESPUESTA INESPERADA:', text);
    }
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:');
    if (error.message.includes('403') || error.message.includes('billing')) {
      console.error('BLOQUEO: La facturación (Billing) no está activada en este proyecto de Google Cloud.');
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testAI();
