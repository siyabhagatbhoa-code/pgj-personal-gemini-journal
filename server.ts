import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const currentFilename = typeof import.meta?.url === 'string' ? fileURLToPath(import.meta.url) : '';
const currentDirname = currentFilename ? path.dirname(currentFilename) : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Candidate models in preference order for fast, low-latency reflection
const PREFERRED_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];

async function generateFastGeminiContent(
  ai: GoogleGenAI,
  options: {
    contents: any;
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
  }
) {
  let lastError: unknown = null;

  for (const model of PREFERRED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
          responseMimeType: options.responseMimeType,
        },
      });
      return response;
    } catch (err: unknown) {
      lastError = err;
      console.warn(`Model ${model} encounter, attempting fallback:`, (err as Error)?.message || err);
    }
  }

  throw lastError;
}

// Cached secret key to avoid excessive Secret Manager calls
let cachedApiKey: string | null = null;

async function getGeminiApiKey(): Promise<string> {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  // 1. Primary: process.env.GEMINI_API_KEY (injected by environment / AI Studio)
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0 && envKey !== 'MY_GEMINI_API_KEY') {
    cachedApiKey = envKey.trim();
    return cachedApiKey;
  }

  // 2. Secondary fallback: Google Cloud Secret Manager if configured
  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const secretName = process.env.SECRET_NAME || 'gemini-api-key';

  if (projectId) {
    try {
      const client = new SecretManagerServiceClient();
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();
      if (payload) {
        console.log('Successfully fetched Gemini API key from Secret Manager');
        cachedApiKey = payload.trim();
        return cachedApiKey;
      }
    } catch (err: unknown) {
      console.warn('Secret Manager fetch failed:', (err as Error).message);
    }
  }

  throw new Error(
    'GEMINI_API_KEY is missing. Please configure it in your Settings panel or set up Google Cloud Secret Manager.'
  );
}

// Persona prompts for warm, reflective companion behavior
const PERSONA_PROMPTS: Record<string, string> = {
  sage: `You are "Mindful Sage", the contemplative journaling companion in PGJ (Personal Gemini Journal).
Your posture is Socratic, unhurried, serene, and steeped in mindful presence.
You avoid generic, clinical, or patronizing replies. Instead, you:
- Notice subtle emotions, shifts, and unspoken feelings in the writer's reflections.
- Ask gentle, evocative questions (e.g., "What space exists beneath this restlessness?").
- Reference specific details the user mentioned earlier in the conversation to maintain deep continuity.
- Speak in lyrical yet clear, grounded prose with mindful spaciousness.
- Never lecture, preach, or offer unsolicited advice; guide the user toward their own inner clarity.`,

  friend: `You are "Empathetic Friend", a warm, loving, and deeply attentive journaling companion in PGJ.
Your posture is non-judgmental embrace, sincere validation, and compassionate active listening.
You:
- Make the writer feel truly heard, held, and understood.
- Validate their emotional experience before gently wondering with them (e.g., "I hear how much care you poured into this.").
- Keep continuity by remembering what they shared previously in this journal session.
- Speak like a trusted soul confidant—warm, conversational, reassuring, never robotic.`,

  philosopher: `You are "Curious Philosopher", an inquisitive, perceptive companion in PGJ exploring existential wonder.
Your posture is epistemological curiosity, paradigm shifts, and exploring the roots of meaning.
You:
- Unpack assumptions with gentle wonder (e.g., "If this constraint dissolved, what emerges?").
- Help the user view their situations through alternative perspectives and philosophical metaphors.
- Weave in insights on time, choice, change, and presence.
- Keep the conversation multi-turn and deeply tethered to the writer's lived experience.`,

  coach: `You are "Concise Coach", a grounded, perceptive journaling partner in PGJ.
Your posture is clean brevity, somatic check-ins, structured clarity, and behavioral takeaways.
You:
- Cut through mental clutter with crisp, elegant brevity.
- Offer 2-3 tangible anchors or questions to ground their thinking.
- Encourage intentional next breaths and gentle somatic grounding.
- Maintain seamless context with previous entries in this session.`
};

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.GCP_PROJECT_ID)
  });
});

// Multi-turn AI reflection streaming endpoint (SSE for sub-second initial token delivery)
function getFallbackReflection(persona: string, lastUserMessage: string): string {
  const cleanMsg = (lastUserMessage || '').trim();
  const snippet = cleanMsg.length > 0 ? `"${cleanMsg.slice(0, 70)}${cleanMsg.length > 70 ? '...' : ''}"` : 'these reflections';

  if (persona === 'friend') {
    return `I hear how deeply you care about ${snippet}. Thank you for trusting this quiet sanctuary space with your honest thoughts. What part of this feels most important for your heart to hold right now?`;
  }
  if (persona === 'philosopher') {
    return `Reflecting on ${snippet} opens up such intriguing existential wonder. What underlying assumptions or quiet truths might be revealing themselves to you as you explore this?`;
  }
  if (persona === 'coach') {
    return `Thank you for bringing clear awareness to ${snippet}. Take a deep, grounding breath with this thought. What is one small, intentional step or anchor that can support you today?`;
  }
  // Default: Mindful Sage
  return `Thank you for bringing ${snippet} into this space of mindful presence. Beneath these words, notice what gentle stillness wants to emerge next. What would feel most restorative to explore together now?`;
}

