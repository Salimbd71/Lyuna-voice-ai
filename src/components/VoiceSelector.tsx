import React, { useState } from 'react';
import { VoiceId, VoiceOption } from '../types';
import { VOICES } from '../data/voices';
import { ChevronDown, Check, Play, Square, Sparkles } from 'lucide-react';
import { synthesizeClientFallbackAudio } from '../utils/audioUtils';

interface VoiceSelectorProps {
  selectedVoiceId: VoiceId;
  onSelectVoice: (id: VoiceId) => void;
  isDark: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onSelectVoice,
  isDark,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewingId, setPreviewingId] = useState<VoiceId | null>(null);

  const currentVoice = VOICES.find((v) => v.id === selectedVoiceId) || VOICES[0];

  const handlePlayPreview = async (e: React.MouseEvent, voice: VoiceOption) => {
    e.stopPropagation();
    if (previewingId === voice.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPreviewingId(null);
      return;
    }

    setPreviewingId(voice.id);
    const sampleText = `নমস্কার! আমি ${voice.bengaliName}। Lyuna Voice AI-তে আপনাকে স্বাগতম।`;

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.pitch =
          voice.id === 'cute_girl' ? 1.4 : voice.id === 'deep' ? 0.75 : voice.id === 'female' ? 1.15 : 0.95;
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
        if (bnVoice) utterance.voice = bnVoice;
        utterance.onend = () => setPreviewingId(null);
        utterance.onerror = () => setPreviewingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        const { audioUrl } = await synthesizeClientFallbackAudio(sampleText, voice.id, 1.0, 0);
        const audio = new Audio(audioUrl);
        audio.onended = () => setPreviewingId(null);
        await audio.play();
      }
    } catch (err) {
      console.warn('Preview error:', err);
      setPreviewingId(null);
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
        AI Voice Model (কণ্ঠ নির্বাচন)
      </label>

      {/* Main Selected Voice Dropdown Trigger Card */}
      <div
        id="btn-voice-dropdown"
        className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 hover:border-purple-600/60 shadow-lg shadow-black/20'
            : 'bg-white border-slate-200 hover:border-purple-400 shadow-xs'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3.5 min-w-0 flex-1 text-left cursor-pointer focus:outline-hidden"
        >
          {/* Avatar */}
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${currentVoice.avatarBg} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}
          >
            {currentVoice.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {currentVoice.name} ({currentVoice.bengaliName})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/20">
                {currentVoice.persona}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {currentVoice.accent} • {currentVoice.gender}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Preview button */}
          <button
            type="button"
            onClick={(e) => handlePlayPreview(e, currentVoice)}
            title="Preview Voice Sample"
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
          >
            {previewingId === currentVoice.id ? (
              <Square className="w-4 h-4 fill-current animate-pulse" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle voice dropdown"
            className="p-1 rounded-lg text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-purple-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Voice Selection Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute top-full left-0 right-0 mt-2 z-50 p-2.5 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all ${
              isDark
                ? 'bg-slate-900/95 border-purple-900/40 text-slate-100'
                : 'bg-white/95 border-purple-100 text-slate-800 shadow-purple-500/10'
            }`}
          >
            <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select AI Speaker (4 Voices Available)</span>
              <span className="flex items-center gap-1 text-purple-500">
                <Sparkles className="w-3 h-3" />
                Human-Like Cadence
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {VOICES.map((voice) => {
                const isSelected = voice.id === selectedVoiceId;
                const isPreviewing = previewingId === voice.id;
                return (
                  <div
                    key={voice.id}
                    id={`voice-option-${voice.id}`}
                    onClick={() => {
                      onSelectVoice(voice.id);
                      setIsOpen(false);
                    }}
                    className={`relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/50'
                          : 'bg-purple-50 border-purple-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Badge */}
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${voice.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0`}
                      >
                        {voice.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm truncate">
                            {voice.name} ({voice.bengaliName})
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {voice.persona}
                        </p>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => handlePlayPreview(e, voice)}
                      title="Preview this voice"
                      className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 transition-colors ml-2 shrink-0"
                    >
                      {isPreviewing ? (
                        <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
