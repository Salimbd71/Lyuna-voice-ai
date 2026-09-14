import React from 'react';
import { EmotionId } from '../types';
import { EMOTIONS } from '../data/voices';

interface EmotionSelectorProps {
  selectedEmotionId: EmotionId;
  onSelectEmotion: (id: EmotionId) => void;
  isDark: boolean;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotionId,
  onSelectEmotion,
  isDark,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Emotion & Tone (আবেগ ও সুর)
        </label>
        <span className="text-[11px] text-purple-400 font-medium">
          {EMOTIONS.find((e) => e.id === selectedEmotionId)?.description}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {EMOTIONS.map((emotion) => {
          const isSelected = emotion.id === selectedEmotionId;
          return (
            <button
              key={emotion.id}
              type="button"
              id={`emotion-btn-${emotion.id}`}
              onClick={() => onSelectEmotion(emotion.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-600/30 scale-[1.02]'
                  : isDark
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-purple-200'
              }`}
            >
              <span className="text-sm">{emotion.emoji}</span>
              <div className="flex flex-col items-start leading-tight">
                <span>{emotion.label}</span>
                <span className="text-[10px] opacity-80 font-normal">
                  {emotion.bengaliLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
