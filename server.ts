import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Telegram Bot Token provided by the user
const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "8881531711:AAGsngAAURWQa2o3kpzsRDVG-VtL1dYvt0A";
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Convert raw 16-bit linear PCM buffer to standard 44-byte RIFF WAV format
function pcmToWavBuffer(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM subchunk size
  header.writeUInt16LE(1, 20); // Audio format 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Fallback harmonic voice synthesis in Node when API key is unavailable
function generateFallbackVoiceWav(
  text: string,
  voice: string = "female",
  speed: number = 1.0,
  pitch: number = 0
): Buffer {
  const sampleRate = 24000;
  const words = text.trim().split(/\s+/).length;
  const duration = Math.max(1.8, Math.min(20, words / (2.2 * (speed || 1.0))));
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(numSamples * 2);

  let baseFreq = 160;
  if (voice === "female") baseFreq = 225;
  if (voice === "cute_girl") baseFreq = 285;
  if (voice === "deep") baseFreq = 95;
  if (voice === "male") baseFreq = 130;

  baseFreq *= Math.pow(2, (pitch || 0) / 12);
  let phase = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const cadence = Math.sin(2 * Math.PI * 3.4 * t * (speed || 1.0));
    const envelope =
      Math.max(0, Math.sin((i / numSamples) * Math.PI)) * (0.6 + 0.4 * cadence);
    const s1 = Math.sin(phase);
    const s2 = 0.5 * Math.sin(phase * 2);
    const s3 = 0.25 * Math.sin(phase * 3);
    const sampleVal = Math.max(-1, Math.min(1, (s1 + s2 + s3) * 0.4 * envelope));
    const int16Val = Math.round(sampleVal * 32767);
    buffer.writeInt16LE(int16Val, i * 2);

    const vibrato = 1 + 0.012 * Math.sin(2 * Math.PI * 5 * t);
    phase += (2 * Math.PI * baseFreq * vibrato) / sampleRate;
  }

  return pcmToWavBuffer(buffer, sampleRate, 1, 16);
}

// Voice map to Gemini prebuilt voices
const VOICE_MAP: Record<
  string,
  { voiceName: string; gender: string; title: string; bengaliName: string }
> = {
  female: { voiceName: "Kore", gender: "Female", title: "Farhana", bengaliName: "ফারহানা" },
  male: { voiceName: "Charon", gender: "Male", title: "Kabir", bengaliName: "কবির" },
  cute_girl: { voiceName: "Puck", gender: "Female", title: "Rodela", bengaliName: "রোদেলা" },
  deep: { voiceName: "Fenrir", gender: "Male", title: "Iqbal", bengaliName: "ইকবাল" },
};

// Emotion style guidance for TTS prompt
const EMOTION_PROMPTS: Record<string, string> = {
  normal: "Speak in a natural, clear, balanced, and professional conversational tone.",
  happy: "Speak with warm joy, a cheerful smile in the voice, upbeat energy, and bright enthusiasm.",
  sad: "Speak in a gentle, soft, melancholic, reflective, and sorrowful emotional tone.",
  angry: "Speak with sharp intensity, firm assertiveness, dramatic passion, and stern emotion.",
  excited: "Speak with high energy, thrilling excitement, vivid enthusiasm, and passionate delight.",
};

interface SynthesisParams {
  text: string;
  voice?: string;
  emotion?: string;
  language?: string;
  autoTranslate?: boolean;
  speed?: number;
  pitch?: number;
}