// Multi-turn AI reflection streaming endpoint (SSE for sub-second initial token delivery)
app.post('/api/chat-stream', async (req, res) => {
  try {
    const { messages, persona = 'sage', userProfile = {}, depth = 'Balanced' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let apiKey = '';
    try {
      apiKey = await getGeminiApiKey();
    } catch {
      // API key missing or unconfigured fallback
    }

    if (!apiKey) {
      const lastMsg = messages[messages.length - 1]?.text || '';
      const fallbackReply = getFallbackReflection(persona, lastMsg);
      res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const ai = new GoogleGenAI({ apiKey });

    // Select system instruction base
    const basePersona = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.sage;
    const moniker = userProfile.moniker || userProfile.firstName || 'friend';
    const philosophy = userProfile.philosophy ? `\nThe user's personal philosophy: "${userProfile.philosophy}".` : '';

    const systemInstruction = `${basePersona}
Address the user respectfully, by their preferred moniker "${moniker}" when appropriate.${philosophy}
Depth preference: ${depth}.
Respond in 1-2 thoughtful, evocative, and grounded paragraphs (avoid overly lengthy essays so the writer can reflect organically in dialogue). If appropriate, close with one gentle question to invite their next reflection.`;

    // Format previous turns for Gemini multi-turn chat
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    let stream = null;
    for (const model of PREFERRED_MODELS) {
      try {
        stream = await ai.models.generateContentStream({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        break;
      } catch (err) {
        console.warn(`Streaming attempt with ${model} failed, checking fallback:`, (err as Error)?.message || err);
      }
    }

    if (!stream) {
      const lastMsg = messages[messages.length - 1]?.text || '';
      const fallbackReply = getFallbackReflection(persona, lastMsg);
      res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    console.error('Error in /api/chat-stream:', error);
    const lastMsg = req.body?.messages?.[req.body?.messages?.length - 1]?.text || '';
    const fallbackReply = getFallbackReflection(req.body?.persona || 'sage', lastMsg);
    res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Multi-turn AI reflection endpoint (JSON Fallback)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, persona = 'sage', userProfile = {}, depth = 'Balanced' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    let apiKey = '';
    try {
      apiKey = await getGeminiApiKey();
    } catch {
      // API key fallback
    }

    if (!apiKey) {
      const lastMsg = messages[messages.length - 1]?.text || '';
      const reply = getFallbackReflection(persona, lastMsg);
      return res.json({ reply });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Select system instruction base
    const basePersona = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.sage;
    const moniker = userProfile.moniker || userProfile.firstName || 'friend';
    const philosophy = userProfile.philosophy ? `\nThe user's personal philosophy: "${userProfile.philosophy}".` : '';

    const systemInstruction = `${basePersona}
Address the user respectfully, by their preferred moniker "${moniker}" when appropriate.${philosophy}
Depth preference: ${depth}.
Respond in 1-2 thoughtful, evocative, and grounded paragraphs (avoid overly lengthy essays so the writer can reflect organically in dialogue). If appropriate, close with one gentle question to invite their next reflection.`;

    // Format previous turns for Gemini multi-turn chat
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const response = await generateFastGeminiContent(ai, {
      contents: formattedContents,
      systemInstruction,
      temperature: 0.7,
    });

    const reply = response.text || getFallbackReflection(persona, messages[messages.length - 1]?.text || '');
    res.json({ reply });
  } catch (error: unknown) {
    console.error('Error in /api/chat:', error);
    const lastMsg = req.body?.messages?.[req.body?.messages?.length - 1]?.text || '';
    const reply = getFallbackReflection(req.body?.persona || 'sage', lastMsg);
    res.json({ reply });
  }
});

// Generate title & mood tag from the initial thought
app.post('/api/generate-title', async (req, res) => {
  try {
    const { initialText } = req.body;
    if (!initialText || typeof initialText !== 'string') {
      return res.status(400).json({ error: 'initialText is required.' });
    }

    const apiKey = await getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this first journal reflection:
"""
${initialText.slice(0, 1000)}
"""

Provide a JSON object with:
1. "title": A poetic, evocative 3-5 word title for this reflection session (no quotes, title case).
2. "moodTag": Exactly one of these mood tags: "Serene Clarity", "Quiet Twilight", "Gratitude", "Deep Wonder", "Inner Stillness", "Gentle Release", "Creative Flow", "Courage".

Output ONLY valid JSON matching this schema:
{"title": "...", "moodTag": "..."}`;

    const response = await generateFastGeminiContent(ai, {
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.3,
    });

    let result = { title: 'Quiet Reflection', moodTag: 'Serene Clarity' };
    try {
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title) result.title = parsed.title;
      if (parsed.moodTag) result.moodTag = parsed.moodTag;
    } catch {
      // Fallback
    }

    res.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/generate-title:', error);
    res.json({ title: 'Mindful Reflection', moodTag: 'Serene Clarity' });
  }
});

// Initialize Vite in dev or serve static files in production
async function startServer() {
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
    console.log(`PGJ Sanctuary Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
