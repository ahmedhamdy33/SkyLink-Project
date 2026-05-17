import { createAssistantReply } from '../services/aiService.js';
import { AppError, asyncHandler } from '../utils/errors.js';

function normalizeMessage(message) {
  if (!message || typeof message !== 'object') {
    throw new AppError('Each message must be an object.', 400);
  }

  const role = message.role === 'assistant' ? 'assistant' : 'user';
  const content = String(message.content || '').trim();

  if (!content) {
    throw new AppError('Messages cannot be empty.', 400);
  }

  if (content.length > 3000) {
    throw new AppError('Each message must be 3000 characters or fewer.', 400);
  }

  return { role, content };
}

function validateMessages(body) {
  const messages = Array.isArray(body?.messages)
    ? body.messages
    : body?.message
      ? [{ role: 'user', content: body.message }]
      : null;

  if (!messages?.length) {
    throw new AppError('Send a message or a messages array.', 400);
  }

  if (messages.length > 12) {
    throw new AppError('Send at most 12 messages per request.', 400);
  }

  return messages.map(normalizeMessage);
}

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const messages = validateMessages(req.body);
  const reply = await createAssistantReply({ messages, userId: req.user?.id || req.user?.user_id || null });
  res.json(reply);
});