// Unified speech synthesis service for both HTTP API and Telegram Bot
async function synthesizeSpeech(params: SynthesisParams): Promise<{
  wavBuffer: Buffer;
  spokenText: string;
  bengaliText: string;
  voiceConfig: (typeof VOICE_MAP)[string];
  isFallback: boolean;
}> {
  const {
    text,
    voice = "female",
    emotion = "normal",
    language = "bn",
    autoTranslate = true,
    speed = 1.0,
    pitch = 0,
  } = params;

  const voiceConfig = VOICE_MAP[voice] || VOICE_MAP.female;
  let speechText = text.trim();
  let bengaliScript = speechText;
  const isBengaliAlphabet = /[\u0980-\u09FF]/.test(speechText);
  const ai = getAI();

  // If Gemini is available, attempt translation and high quality TTS
  if (ai) {
    if (language === "bn" && !isBengaliAlphabet && autoTranslate) {
      try {
        const transResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Translate and adapt this text into natural, modern, colloquial Bangladeshi Bengali (বাংলা) for speech synthesis. Output ONLY the Bengali text without markdown or commentary:\n"${speechText}"`,
        });
        const translated = transResponse.text?.trim();
        if (translated) {
          bengaliScript = translated;
          speechText = translated;
        }
      } catch (e) {
        console.warn("Auto-translation error:", e);
      }
    }

    try {
      const emotionInstruction = EMOTION_PROMPTS[emotion] || EMOTION_PROMPTS.normal;
      const speechPrompt =
        language === "bn"
          ? `${emotionInstruction} Say the following Bengali words with natural cadence and clear Bangladeshi pronunciation: ${speechText}`
          : `${emotionInstruction} Say the following text with human cadence and natural pronunciation: ${speechText}`;

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: speechPrompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceConfig.voiceName },
            },
          },
        },
      });

      const part = ttsResponse.candidates?.[0]?.content?.parts?.[0];
      const rawData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

      if (rawData) {
        const pcmBuffer = Buffer.from(rawData, "base64");
        const sampleRate = mimeType.includes("16000") ? 16000 : 24000;
        const wavBuffer = pcmToWavBuffer(pcmBuffer, sampleRate, 1, 16);
        return {
          wavBuffer,
          spokenText: speechText,
          bengaliText: bengaliScript,
          voiceConfig,
          isFallback: false,
        };
      }
    } catch (err) {
      console.warn("Gemini TTS failed, using fallback synthesizer:", err);
    }
  }

  // Resilient fallback audio synthesis
  const fallbackWav = generateFallbackVoiceWav(speechText, voice, speed, pitch);
  return {
    wavBuffer: fallbackWav,
    spokenText: speechText,
    bengaliText: bengaliScript,
    voiceConfig,
    isFallback: true,
  };
}

// --------------------------------------------------------------------------
// TELEGRAM BOT ENGINE
// --------------------------------------------------------------------------
interface TelegramBotStats {
  connected: boolean;
  isPolling: boolean;
  botId: number | null;
  username: string | null;
  firstName: string | null;
  totalMessagesProcessed: number;
  totalVoicesGenerated: number;
  startedAt: number;
  lastActive: number | null;
  recentLogs: Array<{
    id: string;
    user: string;
    text: string;
    voice: string;
    emotion: string;
    timestamp: number;
    success: boolean;
  }>;
}

const botStats: TelegramBotStats = {
  connected: false,
  isPolling: false,
  botId: null,
  username: null,
  firstName: null,
  totalMessagesProcessed: 0,
  totalVoicesGenerated: 0,
  startedAt: Date.now(),
  lastActive: null,
  recentLogs: [],
};

// User-specific preference memory: Map<chatId, { voice, emotion, speed, pitch }>
const userPreferences = new Map<
  number,
  { voice: string; emotion: string; speed: number; pitch: number }
>();

async function callTelegramApi(endpoint: string, body?: any): Promise<any> {
  const url = `${TELEGRAM_API_BASE}/${endpoint}`;
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers:
      body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : undefined,
    body:
      body instanceof FormData
        ? body
        : body
        ? JSON.stringify(body)
        : undefined,
  });
  return response.json();
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    await callTelegramApi("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    });
  } catch (err) {
    console.error(`Failed to send Telegram message to ${chatId}:`, err);
  }
}

async function sendTelegramVoiceAudio(
  chatId: number,
  wavBuffer: Buffer,
  caption: string,
  title: string,
  performer: string
) {
  try {
    // Send action: record_voice
    await callTelegramApi("sendChatAction", {
      chat_id: chatId,
      action: "record_voice",
    });

    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    formData.append("audio", blob, "lyuna-voice.wav");
    formData.append("caption", caption);
    formData.append("title", title);
    formData.append("performer", performer);

    const result = await fetch(`${TELEGRAM_API_BASE}/sendAudio`, {
      method: "POST",
      body: formData,
    });
    return await result.json();
  } catch (err) {
    console.error("Failed to send audio to Telegram:", err);
    throw err;
  }
}

// Handle an incoming Telegram message
async function handleTelegramMessage(message: any) {
  if (!message || !message.chat || !message.text) return;

  const chatId = message.chat.id;
  const fromUser = message.from?.first_name || message.from?.username || "User";
  const rawText = message.text.trim();

  botStats.totalMessagesProcessed++;
  botStats.lastActive = Date.now();

  const userPrefs = userPreferences.get(chatId) || {
    voice: "female",
    emotion: "normal",
    speed: 1.0,
    pitch: 0,
  };

  // 1. /start or /help
  if (rawText.startsWith("/start") || rawText.startsWith("/help")) {
    const welcome = `👋 <b>স্বাগতম ${fromUser}!</b>\nআমি <b>Lyuna Voice AI (@Lyunavoiceai71_bot)</b>-এর অফিশিয়াল এআই ভয়েস অ্যাসিস্ট্যান্ট।\n\n🎙️ <b>আমি কি করতে পারি:</b>\nযেকোনো বাংলা বা ইংরেজি টেক্সট আমাকে লিখে পাঠান, আমি মুহূর্তেই প্রাকৃতিক ও স্পষ্ট বাংলা কণ্ঠে (AI Voice) রূপান্তর করে অডিও পাঠিয়ে দেব!\n\n⚙️ <b>কমান্ডসমূহ:</b>\n👉 <code>/voice</code> - ভয়েস মডেল পরিবর্তন (ফারহানা, কবির, রোদেলা, ইকবাল)\n👉 <code>/emotion</code> - আবেগ ও সুর নির্বাচন\n👉 <code>/settings</code> - বর্তমান সেটিংস দেখুন\n👉 <code>/webapp</code> - Lyuna Voice AI ওয়েব অ্যাপ লিঙ্ক\n\n<i>এখনই যেকোনো টেক্সট লিখে পাঠান এবং ম্যাজিক দেখুন!</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "👩 ফারহানা (Farhana)", callback_data: "set_voice_female" },
          { text: "👨 কবির (Kabir)", callback_data: "set_voice_male" },
        ],
        [
          { text: "👧 রোদেলা (Rodela)", callback_data: "set_voice_cute_girl" },
          { text: "🎙️ ইকবাল (Iqbal)", callback_data: "set_voice_deep" },
        ],
        [
          { text: "🌐 Open Web App", url: process.env.APP_URL || "https://ai.studio" },
        ],
      ],
    };

    await sendTelegramMessage(chatId, welcome, keyboard);
    return;
  }

  // 2. /voice command
  if (rawText.startsWith("/voice")) {
    const parts = rawText.split(/\s+/);
    if (parts.length > 1) {
      const selected = parts[1].toLowerCase();
      if (VOICE_MAP[selected]) {
        userPrefs.voice = selected;
        userPreferences.set(chatId, userPrefs);
        const v = VOICE_MAP[selected];
        await sendTelegramMessage(
          chatId,
          `✅ <b>ভয়েস পরিবর্তন সফল!</b>\nনির্বাচিত কণ্ঠ: <b>${v.title} (${v.bengaliName})</b>\n\nএখন আপনার টেক্সট পাঠান, এই কণ্ঠে ভয়েস তৈরি করা হবে।`
        );
        return;
      }
    }

    const voiceGuide = `🎙️ <b>ভয়েস নির্বাচন করুন:</b>\n1. <code>/voice female</code> - <b>ফারহানা (Farhana)</b>: প্রাকৃতিক ও স্পষ্ট\n2. <code>/voice male</code> - <b>কবির (Kabir)</b>: প্রফেশনাল বাচিকশিল্পী\n3. <code>/voice cute_girl</code> - <b>রোদেলা (Rodela)</b>: মিষ্টি ও প্রাণবন্ত তরুণী\n4. <code>/voice deep</code> - <b>ইকবাল (Iqbal)</b>: গম্ভীর ও সিনেমাটিক কণ্ঠ\n\nউদাহরণ: <code>/voice female</code>`;
    await sendTelegramMessage(chatId, voiceGuide);
    return;
  }

  // 3. /emotion command
  if (rawText.startsWith("/emotion")) {
    const parts = rawText.split(/\s+/);
    if (parts.length > 1) {
      const emo = parts[1].toLowerCase();
      if (EMOTION_PROMPTS[emo]) {
        userPrefs.emotion = emo;
        userPreferences.set(chatId, userPrefs);
        await sendTelegramMessage(
          chatId,
          `🎭 <b>আবেগ পরিবর্তন সফল!</b>\nবর্তমান আবেগ: <b>${emo.toUpperCase()}</b>\n\nএখন টেক্সট পাঠান!`
        );
        return;
      }
    }

    const emotionGuide = `🎭 <b>আবেগ ও সুর নির্বাচন করুন:</b>\n👉 <code>/emotion normal</code> - স্বাভাবিক (Balanced)\n👉 <code>/emotion happy</code> - আনন্দিত (Happy & Joyful)\n👉 <code>/emotion sad</code> - বেদনাবিধুর (Sad & Touching)\n👉 <code>/emotion angry</code> - তীব্র বা রাগান্বিত (Intense/Angry)\n👉 <code>/emotion excited</code> - রোমাঞ্চিত (Excited)`;
    await sendTelegramMessage(chatId, emotionGuide);
    return;
  }

  // 4. /settings command
  if (rawText.startsWith("/settings")) {
    const v = VOICE_MAP[userPrefs.voice] || VOICE_MAP.female;
    const settingsMsg = `⚙️ <b>বর্তমান সেটিংস:</b>\nকণ্ঠ: <b>${v.title} (${v.bengaliName})</b>\nআবেগ: <b>${userPrefs.emotion}</b>\nগতি: <b>${userPrefs.speed}x</b>\nইঞ্জিন: <b>Lyuna Voice AI Studio</b>\n\nপরিবর্তন করতে <code>/voice</code> অথবা <code>/emotion</code> কমান্ড ব্যবহার করুন।`;
    await sendTelegramMessage(chatId, settingsMsg);
    return;
  }

  // 5. /webapp command
  if (rawText.startsWith("/webapp")) {
    const url = process.env.APP_URL || "https://ai.studio";
    await sendTelegramMessage(
      chatId,
      `🌐 <b>Lyuna Voice AI ওয়েব অ্যাপ লিঙ্ক:</b>\n<a href="${url}">${url}</a>\n\nওয়েব অ্যাপে ফুল স্পিড, পিচ ও স্টুডিও অডিও প্লেয়ার ব্যবহার করতে পারবেন!`
    );
    return;
  }

  // 6. Regular text message -> Synthesize voice and send back as audio!
  try {
    const v = VOICE_MAP[userPrefs.voice] || VOICE_MAP.female;
    const result = await synthesizeSpeech({
      text: rawText,
      voice: userPrefs.voice,
      emotion: userPrefs.emotion,
      language: "bn",
      autoTranslate: true,
      speed: userPrefs.speed,
      pitch: userPrefs.pitch,
    });

    const caption = `কণ্ঠ: ${v.bengaliName} (${v.title}) | আবেগ: ${userPrefs.emotion}\nপরিবেশনায়: Lyuna Voice AI (@Lyunavoiceai71_bot)`;
    const title = `Lyuna - ${rawText.slice(0, 24)}...`;
    const performer = `${v.title} (${v.bengaliName})`;

    await sendTelegramVoiceAudio(
      chatId,
      result.wavBuffer,
      caption,
      title,
      performer
    );

    botStats.totalVoicesGenerated++;
    botStats.recentLogs.unshift({
      id: `log-${Date.now()}`,
      user: fromUser,
      text: rawText.slice(0, 60),
      voice: v.title,
      emotion: userPrefs.emotion,
      timestamp: Date.now(),
      success: true,
    });
    if (botStats.recentLogs.length > 20) {
      botStats.recentLogs.pop();
    }
  } catch (err: any) {
    console.error("Error generating/sending Telegram voice:", err);
    await sendTelegramMessage(
      chatId,
      `⚠️ দুঃখিত, ভয়েস তৈরিতে সমস্যা হয়েছে: ${err.message || "Unknown error"}`
    );
    botStats.recentLogs.unshift({
      id: `log-${Date.now()}`,
      user: fromUser,
      text: rawText.slice(0, 60),
      voice: userPrefs.voice,
      emotion: userPrefs.emotion,
      timestamp: Date.now(),
      success: false,
    });
  }
}

