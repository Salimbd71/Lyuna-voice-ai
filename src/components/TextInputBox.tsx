import React, { useState } from 'react';
import { SAMPLE_PROMPTS } from '../data/voices';
import { Clipboard, Trash2, Mic, MicOff, Sparkles } from 'lucide-react';

interface TextInputBoxProps {
  text: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  disabled?: boolean;
}

export const TextInputBox: React.FC<TextInputBoxProps> = ({
  text,
  onChangeText,
  isDark,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const maxChars = 2500;

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText.slice(0, maxChars));
      }
    } catch (e) {
      console.warn('Clipboard read error:', e);
    }
  };

  const handleClear = () => {
    onChangeText('');
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onChangeText(text ? `${text} ${transcript}` : transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Sample Prompt Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Quick Presets (নমুনা স্ক্রিপ্ট)
          </span>
          <span className="text-[11px] text-slate-400">Click to load</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              id={`sample-prompt-${idx}`}
              onClick={() => onChangeText(sample.text)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-purple-600 hover:text-white hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea Container */}
      <div
        className={`relative rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-500/20'
            : 'bg-white border-slate-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20'
        }`}
      >
        <textarea
          id="text-input-main"
          rows={5}
          value={text}
          disabled={disabled}
          onChange={(e) => onChangeText(e.target.value.slice(0, maxChars))}
          placeholder="এখানে বাংলা অথবা ইংরেজি টেক্সট লিখুন... (Type or paste Bengali or English script here to generate natural AI speech)"
          className={`w-full p-4 sm:p-5 rounded-2xl bg-transparent resize-y text-base sm:text-lg focus:outline-hidden font-normal leading-relaxed placeholder:text-slate-500 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        />

        {/* Toolbar Footer */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-t text-xs rounded-b-2xl ${
            isDark
              ? 'border-slate-800/80 bg-slate-950/40 text-slate-400'
              : 'border-slate-100 bg-slate-50/80 text-slate-500'
          }`}
        >
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              id="btn-paste-text"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              title="Paste text from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            <button
              type="button"
              id="btn-voice-input"
              onClick={toggleSpeechRecognition}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:bg-purple-500/10 hover:text-purple-400'
              }`}
              title="Voice dictation (Speak in Bengali)"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span className="font-semibold">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dictate Voice</span>
                </>
              )}
            </button>

            {text && (
              <button
                type="button"
                id="btn-clear-text"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                title="Clear input text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Character counter */}
          <div className="font-mono text-[11px]">
            <span
              className={
                text.length > maxChars * 0.9 ? 'text-amber-400 font-bold' : ''
              }
            >
              {text.length}
            </span>{' '}
            / {maxChars} chars
          </div>
        </div>
      </div>
    </div>
  );
};
