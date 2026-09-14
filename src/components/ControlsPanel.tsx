import React from 'react';
import { Gauge, Sliders, RotateCcw, Sparkles } from 'lucide-react';
import { LanguageMode } from '../types';

interface ControlsPanelProps {
  speed: number;
  pitch: number;
  language: LanguageMode;
  autoTranslate: boolean;
  onSpeedChange: (speed: number) => void;
  onPitchChange: (pitch: number) => void;
  onAutoTranslateChange: (autoTranslate: boolean) => void;
  isDark: boolean;
}

const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  speed,
  pitch,
  language,
  autoTranslate,
  onSpeedChange,
  onPitchChange,
  onAutoTranslateChange,
  isDark,
}) => {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDark
          ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
          : 'bg-slate-50/80 border-slate-200/80 backdrop-blur-md'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Voice Speed (গতি)</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {speed.toFixed(2)}x
            </span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              id="slider-speed"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            {/* Quick Speed Presets */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {SPEED_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSpeedChange(p)}
                  className={`text-[11px] px-2 py-1 rounded-lg border font-mono transition-all ${
                    Math.abs(speed - p) < 0.01
                      ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-xs'
                      : isDark
                      ? 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pitch Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pitch Tuning (পিচ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {pitch > 0 ? `+${pitch}` : pitch} semitones
              </span>
              {pitch !== 0 && (
                <button
                  type="button"
                  onClick={() => onPitchChange(0)}
                  title="Reset Pitch to Default"
                  className="text-slate-400 hover:text-slate-200 p-0.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              id="slider-pitch"
              min="-8"
              max="8"
              step="1"
              value={pitch}
              onChange={(e) => onPitchChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-8 Deep</span>
              <span>0 Natural</span>
              <span>+8 High</span>
            </div>
          </div>
        </div>
      </div>

      {/* English to Bengali Auto Conversion Feature */}
      {language === 'bn' && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                English Text to Natural Bengali Speech
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type in English or Bengali • AI converts English into fluent Bangladeshi speech
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              id="toggle-auto-translate"
              checked={autoTranslate}
              onChange={(e) => onAutoTranslateChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5.5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      )}
    </div>
  );
};