// Handle callback queries from inline buttons
async function handleTelegramCallback(callbackQuery: any) {
  if (!callbackQuery || !callbackQuery.data) return;
  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;

  if (chatId && data.startsWith("set_voice_")) {
    const chosenVoice = data.replace("set_voice_", "");
    if (VOICE_MAP[chosenVoice]) {
      const userPrefs = userPreferences.get(chatId) || {
        voice: "female",
        emotion: "normal",
        speed: 1.0,
        pitch: 0,
      };
      userPrefs.voice = chosenVoice;
      userPreferences.set(chatId, userPrefs);
      const v = VOICE_MAP[chosenVoice];

      await callTelegramApi("answerCallbackQuery", {
        callback_query_id: callbackQuery.id,
        text: `কণ্ঠ নির্বাচিত: ${v.title} (${v.bengaliName})`,
      });

      await sendTelegramMessage(
        chatId,
        `✅ <b>নির্বাচিত কণ্ঠ:</b> ${v.title} (${v.bengaliName})!\nএখন যেকোনো টেক্সট লিখুন, সাথে সাথে অডিও পাবেন।`
      );
    }
  }
}

// Long polling background worker
async function startTelegramPolling() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN is not configured.");
    return;
  }

  try {
    const me = await callTelegramApi("getMe");
    if (me.ok && me.result) {
      botStats.connected = true;
      botStats.botId = me.result.id;
      botStats.username = me.result.username;
      botStats.firstName = me.result.first_name;
      botStats.isPolling = true;
      console.log(
        `Telegram bot connected successfully: @${botStats.username} (${botStats.firstName})`
      );
    } else {
      console.warn("Telegram getMe failed:", me);
      botStats.connected = false;
    }
  } catch (err) {
    console.warn("Failed to initialize Telegram bot:", err);
  }

  let offset = 0;
  const pollLoop = async () => {
    while (true) {
      try {
        const res = await callTelegramApi(
          `getUpdates?offset=${offset}&timeout=20&allowed_updates=["message","callback_query"]`
        );
        if (res.ok && Array.isArray(res.result)) {
          for (const update of res.result) {
            offset = Math.max(offset, update.update_id + 1);
            if (update.message) {
              await handleTelegramMessage(update.message);
            } else if (update.callback_query) {
              await handleTelegramCallback(update.callback_query);
            }
          }
        }
      } catch (err: any) {
        // Sleep on error to avoid hot looping
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      // Small tick delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  pollLoop().catch((err) => console.error("Telegram polling error:", err));
}

// --------------------------------------------------------------------------
// REST API ENDPOINTS
// --------------------------------------------------------------------------

// Health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    telegramBot: {
      connected: botStats.connected,
      username: botStats.username,
    },
  });
});

