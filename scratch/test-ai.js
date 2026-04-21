const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

async function testAI() {
  const project = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0585123825';
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  
  console.log('Project:', project);
  console.log('Location:', location);
  console.log('Credentials Path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-pro', 'gemini-1.0-pro'];
  
  for (const modelName of models) {
    console.log(`--- Testing model: ${modelName} ---`);
    try {
      const vertexAI = new VertexAI({ project, location });
      const model = vertexAI.getGenerativeModel({ model: modelName });
      
      console.log('Requesting content...');
      const result = await model.generateContent('Hola, responde solo "OK"');
      console.log(`SUCCESS with ${modelName}:`, result.response.candidates[0].content.parts[0].text);
      break; 
    } catch (error) {
      console.error(`FAILED with ${modelName}:`, error.message);
    }
  }
}

testAI();
