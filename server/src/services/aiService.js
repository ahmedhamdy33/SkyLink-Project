import { GoogleGenAI } from '@google/genai';
import { AppError } from '../utils/errors.js';
import { executeAiTool, geminiFunctionDeclarations } from './aiTools.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_TOOL_ROUNDS = 6;

const AIRLINE_ASSISTANT_INSTRUCTIONS = `
You are SkyLink's airline booking assistant.

Rules:
- Never invent flights, prices, booking policies, baggage rules, refunds, or schedules.
- Whenever real flight, route, price, or policy information is needed, call the provided tools first.
- If a prediction tool says it is a heuristic placeholder, say that clearly.
- Keep answers concise, warm, and trustworthy.
- Organize results with short sections or bullets when useful.
- When recommending the best option under a budget, explain why it fits the user's budget and priorities.
- When comparing flights, highlight the cheapest, fastest, and best availability if those facts are available.
- When the user asks for personal suggestions, use search history and booking history through the personalized recommendation tool.
`.trim();

let cachedClient;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('GEMINI_API_KEY is missing. Add it to server/.env before using the AI assistant.', 503);
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return cachedClient;
}

function getModel() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function buildConversationContents(messages) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
}

function getGenerateConfig() {
  return {
    systemInstruction: AIRLINE_ASSISTANT_INSTRUCTIONS,
    tools: [{ functionDeclarations: geminiFunctionDeclarations }]
  };
}

function getFunctionCalls(response) {
  return Array.isArray(response?.functionCalls) ? response.functionCalls : [];
}

function getOutputText(response) {
  if (typeof response?.text === 'string') return response.text.trim();

  const parts = response?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();
}

export async function createAssistantReply({ messages, userId = null }) {
  const client = getClient();
  const model = getModel();
  const toolResults = [];
  const contents = buildConversationContents(messages);
  const config = getGenerateConfig();
  let response = await client.models.generateContent({
    model,
    contents,
    config
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const functionCalls = getFunctionCalls(response);
    if (!functionCalls.length) break;

    const modelContent = response?.candidates?.[0]?.content;
    if (modelContent) {
      contents.push(modelContent);
    }

    const functionResponseParts = [];

    for (const toolCall of functionCalls) {
      const args = toolCall.args || {};

      try {
        const result = await executeAiTool(toolCall.name, args, { userId });
        toolResults.push({ name: toolCall.name, args, result });
        functionResponseParts.push({
          functionResponse: {
            name: toolCall.name,
            id: toolCall.id,
            response: { result }
          }
        });
      } catch (error) {
        toolResults.push({
          name: toolCall.name,
          args,
          error: error.message
        });
        functionResponseParts.push({
          functionResponse: {
            name: toolCall.name,
            id: toolCall.id,
            response: { error: error.message }
          }
        });
      }
    }

    contents.push({
      role: 'user',
      parts: functionResponseParts
    });

    response = await client.models.generateContent({
      model,
      contents,
      config
    });
  }

  const message = getOutputText(response);
  if (!message) {
    throw new AppError('The AI assistant did not return a usable response.', 502);
  }

  return {
    message,
    toolResults: toolResults.map((item) => ({
      name: item.name,
      args: item.args,
      result: item.result || null,
      error: item.error || null
    }))
  };
}