// Telegram Bot Status Endpoint for Dashboard
app.get("/api/telegram/status", async (_req: Request, res: Response) => {
  // If not yet verified, attempt a quick getMe
  if (!botStats.username && TELEGRAM_BOT_TOKEN) {
    try {
      const me = await callTelegramApi("getMe");
      if (me.ok && me.result) {
        botStats.connected = true;
        botStats.botId = me.result.id;
        botStats.username = me.result.username;
        botStats.firstName = me.result.first_name;
      }
    } catch {}
  }

  res.json({
    ...botStats,
    botLink: botStats.username ? `https://t.me/${botStats.username}` : "https://t.me/Lyunavoiceai71_bot",
    activeUsersCount: userPreferences.size,
  });
});

// Telegram webhook endpoint (alternative to polling)
app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
  const update = req.body;
  res.json({ ok: true });
  if (update?.message) {
    handleTelegramMessage(update.message).catch(console.error);
  } else if (update?.callback_query) {
    handleTelegramCallback(update.callback_query).catch(console.error);
  }
});

// Text translation/optimization endpoint
app.post("/api/translate-text", async (req: Request, res: Response) => {
  try {
    const { text, targetLang = "bn" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({ translatedText: text, isFallback: true });
    }

    const prompt =
      targetLang === "bn"
        ? `Translate and adapt the following text into natural, fluent, colloquial Bangladeshi Bengali (বাংলা) for speech synthesis. Text:\n"${text}"\n\nOutput ONLY the Bengali translation, nothing else.`
        : `Translate the following text into natural, fluent English. Text:\n"${text}"\n\nOutput ONLY the English translation, nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const translatedText = response.text?.trim() || text;
    res.json({ translatedText });
  } catch (err: any) {
    console.error("Translation error:", err);
    res.status(500).json({ error: err.message || "Translation failed" });
  }
});

// Main speech generation endpoint
app.post("/api/generate-speech", async (req: Request, res: Response) => {
  try {
    const {
      text,
      voice = "female",
      emotion = "normal",
      language = "bn",
      autoTranslate = true,
      speed = 1.0,
      pitch = 0,
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const result = await synthesizeSpeech({
      text,
      voice,
      emotion,
      language,
      autoTranslate,
      speed,
      pitch,
    });

    const base64Audio = result.wavBuffer.toString("base64");
    const mimeType = "audio/wav";

    return res.json({
      audioData: `data:${mimeType};base64,${base64Audio}`,
      rawBase64: base64Audio,
      mimeType,
      spokenText: result.spokenText,
      bengaliText: result.bengaliText,
      voice: result.voiceConfig,
      emotion,
      speed,
      pitch,
      isFallback: result.isFallback,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("TTS generation error:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate speech",
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lyuna Voice AI server listening on http://0.0.0.0:${PORT}`);
    // Boot telegram bot polling
    startTelegramPolling();
  });
}

startServer();
