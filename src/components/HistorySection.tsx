import React from 'react';
import { GeneratedVoiceRecord } from '../types';
import { Play, Download, Trash2, Clock } from 'lucide-react';
import { downloadAudioFile } from '../utils/audioUtils';

interface HistorySectionProps {
  history: GeneratedVoiceRecord[];
  onSelectRecord: (record: GeneratedVoiceRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
  activeId?: string;
  isDark: boolean;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord,
  activeId,
  isDark,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-8 pt-6 border-t border-slate-800/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Recent Voice Generations ({history.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {history.map((item) => {
          const isActive = item.id === activeId;
          const displayDate = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectRecord(item)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/40'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRecord(item);
                  }}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs sm:text-sm truncate">
                      {item.voiceName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-mono">
                      {item.emotionId}
                    </span>
                    <span className="text-[10px] text-slate-500">{displayDate}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.bengaliText || item.spokenText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="Download Audio"
                  onClick={(e) => {
                    e.stopPropagation();
                    const filename = `lyuna-voice-${item.voiceId}-${Date.now()}.wav`;
                    downloadAudioFile(item.audioUrl, filename);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRecord(item.id);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
