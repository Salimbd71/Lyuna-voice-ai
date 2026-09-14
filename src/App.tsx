import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { EmotionSelector } from './components/EmotionSelector';
import { ControlsPanel } from './components/ControlsPanel';
import { TextInputBox } from './components/TextInputBox';
import { AudioPlayer } from './components/AudioPlayer';
import { HistorySection } from './components/HistorySection';
import { TelegramBotCard } from './components/TelegramBotCard';
import {
  VoiceId,
  EmotionId,
  LanguageMode,
  GeneratedVoiceRecord,
} from './types';
import { VOICES, SAMPLE_PROMPTS } from './data/voices';
import {
  synthesizeClientFallbackAudio,
} from './utils/audioUtils';
import { Sparkles, Wand2, Loader2, AlertCircle, Headphones } from 'lucide-react';

export default function App() {
  // Theme state: dark by default as per ElevenLabs aesthetic
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('lyuna_theme');
    return saved ? saved === 'dark' : true;
  });

  // Settings & Input State
  const [text, setText] = useState<string>(SAMPLE_PROMPTS[0].text);
  const [voiceId, setVoiceId] = useState<VoiceId>('female');
  const [emotionId, setEmotionId] = useState<EmotionId>('normal');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  const [language, setLanguage] = useState<LanguageMode>('bn');
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);

  // Generation status & active audio record
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<GeneratedVoiceRecord | null>(null);
  const [history, setHistory] = useState<GeneratedVoiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('lyuna_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist theme
  useEffect(() => {
    localStorage.setItem('lyuna_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('lyuna_history', JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  }, [history]);

  const handleGenerateVoice = async () => {
    if (!text.trim()) {
      setErrorMessage('অনুগ্রহ করে কিছু টেক্সট লিখুন (Please enter some text).');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    const selectedVoiceObj = VOICES.find((v) => v.id === voiceId) || VOICES[0];

    try {
      // Step 1: Attempt server-side Gemini TTS API
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: voiceId,
          emotion: emotionId,
          language,
          autoTranslate,
          speed,
          pitch,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newRecord: GeneratedVoiceRecord = {
          id: `gen-${Date.now()}`,
          originalText: text.trim(),
          spokenText: data.spokenText || text.trim(),
          bengaliText: data.bengaliText,
          voiceId,
          voiceName: `${selectedVoiceObj.name} (${selectedVoiceObj.bengaliName})`,
          emotionId,
          speed,
          pitch,
          language,
          audioUrl: data.audioData,
          timestamp: Date.now(),
        };

        setCurrentRecord(newRecord);
        setHistory((prev) => [newRecord, ...prev]);
        setIsGenerating(false);
        return;
      }

      // If server returned an error (e.g. no API key configured yet)
      const errData = await response.json().catch(() => ({}));
      console.warn('Server TTS returned:', errData);

      // Fallback: Synthesize using Web Audio & client voice synthesis
      const fallbackResult = await synthesizeClientFallbackAudio(
        text.trim(),
        voiceId,
        speed,
        pitch
      );

      const fallbackRecord: GeneratedVoiceRecord = {
        id: `gen-fb-${Date.now()}`,
        originalText: text.trim(),
        spokenText: text.trim(),
        bengaliText: text.trim(),
        voiceId,
        voiceName: `${selectedVoiceObj.name} (${selectedVoiceObj.bengaliName})`,
        emotionId,
        speed,
        pitch,
        language,
        audioUrl: fallbackResult.audioUrl,
        duration: fallbackResult.duration,
        timestamp: Date.now(),
      };

      setCurrentRecord(fallbackRecord);
      setHistory((prev) => [fallbackRecord, ...prev]);

      if (errData.code === 'NO_API_KEY') {
        setErrorMessage(
          'Using high-fidelity client synthesizer. To unlock Gemini 3.1 Flash TTS, configure your GEMINI_API_KEY in the Settings > Secrets panel.'
        );
      }
    } catch (err: any) {
      console.warn('Network error, falling back to client synthesis:', err);
      // Client synthesizer fallback
      const fallbackResult = await synthesizeClientFallbackAudio(
        text.trim(),
        voiceId,
        speed,
        pitch
      );

      const fallbackRecord: GeneratedVoiceRecord = {
        id: `gen-fb-${Date.now()}`,
        originalText: text.trim(),
        spokenText: text.trim(),
        bengaliText: text.trim(),
        voiceId,
        voiceName: `${selectedVoiceObj.name} (${selectedVoiceObj.bengaliName})`,
        emotionId,
        speed,
        pitch,
        language,
        audioUrl: fallbackResult.audioUrl,
        duration: fallbackResult.duration,
        timestamp: Date.now(),
      };

      setCurrentRecord(fallbackRecord);
      setHistory((prev) => [fallbackRecord, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lyuna_history');
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentRecord?.id === id) {
      setCurrentRecord(null);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background Ambient Glow inspired by ElevenLabs purple-blue gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-25 ${
            isDark
              ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500'
              : 'bg-gradient-to-tr from-purple-400 via-indigo-300 to-blue-300 opacity-40'
          }`}
        />
        <div
          className={`absolute bottom-0 right-10 w-[500px] h-[350px] rounded-full blur-[120px] opacity-20 ${
            isDark ? 'bg-blue-600' : 'bg-purple-200'
          }`}
        />
      </div>

      {/* Main Navigation Header */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Studio Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* Hero Banner Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Bengali AI Voice Synthesis (বাংলা এআই ভয়েস)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-200 to-blue-400 bg-clip-text text-transparent">
            Lyuna Voice AI Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
            Convert English and Bengali text into natural human-like speech with full emotion,
            pitch, and speed controls. ElevenLabs aesthetic, studio-quality sound.
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Connected Telegram Bot Card */}
        <TelegramBotCard isDark={isDark} />

        {/* Studio Workspace Card */}
        <div
          className={`p-5 sm:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all ${
            isDark
              ? 'bg-slate-900/70 border-purple-900/30 shadow-purple-950/20'
              : 'bg-white/85 border-purple-100 shadow-purple-500/5'
          }`}
        >
          {/* Row 1: Voice Selector Dropdown */}
          <div className="mb-6">
            <VoiceSelector
              selectedVoiceId={voiceId}
              onSelectVoice={setVoiceId}
              isDark={isDark}
            />
          </div>

          {/* Row 2: Large Text Input Box */}
          <div className="mb-6">
            <TextInputBox
              text={text}
              onChangeText={setText}
              isDark={isDark}
              disabled={isGenerating}
            />
          </div>

          {/* Row 3: Emotion Selector Pills */}
          <div className="mb-6">
            <EmotionSelector
              selectedEmotionId={emotionId}
              onSelectEmotion={setEmotionId}
              isDark={isDark}
            />
          </div>

          {/* Row 4: Speed and Pitch Controls Panel */}
          <div className="mb-7">
            <ControlsPanel
              speed={speed}
              pitch={pitch}
              language={language}
              autoTranslate={autoTranslate}
              onSpeedChange={setSpeed}
              onPitchChange={setPitch}
              onAutoTranslateChange={setAutoTranslate}
              isDark={isDark}
            />
          </div>

          {/* Row 5: Primary "Generate Voice" Action Button */}
          <div>
            <button
              type="button"
              id="btn-generate-voice"
              onClick={handleGenerateVoice}
              disabled={isGenerating || !text.trim()}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl cursor-pointer ${
                isGenerating || !text.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ভয়েস তৈরি হচ্ছে... (Generating Voice...)</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Voice (ভয়েস তৈরি করুন)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section: ElevenLabs Audio Player (Visible when voice generated or active) */}
        {currentRecord && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Headphones className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Generated Audio Output (তৈরিকৃত অডিও)
              </h3>
            </div>
            <AudioPlayer currentRecord={currentRecord} isDark={isDark} />
          </div>
        )}

        {/* Generation History Drawer / List */}
        <HistorySection
          history={history}
          onSelectRecord={setCurrentRecord}
          onClearHistory={handleClearHistory}
          onDeleteRecord={handleDeleteRecord}
          activeId={currentRecord?.id}
          isDark={isDark}
        />
      </main>

      {/* Footer */}
      <footer
        className={`py-8 text-center text-xs border-t transition-colors mt-12 ${
          isDark
            ? 'border-slate-800 text-slate-500 bg-slate-950/60'
            : 'border-slate-200 text-slate-400 bg-white/60'
        }`}
      >
        <p>Lyuna Voice AI • ElevenLabs Style Bengali Voice Generator</p>
        <p className="mt-1 text-[11px] opacity-75">
          Powered by Gemini 3.1 Flash TTS • High Quality Bengali (বাংলা) & Multilingual Voices
        </p>
      </footer>
    </div>
  );
}
